# Security

Yui connects people's phones to agents that can act on their behalf, so we take security reports seriously.

## Reporting a problem

Please do not open a public issue for a security problem.

- Preferred: use GitHub's private reporting. Go to the Security tab of this repo and click "Report a vulnerability".
- Or email chris@postscarcity.ai with "Yui security" in the subject.

Tell us what you found, how to reproduce it, and what an attacker could do with it. We will reply within three business days, keep you posted while we fix it, and credit you in the progress log if you want.

## What is in scope

- The iOS app, the Hermes plugin and the Supabase functions and migrations in postscarcityai/yui.
- The Yui Lines parsers and the site in postscarcityai/yuigui.
- Anything that lets one Yui user read or change another user's data, or lets someone pose as a connected agent.

## Keys in the code

In postscarcityai/yui, `Yui/Sources/Account/YuiBackend.swift` holds a Supabase publishable key. That is a public client key by design. It grants only the anon role, which cannot read any `yui_` table. If you find a way to reach user data with it, that is a real bug and we want to hear about it.

Never commit a real secret. Server secrets live in Supabase edge function secrets. App Store Connect keys live in `~/.appstoreconnect/`, outside the repo.

## Supported versions

Yui is pre-release. Only the latest commit on `main` and the latest TestFlight build get fixes.
