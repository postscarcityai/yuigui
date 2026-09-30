import "./globals.css";
import Script from "next/script";
import { Nunito } from "next/font/google";
import ChatFab from "./components/ChatFabLoader";
import Nav from "./components/Nav";
import GetYui from "./components/GetYui";
import NotOnEmbed from "./components/NotOnEmbed";
// No announcement bar for now (Chris, Sep 28: the 0.5.0 bar is off). components/TopBar.js is kept for the next one.
import { chatOn } from "../lib/chat/config.mjs";

const GA_ID = "G-VYENQDDF00";
// Apple devices get SF Rounded through ui-rounded, like the app. Everyone else gets Nunito.
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });
const themeInit = `try{var t=localStorage.getItem("yui-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;
// A closed announcement stays closed, with no flash on the next load (components/TopBar.js).
const topbarInit = `try{if(localStorage.getItem("yui-topbar-0.5.0-crew"))document.documentElement.dataset.topbar="off"}catch(e){}`;

export const metadata = {
  metadataBase: new URL("https://www.yuigui.com"),
  title: "Yui | a generative user interface",
  description: "Meet Yui, a generative user interface. Your agent draws the screen instead of replying in walls of text: a timer, a form, a choice. A native iPhone app for the agents you already run, in alpha on TestFlight.",
  openGraph: { title: "Meet Yui, a generative user interface.", description: "Your agent draws the screen: a timer, a form, a choice. A native iPhone app for the agents you already run, in alpha on TestFlight.", url: "https://www.yuigui.com", siteName: "Yui", type: "website" },
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
        <script dangerouslySetInnerHTML={{ __html: themeInit + topbarInit }} />
      </head>
      <body>
        {/* Google tag (gtag.js). It waits for the page to finish loading so its 170KB never slows the first paint (SITE-41). */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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
            <img src="/brand/yui-wordmark-coral-156.webp" alt="" width="31" height="20" />
            <span>Made by <a href="https://postscarcity.ai">PostScarcity AI</a>, built in public at yuigui.com</span> | <a href="/crew">The crew</a> | <a href="/business">Business</a> | <a href="/thoughts">Thoughts</a> | <a href="https://github.com/postscarcityai/yuigui">GitHub</a> | <a href="/help">Help</a> | <a href="/privacy">Privacy</a>
          </footer>
          {/* SITE-64: Yui in the bubble, only once its keys are set. */}
          {chatOn() && <ChatFab />}
        </NotOnEmbed>
      </body>
    </html>
  );
}
