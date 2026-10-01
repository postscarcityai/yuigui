// "What works so far" under the sign in (SITE-156): one row per landed web story, the same screen on a phone and
// in a browser. Rows come from content/web-story.json (lib/webstory.mjs). Both themes are drawn and CSS shows the
// one in use; a theme with no shot falls back to the other.
function Pair({ shots, alt, kind }) {
  const light = shots?.light || shots?.dark;
  const dark = shots?.dark || shots?.light;
  if (!light) return null;
  return (
    <>
      <img className={`ws-img ws-${kind} ws-light`} src={light} alt={alt} loading="lazy" />
      <img className={`ws-img ws-${kind} ws-dark`} src={dark} alt="" loading="lazy" aria-hidden="true" />
    </>
  );
}

export default function WebStory({ rows }) {
  if (!rows?.length) return null;
  return (
    <section className="web-story" aria-labelledby="ws-h">
      <h2 id="ws-h">What works so far</h2>
      <ol className="ws-rows">
        {rows.map((r) => (
          <li key={r.card} className="ws-row" data-card={r.card}>
            <div className="ws-text">
              <h3>{r.label}</h3>
              <p>{r.say}</p>
              <a href={r.href}>{r.title} →</a>
            </div>
            <figure className="ws-shots">
              <div className="ws-cell"><Pair shots={r.phone} alt={`${r.label} on a phone`} kind="phone" /><figcaption>Phone</figcaption></div>
              <div className="ws-cell"><Pair shots={r.browser} alt={`${r.label} in a browser`} kind="browser" /><figcaption>Browser</figcaption></div>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
