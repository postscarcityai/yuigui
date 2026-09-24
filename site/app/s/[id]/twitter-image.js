// Same card as opengraph-image; Next needs route config declared here, not re-exported.
import Image from "./opengraph-image";
import { shareItems } from "../../../lib/share.mjs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Yui screen and the Yui Lines that draw it";
export const dynamicParams = false;
export const generateStaticParams = () => shareItems().map((it) => ({ id: it.id }));
export default Image;
