// The QR code on /connect/<id> is this link (INT-19). With Yui installed the
// iPhone camera opens the app straight from it (universal link, see
// ../../.well-known/apple-app-site-association); without it, the same page.
export { default, metadata } from "../../connect/[id]/page";
