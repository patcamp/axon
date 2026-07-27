// Centralized Tailwind class constants. Components reference these
// instead of writing className strings inline, so the visual language
// lives in one place.

export const styles = {
  button: {
    base: "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
    variant: {
      primary: "bg-accent text-white hover:bg-accent-soft",
      outline: "border border-ink-700 text-slate-200 hover:border-accent hover:text-accent",
      ghost: "text-ink-600 hover:text-slate-300",
    },
    size: {
      none: "",
      sm: "px-3 py-1.5",
      md: "px-4 py-2.5",
      lg: "px-4 py-3",
    },
    fullWidth: "w-full",
  },

  textField: {
    base: "w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-ink-600 focus:border-accent focus:outline-none",
  },

  sidebar: {
    // Mobile: a fixed off-canvas drawer that slides in/out via transform.
    // sm and up: reverts to a normal static column, always visible.
    container: (isOpen: boolean) =>
      "safe-top safe-bottom fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-800 bg-ink-950 transition-transform duration-200 ease-in-out sm:static sm:z-auto sm:w-60 sm:translate-x-0 sm:transition-none " +
      (isOpen ? "translate-x-0" : "-translate-x-full"),
    backdrop: "fixed inset-0 z-30 bg-black/50 sm:hidden",
    header: "flex items-center justify-between gap-2 px-4 py-4",
    headerDot: "h-2.5 w-2.5 rounded-full bg-accent",
    headerTitle: "text-sm font-medium tracking-wide text-slate-200",
    headerLeft: "flex items-center gap-2",
    mobileCloseButton: "text-ink-600 hover:text-slate-300 sm:hidden",
    newButtonWrap: "p-3 pt-0",
    nav: "space-y-0.5 px-2 pb-2",
    navItem: (active: boolean) =>
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm " +
      (active
        ? "bg-ink-800 text-slate-100"
        : "text-ink-600 hover:bg-ink-900 hover:text-slate-300"),
    listSection: "flex-1 overflow-y-auto border-t border-ink-800 px-2 py-3",
    sectionLabel: "mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-ink-600",
    emptyText: "px-2 text-xs text-ink-600",
    rowList: "space-y-1",
    row: (active: boolean) =>
      "group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm " +
      (active
        ? "bg-ink-800 text-slate-100"
        : "text-ink-600 hover:bg-ink-900 hover:text-slate-300"),
    rowLabel: "truncate",
    rowLabelWithIcon: "flex items-center gap-2 truncate",
    rowDelete: "ml-2 hidden text-ink-600 hover:text-red-400 group-hover:inline",
    backButton: "mb-2 flex items-center gap-1 px-2 text-xs text-ink-600 hover:text-slate-300",
    footer: "flex w-full items-center gap-2 border-t border-ink-800 p-3 text-left hover:bg-ink-900",
    avatar:
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white",
    email: "truncate text-xs text-ink-600",
  },

  chat: {
    main: "safe-top mx-auto flex h-full w-full max-w-2xl flex-col",
    header: "flex items-center gap-3 border-b border-ink-800 px-4 py-4 sm:px-5",
    menuButton: "text-ink-600 hover:text-slate-300 sm:hidden",
    projectBadge: "rounded-full border border-ink-700 px-2 py-0.5 text-[11px] text-ink-600",
    status: "ml-auto font-mono text-xs text-ink-600",
    scrollArea: "chat-scroll flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-5",
    emptyState: "mt-24 text-center text-sm text-ink-600",
    rowUser: "flex justify-end",
    rowAssistant: "flex justify-start",
    bubbleUser:
      "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white sm:max-w-[85%]",
    bubbleAssistant:
      "max-w-[88%] rounded-2xl rounded-bl-sm bg-ink-800 px-4 py-2.5 text-sm text-slate-100 sm:max-w-[85%]",
    cursor: "inline-block h-4 w-2 animate-pulse bg-accent-soft",
    composerWrap:
      "border-t border-ink-800 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5",
    composerRow: "flex items-end gap-2",
    textarea:
      "max-h-40 flex-1 resize-none rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-base text-slate-100 placeholder:text-ink-600 focus:border-accent focus:outline-none sm:text-sm",
    titleWrap: "relative min-w-0",
    titleButton:
      "flex max-w-[45vw] items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white sm:max-w-xs",
    titleInput:
      "max-w-[45vw] rounded-md border border-ink-700 bg-ink-800 px-2 py-1 text-sm text-slate-100 focus:border-accent focus:outline-none sm:max-w-xs",
  },

  // Shared dropdown-menu look, used by the chat title menu and the
  // account popup — anchor a `relative` wrapper, then position one of
  // panelBelow/panelAbove off it.
  menu: {
    backdrop: "fixed inset-0 z-40",
    panel: "absolute z-50 w-56 rounded-xl border border-ink-700 bg-ink-900 p-1 shadow-lg",
    panelBelow: "left-0 top-full mt-1",
    panelAbove: "left-0 bottom-full mb-2",
    header: "truncate px-3 py-2 text-xs text-ink-600",
    divider: "my-1 border-t border-ink-800",
    item: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40",
    itemDanger:
      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-ink-800",
    submenu: "ml-2 mt-1 space-y-0.5 border-l border-ink-700 pl-2",
  },

  dialog: {
    overlay: "fixed inset-0 z-10 flex items-center justify-center bg-black/60 px-5",
    panel: "w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6",
    title: "mb-4 text-lg font-semibold text-slate-100",
    label: "mb-1 block text-xs text-ink-600",
    textarea:
      "mb-4 w-full resize-none rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-ink-600 focus:border-accent focus:outline-none",
    error: "mb-3 text-sm text-red-400",
    actions: "flex justify-end gap-2",
  },

  code: {
    page: "mx-auto h-full max-w-2xl overflow-y-auto px-5 py-8 sm:py-12",
    backLink: "mb-6 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-slate-300",
    heading: "mb-1 text-xl font-semibold text-slate-100",
    subheading: "mb-8 text-sm text-ink-600",
    card: "mb-6 rounded-2xl border border-ink-700 bg-ink-900 p-6",
    cardTitle: "mb-1 text-sm font-medium text-slate-200",
    cardBody: "mb-4 text-sm text-ink-600",
    tokenBox:
      "mb-3 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-ink-800 px-4 py-3 font-mono text-sm text-slate-100",
    tokenValue: "truncate",
    tokenWarning: "text-xs text-accent-soft",
    error: "mt-3 text-sm text-red-400",
    list: "space-y-2",
    listRow:
      "flex items-center justify-between gap-3 rounded-xl border border-ink-700 px-4 py-3 text-sm",
    listMeta: "text-xs text-ink-600",
    emptyText: "text-sm text-ink-600",
    stepList: "mb-4 list-decimal space-y-2 pl-5 text-sm text-ink-600",
    originBox:
      "flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3 font-mono text-sm text-slate-100",
  },

  auth: {
    wrap: "flex h-dvh items-center justify-center px-5",
    panel: "w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-900 p-6",
    headerRow: "mb-6 flex items-center gap-3",
    heading: "mb-4 text-lg font-semibold text-slate-100",
    fieldGroup: "space-y-3",
    error: "mt-3 text-sm text-red-400",
    info: "mt-3 text-sm text-accent-soft",
    toggle: "mt-3 w-full text-center text-xs text-ink-600 hover:text-slate-300",
  },
};
