"use client";

import { InputHTMLAttributes } from "react";
import { styles } from "@/components/ui/styles";

export default function TextField({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[styles.textField.base, className].filter(Boolean).join(" ")} {...props} />;
}
