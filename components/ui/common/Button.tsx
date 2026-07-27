"use client";

import { ButtonHTMLAttributes } from "react";
import { styles } from "@/components/ui/styles";

type Variant = keyof typeof styles.button.variant;
type Size = keyof typeof styles.button.size;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    styles.button.base,
    styles.button.variant[variant],
    styles.button.size[size],
    fullWidth ? styles.button.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}
