"use client";
// The anonymous id this browser votes with (SITE-89): kept in localStorage, never tied to a name or email.
const K = "yui-voter";
export function voterId() {
  try {
    let v = localStorage.getItem(K);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(K, v); }
    return v;
  } catch { return null; }
}
