// Anchor ids for progress log entries. The board export links to /progress#<slug>.
export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
