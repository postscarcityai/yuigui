// The web client's own viewport (YUI-244): `cover` lets the page draw under a phone's notch and home bar (the
// app pads with the safe-area insets), and a keyboard resizes the content on browsers that can say so.
export const viewport = { viewportFit: "cover", interactiveWidget: "resizes-content" };

export default function WebLayout({ children }) { return children; }
