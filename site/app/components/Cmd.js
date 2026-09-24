"use client";
import { useState } from "react";

// One terminal command with a copy button (the /start page).
export default function Cmd({ children }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(children).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
  return (
    <div className="cmd">
      <code>{children}</code>
      <button type="button" onClick={copy} aria-label={`Copy: ${children}`}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}
