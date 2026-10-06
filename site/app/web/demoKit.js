"use client";
// YUI-272: the demo's relay, sample group and fixtures, one chunk. A signed-in /web never loads it; ?demo= does.
import { useEffect } from "react";
import { createDemoRelay } from "../../lib/web/demo.mjs";
import { createDemoGroups } from "../../lib/web/groups-demo.mjs";
import fixture from "./fixtures/penny.json";
import sharedFixture from "./fixtures/shared.json";
import goudaFixture from "./fixtures/gouda.json";
import chathomeFixture from "./fixtures/chathome.json";
import firstFixture from "./fixtures/first.json";

export const FIXTURES = { penny: fixture, shared: sharedFixture, first: firstFixture, gouda: goudaFixture, chathome: chathomeFixture };

const kit = { FIXTURES, createDemoRelay, createDemoGroups };

/** Renders nothing: hands the kit up once the chunk is in. */
export default function DemoKit({ onKit }) {
  useEffect(() => { onKit(kit); }, [onKit]);
  return null;
}
