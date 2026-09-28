import { notFound } from "next/navigation";
import DocShell from "../../components/DocShell";
import { specDocs } from "../../../lib/spec.mjs";
import { pageMeta } from "../../../lib/og/meta.mjs";

export const dynamicParams = false;

// Specs that had no page of their own before SITE-15. /yl, /channel and /reactions keep theirs.
const here = () => specDocs().filter((d) => d.href === `/developers/${d.slug}`);

export function generateStaticParams() {
  return here().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = here().find((x) => x.slug === slug);
  return pageMeta({ path: `/developers/${slug}`, key: "/developers/specs", title: d ? `${d.label} spec | Yui` : "Specs | Yui", description: d?.blurb });
}

// A brag film at the top of the spec it shows (SITE-62).
const FILMS = { music: "film-jam" };

export default async function SpecDoc({ params }) {
  const { slug } = await params;
  const d = here().find((x) => x.slug === slug);
  if (!d) notFound();
  return (
    <DocShell
      slug={slug}
      film={FILMS[slug]}
      eyebrow={<><a href="/developers/specs">Specs</a> | {d.label} | rendered from spec/{slug.toUpperCase()}.md | <a href={`https://github.com/postscarcityai/yuigui/blob/main/spec/${slug.toUpperCase()}.md`}>on GitHub</a></>}
    />
  );
}
