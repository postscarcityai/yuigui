// The rows of "What works so far" on /web (SITE-156). content/web-story.json lists the landed stories; the title
// and the link come from the story's progress.json entry, so a new story is one row there.
import { slug } from "./slug.mjs";

export function webStory(story, log) {
  return story.rows.map((r) => {
    const entry = log.find((e) => [].concat(e.card).includes(r.card));
    return { ...r, title: entry ? entry.title : r.label, href: entry ? `/progress#${slug(entry.title)}` : "/progress" };
  });
}
