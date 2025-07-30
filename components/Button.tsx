import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, ...rest }: ButtonProps) {
  return (
    <button className="px-4 py-2 bg-indigo-600 text-white rounded" {...rest}>
      {children}
    </button>
  );
}
