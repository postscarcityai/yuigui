# The admin console | scope (YUI-72)

Who can run Yui from the top, and what they can touch. Scope only: nothing here is built yet. The person building Yui asked for it on Sep 25 2026: "Down the road I think I will need an admin section where admin and super users and certain types of users can login and control the app from a very high level. We should scope that."

The short answer:

- **Five roles**: owner, super user, admin, support, and a client's own admin (org admin). Each one below, with what it can see and do.
- **It lives in the app.** An Admin section inside Yui, shown only to people with a role. No web console until a support team needs one.
- **Proof of role is Sign in with Apple plus a role row**, read live on every request. Destructive actions ask again: Face ID and a fresh Apple sign-in, bound to that one action.
- **Admins never read messages.** The admin API has no call that returns message text, pictures or taps. What is visible is listed exactly, below.
- **Everything an admin does is logged**, and the log cannot be edited, not even by the owner.

## 1. Roles

| role | who | in one line |
| --- | --- | --- |
| owner | the person who runs Yui (one) | everything, including the controls that can stop everyone at once |
| super user | a trusted co-runner, 0 to 2 people | everything the owner does except handing out super user and the whole-app stop |
| admin | day-to-day operator | invites, stopping one account, announcements, flags for groups, feedback |
| support | helps testers | looks things up, resends an invite code, files a request to stop someone; changes nothing on its own |
| org admin | a company's own admin (YUI-57) | runs their own people and their default agents, inside their company only |

Rules that hold for every role:

- A role is a row, not a login. Everyone signs in the same way (Sign in with Apple). A person with no role row sees no Admin section and the admin API answers 403.
- Roles only go down the ladder: the owner grants super user, a super user grants admin and support, nobody grants a role at or above their own. Org admins are granted by an admin or above.
- Revoking a role works on the next request, like the kill switch does today. There is no admin session that outlives the row.
- The owner cannot be stopped, demoted or deleted from the console. Moving ownership is a manual step done on the database, logged, by design.

## 2. What each role controls

F = full, O = own org only, R = read only, Q = can file a request an admin approves, blank = nothing.

