import Playground from "./Playground";
import Benchmark from "./Benchmark";

export const metadata = { title: "Playground | Yui" };

export default function Page() {
  return (
    <>
      <div className="eyebrow">Phase 1 | Yui Lines v0</div>
      <h1>Playground</h1>
      <p className="lede">
        The agent never writes UI code. It sends one short line per component, and the app renders a
        prebuilt preset. Pick a screen, edit the line, or press Stream to watch it render as the model types.
        Grammar: <a href="/yl">Yui Lines spec</a>.
      </p>
      <Playground />
      <Benchmark />
    </>
  );
}
