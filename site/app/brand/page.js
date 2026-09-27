// The brand lab (round 1): logo explorations from Chris's paper sketch. Unlisted: not in the nav,
// not in the sitemap, and robots are asked not to index it while we are still deciding.
// Sources: lib/brand (the mark, palettes, shaders, scenes), brand/lab (brief, journal, fal), videos/13-brand.
import { existsSync } from "node:fs";
import { join } from "node:path";
import BrandLab from "./BrandLab";
import lab from "../../public/brand/lab/lab.json";

export const metadata = {
  title: "Brand lab | Yui",
  description: "Round 1 of finding Yui's mark: six pieces of cut paper, explored in ink, stone, celadon, cloth and foil. Pick what you like.",
  robots: { index: false, follow: false },
};

// A film shows once its file is in public/ (videos/13-brand/build.sh puts it there).
const have = (src) => existsSync(join(process.cwd(), "public", src));

export default function Page() {
  return <BrandLab films={lab.films.filter((f) => have(f.src))} models={lab.models} />;
}
