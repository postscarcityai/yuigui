// Where a finished take goes (YUI-246). The music presets draw in the site chat, the playground and the web app;
// only the web app has a signed-in thread to upload to, so it registers an uploader here and a take sends its
// event. With no uploader the take stays on the page as two downloads. The twin of the app's
// `\.yuiMedia` environment (TakeUpload.fields): upload, then a signed link good for 7 days.
import { mediaPath } from "./compose.mjs";

let host = null;
export const takeHost = () => host;
export function setTakeHost(next) { host = next; return () => { if (host === next) host = null; }; }

// The uploader a thread registers: bytes up to the one private bucket, back as a signed link.
export function relayTakeHost({ relay, userId, agentId, uuid = () => crypto.randomUUID() }) {
  return {
    // The bytes up to the one private bucket and back as the storage path (a camera photo is sent as its path, like the composer's).
    async uploadPath(blob, type, ext) {
      const path = mediaPath(userId, agentId, uuid(), ext);
      await relay.upload({ path, blob, type });
      return path;
    },
    async upload(blob, type, ext) {
      const path = mediaPath(userId, agentId, uuid(), ext);
      await relay.upload({ path, blob, type });
      const link = await relay.sign(path);
      if (!link) throw new Error("no_link");
      return link;
    },
  };
}
