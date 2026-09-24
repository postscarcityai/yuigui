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
      <DocShell
        slug="yl"
        eyebrow="Developers | Yui Lines spec | rendered from spec/YL.md"
        links={[["/playground", "Try it in the playground"], ["/channel", "Channel guide"], ["/developers/benchmark", "Token benchmark"]]}
      />
    </>
  );
}