| control | owner | super user | admin | support | org admin |
| --- | --- | --- | --- | --- | --- |
| Invites: approve, decline, add | F | F | F | Q | O (up to their seats) |
| Invites: resend a code | F | F | F | F | O |
| Accounts: look up, see status | F | F | F | R | O |
| Accounts: stop, restore | F | F | F | Q | O (remove from the org, not stop) |
| Accounts: delete | F | F | | | |
| Agent hosts: stop, restore | F | F | F | Q | |
| Default agents per org | F | F | F | R | O (from client-safe templates) |
| Limits: change the numbers | F | F | | | |
| Whole-app stop | F | | | | |
| Feature flags | F | F | F (groups, not everyone) | R | |
| Announcements | F | F | F | | O (to their people) |
| Feedback triage | F | F | F | F | O (their people's) |
| Usage and health numbers | F | F | F | R | O |
| Audit log | R | R | R (their own actions) | | O (their org's) |
| Roles: grant, revoke | F | admin, support, org admin | | | |

In points, per role:

- **Owner**: everything. The only one who can stop the whole app, grant super user or change who owns Yui.
- **Super user**: everything else, including changing limits, deleting an account and granting admin, support and org admin.
- **Admin**: the daily work. Approves invites, stops and restores one account or host, sends announcements, turns flags on for a group, triages feedback. Cannot delete, cannot change limits, cannot grant roles.
- **Support**: reads, resends codes, triages feedback. Anything that changes an account becomes a request an admin approves with one tap.
- **Org admin**: the same shape, drawn around their company: invites up to their seats, removes people from the org, picks the org's default agents from the client-safe list, sees their org's numbers and their org's audit log. Never another org, never anything global.

## 3. Each control, what exists today, and the gap

| control | today | gap |
| --- | --- | --- |
| Invites (YUI-56) | `invite.py` in the app repo (list, add, approve, decline, reissue); `yui_invites`; the war room's Approve and Decline taps | only the owner can do it, through a script or the war room; no org or seat on an invite |
| Accounts | `yui_users` (id, email, private relay flag, created, last sign-in, stopped); self-serve delete through `yui-delete` | no lookup screen; no admin delete; no notes on an account |
| Default agents per org (YUI-57) | `agent_template` on an invite | no orgs at all; a template is per invite, not per company |
| Kill switch and limits (YUI-26) | `kill_switch.py` stops one account or one host, reversible; every number in `yui_limits` | no whole-app stop; limits change only by SQL; no per-account override; no screen |
| Feature flags | none; the app ships every feature to everyone | a flags table, a way for the app to read it at launch, groups |
| Announcements | none; news reaches people only as a Yui message from the Yui agent | a one-time card in every thread (or a group's), with an expiry |
| Feedback triage | TestFlight feedback becomes a board card every 10 minutes; the war room shows the latest three | feedback from people outside TestFlight; telling the tester what happened to it |
| Usage and health | none rolled up; rate buckets exist but are not counted | daily counts, no content: accounts, active accounts, messages, hosts online, limit hits, push failures |
| Audit log | a stop keeps its reason; invites keep their timestamps; board events | one append-only log for every admin action |

## 4. Where it lives

Three options:

1. **In the app**: an Admin section inside Yui, hidden unless you have a role.
2. **On the web**: a console at yuigui.com behind a login.
3. **Both.**

**Recommendation: in the app.** Why:

- Sign in with Apple already works there, with the same token the relay trusts. The site has no login at all today, and adding one means a second sign-in flow, a web session and a server holding admin power on a public marketing site.
- The owner already runs Yui from the phone. The war room approves invites and reorders the board with one tap and no agent turn; an Admin section is the same pattern with more buttons.
- Admin screens are Yui screens: lists, tables, stats, pick and confirm. The app already draws all of them, so the console is mostly wiring, not new UI.
- Org admins are small-company people on phones, the same as their staff.
- One surface to secure, one to test.

The web comes later, only if a support team with laptops needs bulk work (long tables, exports). It would call the same admin API, so nothing is thrown away.

## 5. How an admin proves it

- **No new login.** The person signs in with Apple as usual. `yui-auth` keeps minting the `yui_user` token it mints today. The role is never inside the token.
- **One admin API.** A new edge function, `yui-admin`, takes every admin call. It checks the caller's token, then reads their role row live on each request and refuses anything the role does not allow. It is the only code that holds admin power. Every call writes one audit row before it answers.
- **Yui roles only.** Admin power is a row in a Yui table, checked by Yui code. It never uses PROOF Auth, never the shared `authenticated` role, never a Postgres superuser from the phone.
- **The app only shows.** The Admin section is hidden without a role, but hiding is a courtesy. The API is the lock.
- **Asking again for destructive actions.** Stop, delete, whole-app stop, limit changes, role grants and flags for everyone need a step-up: Face ID on the phone and a fresh Sign in with Apple, both bound to the action (the Apple nonce carries a hash of the exact request). A step-up lasts for that one action, never a session.
- **Two people for the biggest ones.** Once there are two super users, the whole-app stop, account delete and granting super user wait for a second person's tap. Until then the owner alone, and the log says so.
- **The owner is bootstrapped once**, by a migration that adds the first role row for the owner's account. No endpoint can create an owner.

## 6. Privacy: what an admin can see

Admins never read message content. There is no call in the admin API that returns it, and no "view as user" mode.

Visible to admin and above (support sees the same, with the email masked to its first letter and domain):

- account id, email, whether it is an Apple private relay address
- created, last sign-in, stopped or not and why, org and role
- number of phones registered for push, and whether push worked last time
- agents: name, color, kind (Hermes, OpenClaw, MCP), which host, when last active
- hosts: name, last seen, stopped or not
- daily counts: messages sent, agent replies, pictures, limit hits (numbers only)
- invite: status, when it was sent and claimed, template
- feedback the person sent on purpose, and what it became

Never visible, to anyone, through the console:

- message text, pictures, videos, voice
- taps, form answers, plan answers, screens an agent sent
- push notification text
- Apple tokens, session tokens, host tokens, pairing codes, invite codes

**Break glass, only by the person.** If someone wants support to see a thread, they share it from the app ("Share this thread with support"). That grants read of that one thread for 24 hours, shows a banner in their thread while it is open, and lands in the audit log. Nobody can start it on their behalf.

A plain note: the backend itself can reach message rows, the way every relay can. The console adds no way in, messages are deleted after 90 days, and end-to-end encryption is its own card.

## 7. The audit log

- One append-only table. Each row: when, who, their role, the action, the target (ids only), the reason typed, whether a step-up or a second person was used, and the result.
- No update, no delete, for any role. Retention: two years.
- Owner and super users read all of it; admins read their own actions; org admins read their org's.
- The war room gets a panel: the last ten admin actions.

## 8. Phased plan

**Phase 1. The owner's console.** The backbone and the controls that exist today, in the app, for one person.
Role and audit tables, `yui-admin` with step-up, an Admin section with accounts, invites, stop and restore, limits and the log. Wraps what `invite.py` and `kill_switch.py` do; the scripts keep working.

**Phase 2. A team.** Super user, admin and support, with grants. Feature flags and announcements. Feedback triage in the console, usage and health numbers, the war room panel.

**Phase 3. Clients.** Orgs with seats, the org admin, default agents per org (on top of YUI-57), org numbers and an org audit view. A web console only if support is a team by then.

## 9. Card candidates

| # | card | size | phase |
| --- | --- | --- | --- |
| A1 | Roles and audit log: role rows, the append-only log, `yui-admin` with the live role check, owner bootstrap, tests | M | 1 |
| A2 | Admin section in the app: accounts lookup, invites queue, stop and restore, limits, the log | M | 1 |
| A3 | Step-up for destructive actions: Face ID plus a fresh Apple sign-in bound to the action | S | 1 |
| A4 | Flags and announcements: a flags table the app reads at launch, groups, an announcement card with an expiry | M | 2 |
| A5 | Usage and health numbers: daily counts with no content, in the console and the war room | S | 2 |
| A6 | Client orgs: orgs, seats, the org admin role, default agents per org (needs YUI-57) | L | 3 |

A1, A2 and A3 make phase 1 and go together. The rest wait until outside testers arrive in numbers.
