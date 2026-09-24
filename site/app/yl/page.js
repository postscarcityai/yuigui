import DocShell from "../components/DocShell";
import QuickStart from "./QuickStart";

export const metadata = {
  title: "Yui Lines spec | Yui",
  description: "Yui Lines, the screen language: one short line per element. A five-line quick start, then every preset and its options.",
};

export default function YLSpec() {
  return (
    <>
      <QuickStart />
      <DocShell slug="yl" eyebrow={<>Developers | Yui Lines spec | rendered from spec/YL.md | <a href="/playground">try it in the playground</a> | <a href="/developers/benchmark">token benchmark</a></>} />
    </>
  );
}
