// YUI-286: every text field on /web either has the shared FieldMic or sits on this exempt list, so "never make people type"
// is a rule and a new field cannot slip past it. A field is named by its file and its id, data-testid or aria-label.
// The list is the one in docs/specs/web-parity.md ("Fields without a mic on purpose").
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const APP = join(dirname(fileURLToPath(import.meta.url)), "../../app");
const WEB = join(APP, "web");
// YUI-290: the preset renderers draw their own fields on /web (the "Type your own" box on choose and pick, the form's fields,
// the sketch note); they live in app/playground, so the audit reads these files too.
const PRESETS = ["presets.js", "science.js"].map((f) => join(APP, "playground", f));

// Fields with a mic: the audit also checks a FieldMic follows the field in the same file.
export const WITH_MIC = [
  "AddAgent.js#ag-name", "EditAgent.js#ag-rename", "Groups.js#gr-name", "GroupSettings.js#gr-set-name",
  "DrawerChats.js#Chat name", "DrawerChats.js#Search chats", "Palette.js#palette-input",
  "SettingsPanel.js#st-feedback",
  "presets.js#Type your own", "presets.js#Comment on this frame", "presets.js#What should change",
  "presets.js#form-${nid}-${f.key}",
];

// Fields without one, each with the reason.
export const EXEMPT = {
  "SettingsPanel.js#st-key": "secret: an API key is never spoken",
  "SettingsPanel.js#st-search": "secret: a search key is never spoken",
  "SettingsPanel.js#st-pair": "a pairing code, not words",
  "SettingsPanel.js#st-base": "a server address, not words",
  "SettingsPanel.js#st-model": "a model id, not words",
  "SettingsKeys.js#g-why-${k.id}": "key vault form: the vault pages carry secrets, no mic anywhere on them",
  "SettingsKeys.js#kv-secret": "secret: a vault key is never spoken",
  "SettingsKeys.js#kv-name": "key vault form: no mic on the vault pages",
  "WebApp.js#web-code": "a pairing or sign in code, not words",
  "ControlsPanel.js#controls-editor": "code editor",
  "ControlsPanel.js#controls-time-cron": "cron expression",
  "ControlsPanel.js#controls-time-at": "a time picker",
  "ComposerParts.js#${testId}-input": "hidden file picker, not a text field",
  "GroupThread.js#group-field": "the composer: the bar's own mic and hands free are the voice way in",
  "ThreadView.js#Message ${agent?.name || \"Yui\"}": "the composer: the bar's own mic",
  "StageLayer.js#Message ${agent.name}": "the composer: the bar's own mic",
  "presets.js#Voice answer": "the voice field draws its own mic button, and says what it hears into the field",
  "presets.js#Type it": "the mic preset's typing fallback, shown only where there is no speech recognition (a FieldMic would be hidden there too)",
  "presets.js#range": "a slider, not a text field",
  "presets.js#file": "a file picker, not a text field",
  "presets.js#camera-file": "a file picker, not a text field",
  "science.js#range": "a slider, not a text field",
};

// Opening tags of every <input> and <textarea> in app/web, from the "<" to the ">" outside braces.
export function fields(files = [...readdirSync(WEB).filter((n) => n.endsWith(".js")).sort().map((n) => join(WEB, n)), ...PRESETS]) {
  const out = [];
  for (const path of files) {
    const f = basename(path);
    const src = readFileSync(path, "utf8");
    for (const m of src.matchAll(/<(input|textarea)\b/g)) {
      let i = m.index, depth = 0;
      for (; i < src.length; i++) {
        const c = src[i];
        if (c === "{") depth++; else if (c === "}") depth--; else if (c === ">" && depth === 0 && src[i - 1] !== "=") break;
      }
      const tag = src.slice(m.index, i + 1);
      const attr = (n) => { const r = tag.match(new RegExp(`\\b${n}=(?:"([^"]*)"|\\{\`([^\`]*)\`\\}|\\{([^}]*)\\})`)); return r && (r[1] ?? r[2] ?? r[3]); };
      const name = attr("id") || attr("data-testid") || attr("aria-label") || attr("placeholder") || attr("type") || "?";
      out.push({ file: f, name: name.replace(/^"|"$/g, ""), key: `${f}#${name.replace(/^"|"$/g, "")}`, after: src.slice(i, i + 700) });
    }
  }
  return out;
}

export function audit(list = fields()) {
  const bad = [];
  for (const x of list) {
    if (WITH_MIC.includes(x.key)) { if (!/<FieldMic\b/.test(x.after)) bad.push(`${x.key}: listed with a mic, but no FieldMic follows it`); }
    else if (!(x.key in EXEMPT)) bad.push(`${x.key}: no FieldMic and not on the exempt list`);
  }
  return bad;
}
