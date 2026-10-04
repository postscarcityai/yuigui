import DocShell from "../components/DocShell";
import QuickStart from "./QuickStart";
import VoiceFillDemo from "./VoiceFillDemo";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/yl",
  title: "Yui Lines spec | Yui",
  description: "Yui Lines, the screen language: one short line per element. A five-line quick start, then every preset and its options.",
});

export default function YLSpec() {
  return (
    <>
      <QuickStart />
      <VoiceFillDemo />
      <DocShell
        slug="yl"
        film="film-presets-not-code"
        eyebrow="Developers | Yui Lines spec | rendered from spec/YL.md"
        links={[["/playground", "Try it in the playground"], ["/channel", "Channel guide"], ["/developers/benchmark", "Token benchmark"]]}
      />
    </>
  );
}
