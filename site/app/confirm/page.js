// The link in Yui's confirmation email: yuigui.com/confirm?t=<token>.
import Confirm from "./Confirm";

export const metadata = {
  title: "Confirm your email | Yui",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <>
      <div className="eyebrow">Email</div>
      <h1>Confirm your email.</h1>
      <Confirm />
    </>
  );
}
