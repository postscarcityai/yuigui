import "./globals.css";
import Nav from "./components/Nav";

export const metadata = {
  title: "Yui | the agent hub",
  description: "A mobile agent hub. Your agent talks, and when words are not enough it builds the screen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="wrap">{children}</main>
        <footer className="wrap foot">Yui | yuigui.com | build hub, updated as we ship</footer>
      </body>
    </html>
  );
}
