import "./globals.css";
import Script from "next/script";
import Nav from "./components/Nav";

const GA_ID = "G-VYENQDDF00";

export const metadata = {
  title: "Yui | the agent hub",
  description: "A mobile agent hub. Your agent talks, and when words are not enough it builds the screen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Nav />
        <main className="wrap">{children}</main>
        <footer className="wrap foot">Yui | yuigui.com | build hub, updated as we ship | <a href="/privacy">Privacy</a></footer>
      </body>
    </html>
  );
}
