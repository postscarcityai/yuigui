// When a chat message was sent (SITE-99, the site's half of YUI-202; the rule is spec/YL.md, Message times).
// Every message the chat keeps carries `at`, epoch milliseconds. The visitor's own time zone draws it:
// the record shows a quiet time under each group of messages and a day divider where the day changes,
// and the stage shows its answer's time in small type. A message with no `at` (a chat kept from before
// this) shows nothing and never breaks a group.
const DAY = 86400000;
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// "9:41 AM", in the visitor's locale and zone.
export const clock = (at) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// "Today", "Yesterday", then "Mon 28 Sep" (the year joins it when it is not this year).
export function dayLabel(at, now = Date.now()) {
  const d = new Date(at);
  const gap = Math.round((startOfDay(new Date(now)) - startOfDay(d)) / DAY);
  if (gap === 0) return "Today";
  if (gap === 1) return "Yesterday";
  const wk = WEEK[d.getDay()], mo = MONTH[d.getMonth()];
  const yr = d.getFullYear() === new Date(now).getFullYear() ? "" : ` ${d.getFullYear()}`;
  return `${wk} ${d.getDate()} ${mo}${yr}`;
}

// One line for the stage: "9:41 AM" today, "Yesterday 9:41 AM", "Mon 28 Sep, 9:41 AM" before that.
export function stageTime(at, now = Date.now()) {
  if (!at) return "";
  const day = dayLabel(at, now);
  return day === "Today" ? clock(at) : day === "Yesterday" ? `Yesterday ${clock(at)}` : `${day}, ${clock(at)}`;
}

// What the record draws besides the messages. Returns one entry per message index:
//   { day }   a divider goes before this message (the first dated message, and each new day)
//   { time }  the quiet time goes under this message (the last of a run from the same side on the same day)
// Cards (Opened, Stopped) have no time of their own and do not break a run.
export function stamps(msgs, now = Date.now()) {
  const out = msgs.map(() => ({}));
  let lastDay = null, run = -1, runSide = null;
  msgs.forEach((m, i) => {
    if (!m.at) return;
    const key = startOfDay(new Date(m.at));
    if (key !== lastDay) { out[i].day = dayLabel(m.at, now); lastDay = key; run = -1; }
    if (m.card) return;
    if (run >= 0 && runSide !== m.role) run = -1;
    if (run >= 0) delete out[run].time;
    runSide = m.role;
    out[i].time = clock(m.at);
    run = i;
  });
  return out;
}
