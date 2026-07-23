import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function ActionButton({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ActionButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-lg font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
      : "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:border-emerald-200 hover:text-emerald-700";

  return (
    <button
      type={type}
      className={`${base} ${styles} ${className}`.trim()}
      {...props}
    />
  );
}