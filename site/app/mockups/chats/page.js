// YUI-169 step 1: a clickable mock of several chats per agent, listed in the drawer.
// Drawn by hand in the browser, not the app: the app has no chats yet. Spec: spec/CHATS.md.
import Link from "next/link";
import ChatsMock from "./ChatsMock";
import { pageMeta } from "../../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/mockups/chats",
  title: "Chats mock | Yui",
  description: "A clickable mock of several chats per agent in Yui: New chat, the chat list in the drawer, rename, and delete that asks first. Not built yet.",
});

export default async function ChatsMockPage({ searchParams }) {
  const q = await searchParams;
  const only = q?.theme === "light" || q?.theme === "dark" ? q.theme : null;
  const drawer = q?.drawer === "1";
  return (
    <main className="cm-page">
      <p className="cm-kicker">Mock, not built yet</p>
      <h1>Several chats with one agent</h1>
      <p className="cm-lede">
        Start a new chat when the subject changes. Your chats sit in the drawer, newest first, above your pinned screens.
        Tap around: open the drawer, start a chat, rename one, delete one.
      </p>
      <p className="cm-links">
        <Link href="/developers/chats">Read the spec</Link>
        <Link href="/board#YUI-169">The card</Link>
      </p>
      <div className="cm-pair">
        {(only ? [only] : ["light", "dark"]).map((t) => (
          <figure key={t}>
            <ChatsMock theme={t} startOpen={only ? drawer : drawer || t === "dark"} />
            <figcaption>{t === "light" ? "Light" : "Dark"}</figcaption>
          </figure>
        ))}
      </div>
      <ul className="cm-notes">
        <li><b>New chat</b> opens an empty chat. It is saved only once you say something, and your first ask becomes its title.</li>
        <li><b>Hold a chat</b> (or tap its dots) to rename or delete it. Delete asks first; your agent still remembers what it learned.</li>
        <li><b>Screens stay with the agent.</b> Pinned screens and screens 2 to 12 are the same in every chat.</li>
      </ul>
    </main>
  );
}
