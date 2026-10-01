// Where the web client talks (YUI-241). Same project and same public key as the app
// (Yui/Sources/Account/YuiBackend.swift). The key only grants the anon role, which can't
// read a yui_ table; it is the gateway's `apikey`, not a credential.
export const BACKEND = "https://txuibjxyfpalzvpneqgp.supabase.co";
export const PUBLISHABLE_KEY = "sb_publishable_9DhcBgazmSHaoOJChYtqwA_qyHvI_zc";

// The Apple Services ID the page signs in with, grouped with the app's primary App ID
// (com.yuigui.app) so one Apple user is one Yui account. yui-auth reads the same id from
// YUI_SIWA_WEB_CLIENT_ID. The return URL registered with Apple is REDIRECT_URI.
export const APPLE_WEB_CLIENT_ID = "com.yuigui.web";
export const REDIRECT_URI = "https://www.yuigui.com/web/auth/apple";
export const APPLE_JS = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

export const functionUrl = (name, base = BACKEND) => `${base}/functions/v1/${name}`;
