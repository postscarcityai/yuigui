// Where yui-oauth/authorize sends the browser (INT-19): an MCP client asking to
// connect. The flow is ConnectFlow; the request id is all this page holds.
import { notFound } from "next/navigation";
import ConnectFlow from "../../components/ConnectFlow";

export const metadata = {
  title: "Connect to Yui",
  description: "Let an AI app put screens on your phone in Yui.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function Connect({ params }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  return <ConnectFlow id={id} />;
}
