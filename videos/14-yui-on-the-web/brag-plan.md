# 14 Yui is on the web (YUI-250)

Angle: the same Yui, now in a laptop browser, side by side with the phone. 36 s, landscape only (no reel yet).

Facts, all from the repo on Oct 1 2026:
- /web runs the whole app: Sign in with Apple, agents, thread, stage, shelf, keys, notifications (docs/specs/web-parity.md, every row closed).
- The restyle card (theme app, Use or Keep mine, Undo) is new in this story: site/app/web/RestyleOffer.js.
- Footage is real /web on the demo account (no sign in, no network), a 1280x800 window and a 390x844 phone-width window, filmed by record.mjs with Playwright. The two windows are separate demo relays showing the same recorded thread; they are not a live sync. The captions say "same agent, same thread" about the account model, which is true on a signed in account (YUI-249).

Storyboard
| t | scene | captions |
|---|---|---|
| 0 to 3 | phone alone, Penny's stage | Yui lives on your phone. / Now it is on the web too. |
| 3 to 15 | laptop slides in, tap Plan my week, the answer plays on the stage, a second screen | Ask on the laptop. / Same agent. Same thread. / The answer plays on the stage. / On the phone and the laptop. |
| 15.6 to 26 | Yui offers a look, Use autumn, the chrome follows | Ask Yui to restyle itself. / Use the look, or keep yours. |
| 22.8 to 28 | same footage | Sign in with Apple. / Nothing to install. |
| 28.8 | outro | Yui is on the web. yuigui.com/web |

Beyond the spec: none. Publishing the video on social is Chris's call.

Re-cut Oct 2 (SITE-172): 40.8 s, filmed on the live demo account. open (last chat drawn, scroll back past 100 rows via ?demohistory=250; group chat drawn on the phone), dismiss (a Needs you row), ask (reply draws a screen). The restyle scene is gone. Same file names.
