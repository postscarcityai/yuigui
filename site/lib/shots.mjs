// Screenshots attached to a progress entry, see BUILD-IN-PUBLIC.md.
// Entries carry "images": [{ src, alt }]. The older single "image"/"imageAlt" pair still works.
export function shotsOf(e) {
  if (e.images?.length) return e.images;
  return e.image ? [{ src: e.image, alt: e.imageAlt || e.title }] : [];
}
