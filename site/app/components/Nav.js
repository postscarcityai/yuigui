import Link from "next/link";

const links = [
  ["/", "Overview"],
  ["/roadmap", "Roadmap"],
  ["/progress", "Progress"],
  ["/plan", "Plan"],
  ["/deck", "Deck"],
  ["/mockups", "Mockups"],
  ["/playground", "Playground"],
  ["/yl", "YL spec"],
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="brand"><span className="dot" />Yui</Link>
        <nav>
          {links.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
