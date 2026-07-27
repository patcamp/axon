import { supabase } from "@/lib/supabase";

// Reads from the "budget" app's tables in this same Supabase project.
// Read-only, and only the fields the live Budget-project summary needs —
// not a full mirror of budget/lib/types.ts. RLS on these tables already
// scopes every query to the signed-in user (auth.uid() = user_id).

type PayPeriod = {
  id: string;
  start_date: string;
  end_date: string;
  paycheck_amount: number;
  gross_amount: number;
  roth_401k: number;
  brokerage_amount: number;
  savings_amount: number;
  notes: string | null;
};

type Category = {
  id: string;
  name: string;
  budget_per_period: number;
};

type Expense = {
  id: string;
  category_id: string;
  amount: number;
  description: string | null;
  expense_date: string;
};

async function getLatestPayPeriod(): Promise<PayPeriod | null> {
  const { data } = await supabase
    .from("pay_periods")
    .select("id, start_date, end_date, paycheck_amount, gross_amount, roth_401k, brokerage_amount, savings_amount, notes")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as PayPeriod | null) ?? null;
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("id, name, budget_per_period")
    .eq("archived", false)
    .order("sort_order", { ascending: true });
  return (data as Category[] | null) ?? [];
}

async function getExpensesForPeriod(periodId: string): Promise<Expense[]> {
  const { data } = await supabase
    .from("expenses")
    .select("id, category_id, amount, description, expense_date")
    .eq("pay_period_id", periodId)
    .order("expense_date", { ascending: true });
  return (data as Expense[] | null) ?? [];
}

export async function buildBudgetContext(): Promise<string> {
  const period = await getLatestPayPeriod();
  if (!period) {
    return "The user has no pay periods set up yet in the budget app.";
  }

  const [categories, expenses] = await Promise.all([
    getCategories(),
    getExpensesForPeriod(period.id),
  ]);

  const spentByCategory = new Map<string, number>();
  for (const e of expenses) {
    spentByCategory.set(e.category_id, (spentByCategory.get(e.category_id) ?? 0) + Number(e.amount));
  }

  const categoryLines = categories.map((c) => {
    const spent = spentByCategory.get(c.id) ?? 0;
    const remaining = Number(c.budget_per_period) - spent;
    return `| ${c.name} | $${Number(c.budget_per_period).toFixed(2)} | $${spent.toFixed(2)} | $${remaining.toFixed(2)} |`;
  });

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const expenseLines = expenses.map(
    (e) =>
      `- ${e.expense_date}: ${categoryById.get(e.category_id) ?? "Unknown"} — $${Number(e.amount).toFixed(2)}${e.description ? ` (${e.description})` : ""}`
  );

  return `### Current pay period: ${period.start_date} to ${period.end_date}

Paycheck amount: $${Number(period.paycheck_amount).toFixed(2)}
Gross pay: $${Number(period.gross_amount).toFixed(2)}
Roth 401k: $${Number(period.roth_401k).toFixed(2)}
Brokerage: $${Number(period.brokerage_amount).toFixed(2)}
Savings: $${Number(period.savings_amount).toFixed(2)}
${period.notes ? `Notes: ${period.notes}` : ""}

### Category budget vs. actual
| Category | Budget | Spent | Remaining |
|---|---|---|---|
${categoryLines.join("\n")}

### Individual expenses this period
${expenseLines.length > 0 ? expenseLines.join("\n") : "No expenses logged yet this period."}`;
}
