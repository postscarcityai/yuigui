import "./globals.css";
import Script from "next/script";
import { Nunito } from "next/font/google";
import Nav from "./components/Nav";
import GetYui from "./components/GetYui";
import NotOnEmbed from "./components/NotOnEmbed";

const GA_ID = "G-VYENQDDF00";
// Apple devices get SF Rounded through ui-rounded, like the app. Everyone else gets Nunito.
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });
const themeInit = `try{var t=localStorage.getItem("yui-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;

export const metadata = {
  metadataBase: new URL("https://www.yuigui.com"),
  title: "Yui | a generative user interface",
  description: "Meet Yui, a generative user interface. Your agent draws the screen instead of replying in walls of text: a timer, a form, a choice. A native iPhone app, built for Hermes first.",
  openGraph: { title: "Meet Yui, a generative user interface.", description: "Your agent draws the screen: a timer, a form, a choice. A native iPhone app, built for Hermes first.", url: "https://www.yuigui.com", siteName: "Yui", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF9F0" },
    { media: "(prefers-color-scheme: dark)", color: "#231D33" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
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
            // An invite link's code never reaches analytics (YUI-56), nor a Mini App's screen (INT-4).
            gtag('config', '${GA_ID}', location.pathname.indexOf('/i/') === 0
              ? { page_location: location.origin + '/i/', page_referrer: document.referrer.split('/i/')[0] }
              : location.pathname === '/tg' ? { page_location: location.origin + '/tg', page_referrer: '' } : {});
          `}
        </Script>
        <NotOnEmbed><Nav /></NotOnEmbed>
        <main className="wrap">{children}</main>
        <NotOnEmbed>
          <GetYui />
          <footer className="wrap foot">
            <img src="/brand/yui-wordmark-coral.png" alt="" width="31" height="20" />
            <span>Built in public at yuigui.com</span> | <a href="/business">Business</a> | <a href="/thoughts">Thoughts</a> | <a href="https://github.com/postscarcityai/yuigui">GitHub</a> | <a href="/help">Help</a> | <a href="/privacy">Privacy</a>
          </footer>
        </NotOnEmbed>
      </body>
    </html>
  );
}
