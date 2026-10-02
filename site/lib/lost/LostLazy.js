"use client";
// YUI-272: the 404 scene is its own chunk. Next ships the root not-found boundary with every page, so a static
// import here put the whole ASCII sketchbook (9 KB) in front of /web's first row. Rendered only on a real 404.
import dynamic from "next/dynamic";

const Lost = dynamic(() => import("./Lost"));

export default function LostLazy(props) { return <Lost {...props} />; }
