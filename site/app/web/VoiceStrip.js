// "Say it, do not type it" under the sign in (SITE-186): four fields with a mic, the phone app and the web side by
// side. Shots are the ones already on /progress. Both themes are drawn and CSS shows the one in use; a theme with
// no shot falls back to the other. A tile with no phone shot shows the web alone.
const TILES = [
  { id: "form", say: "Say the answers to a form. Each field fills and wears a small mic.",
    app: ["feedback-voice-fill-light.jpg", "feedback-voice-fill-dark.jpg"], web: ["yui283-web-voice-filled-light.jpg", "yui283-web-voice-filled-dark.jpg"] },
  { id: "group", say: "Group chats get the bar too. Hold the mic and talk to the group.",
    app: ["yui-group-bar-bar-light.webp", "yui-group-bar-bar-dark.webp"], web: ["yui284-web-group-bar-light.jpg", "yui284-web-group-bar-dark.jpg"] },
  { id: "name", say: "Name a group by voice. Tap, say it, tap again.",
    app: ["yui-group-bar-name-light.webp", "yui-group-bar-name-dark.webp"], web: ["yui284-web-group-name-light.jpg", "yui284-web-group-name-dark.jpg"] },
  { id: "search", say: "Say who to add, or what to find. Names and search have a mic.",
    web: ["yui285-web-palette-light.jpg", "yui285-web-palette-dark.jpg"] },
];

function Shot({ pair, label, alt }) {
  const [light, dark] = pair;
  return (
    <div className="vs-cell">
      <img className="vs-img vs-light" src={`/progress/${light}`} alt={alt} loading="lazy" />
      <img className="vs-img vs-dark" src={`/progress/${dark}`} alt="" loading="lazy" aria-hidden="true" />
      <span className="vs-cap">{label}</span>
    </div>
  );
}

export default function VoiceStrip() {
  return (
    <section className="voice-strip" aria-labelledby="vs-h">
      <h2 id="vs-h">Say it, do not type it</h2>
      <ul className="vs-tiles">
        {TILES.map((t) => (
          <li key={t.id} className="vs-tile" data-tile={t.id}>
            <div className="vs-shots">
              {t.app && <Shot pair={t.app} label="Phone" alt={`${t.say} On the phone.`} />}
              <Shot pair={t.web} label="Web" alt={`${t.say} On the web.`} />
            </div>
            <p>{t.say}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
