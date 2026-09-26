# Key vault | spec v1 (YUI-34, draft)

Some things an agent does cost money at someone else's company: an image from fal, a model call through OpenRouter, Anthropic or OpenAI, a run on Replicate. Today the only way to pay for that with your own account is a key in a file on the machine the agent runs on. The vault is the other way: your keys live on your iPhone, you decide which agent may use which key and for what, and no agent ever sees one.

Step 1 (this page) is the design: where a key lives, how it gets in, how an agent asks, how the hosted connector uses it, what it may spend and what gets logged. The mock is in the playground: [/playground?demo=vault](/playground?demo=vault). Step 2 builds it in the app, the relay and the hosted connector; its acceptance is at the end.

The rule this rests on is already in the [channel guide](/channel): an agent never asks for a password, code or key, in a form or in text. The vault is the safe place that rule points to.

## 1. Where a key lives

- **In the iOS Keychain, on this iPhone only.** One Keychain item per key, class generic password, service `com.yuigui.vault`, readable only while the phone is unlocked (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`). It is not in the app's files, not in backups, not in UserDefaults, not in the relay.
- **iCloud Keychain, only if you turn it on.** A switch per key: "Also on my other Apple devices". On means the item is synchronizable, which Apple's rules pair with `kSecAttrAccessibleWhenUnlocked` (a synced item cannot be this-device-only). iCloud Keychain is end-to-end encrypted by Apple; Yui never sees that copy. Off by default.
- **Never shown again.** After you save a key the app shows its provider, a name you pick, and the last four characters (`sk-...x7Qa`). There is no reveal and no copy. To change a key you paste a new one over it.
- **Face ID to touch it.** Adding, replacing or removing a key, and every grant to an agent, asks for Face ID (or the passcode). Using a key that is already granted does not.

## 2. How a key gets in

Only one door: **Settings > Keys > Add a key.** Never an agent's form, never the chat, never a screen an agent drew.

1. Pick the provider. Each has a **Get a key** button that opens the provider's own key page in Safari, so you sign in there, not in Yui.
2. Bring the key back one of two ways:
   - **Paste.** The field is a secure text field: no autocorrect, no predictive bar, hidden in screenshots and the app switcher.
   - **Scan.** The camera reads the key off your computer screen (VisionKit text recognition, on the phone; the picture is never saved or sent).
3. Yui checks its shape (below) and, where the provider has a cheap read, one call from the phone straight to the provider to see it works. Nothing else hears the key.
4. You name it ("Personal fal"), set a monthly cap (section 6) and save. Face ID.

| Provider | Used for | Shape check | Test call from the phone |
| --- | --- | --- | --- |
| fal | images, video, audio | `key id:secret` | on first use |
| Replicate | open models, images | starts `r8_` | account read |
| OpenRouter | many models, one key | starts `sk-or-` | key read (also shows the key's own limit) |
| Anthropic | Claude | starts `sk-ant-` | models list |
| OpenAI | GPT, images | starts `sk-` | models list |

A shape that does not match is refused with "That doesn't look like a fal key." A failed test call says what the provider said (a bad key, no credits) and still lets you save, in case the provider is down.

Key-shaped text anywhere else is caught before it leaves the phone. If you paste something that looks like a key into the composer or into an agent's form, Yui holds the send: "That looks like a key. Keys go in Settings > Keys, where agents can't read them." with **Move it to Keys** and **Send anyway** (the second one only for text that merely looks like a key; a match on a known provider shape has no Send anyway).

## 3. How an agent asks to use one

An agent never draws the ask. It asks its host, and the app draws the sheet itself, as part of Yui's own chrome, the way iOS draws a permission alert. A screen an agent sends can never look like it, because it does not come from Yui Lines.

The host sends one ask through the relay (a control row, the same path [agent controls](/developers/controls) use):

```json
{"v": 1, "req": "k-19c4", "op": "key_ask", "provider": "fal",
 "for": "Draw your agent avatars", "est": "about 4 images a week", "cap": 5}
```

- `provider` is one of the five above. `for` is one short line the person reads (80 characters at most, key-shaped text refused). `est` and `cap` (a suggested monthly cap in dollars) are optional.
- The app shows a sheet over the thread: the agent's face, "Penny wants to use your fal key", the `for` line, the suggested cap, and which key if you have more than one for that provider. Three buttons: **Allow** (Face ID), **Allow once** (one call, then it asks again) and **Don't allow**.
- No key for that provider yet: the sheet says so and offers **Add a fal key**, which opens Settings > Keys at the add sheet, then comes back to the ask.
- The agent hears the answer as one line on its next turn, never the key:
  `[yui] Key access: fal allowed for "Draw your agent avatars", cap $5 a month, handle vk_fal_3f9a.`
  or `[yui] Key access: fal not allowed.`
- **One ask at a time, no nagging.** A second ask for the same provider within 24 hours of a Don't allow is dropped by the relay, and the agent gets `[yui] Key access: fal was declined today. Ask again tomorrow, or let them bring it up.`

**No new Yui Lines word.** The ask is a control row, not a line in a reply, so the grammar and the parsers do not change.

### Grants, per agent, in the drawer

A grant is (agent, key, what for, cap, since). Every agent's drawer gets a **Keys** row under Controls (spec/CONTROLS.md): each key it may use, what for, this month's spend against its cap, and **Revoke**. Revoke takes effect at the connector on the next call (under a second) and the agent hears `[yui] Key access: fal revoked.` Settings > Keys shows the same grants from the key's side ("Used by Penny, Quill").

A grant belongs to the agent's owner. A person an agent is shared with (YUI-95) never sees the owner's keys and cannot grant them; step 2 does not let a shared agent use its client's keys either (question 4).

## 4. How the hosted connector gets it

The key never goes to the machine the agent runs on. Not to a Hermes profile on your Mac, not to a starter agent's sandbox, not to an MCP client. It goes, sealed, to Yui's hosted connector (spec/HOSTING.md), which makes the call on the agent's behalf.

1. **Sealed on the phone.** When you grant a key, the app seals it with HPKE (CryptoKit, X25519 + ChaCha20-Poly1305) to the connector's vault public key. The public key is pinned in the app and published at `/.well-known/yui-vault.json` with its id and rotation date.
2. **Stored sealed.** The relay keeps only the sealed blob: `yui_vault_keys (id, user_id, provider, name, last4, sealed, key_id, created_at)`. The owner can insert and delete their rows and read everything but `sealed`; nobody can update one. The relay cannot open it.
3. **Opened only in the connector, only for a call.** The connector's private key is a Worker secret. It opens the blob in memory for one call, adds the provider's auth header and forgets it. It never writes the key anywhere, never logs it, and scrubs it from error text before anything is logged.
4. **Rotation.** A new connector key means the app re-seals each key the next time it opens (Face ID), and old blobs stop working after 30 days.

### What an agent sees: a handle

An agent gets a handle, `vk_fal_3f9a`, and calls the provider through the connector:

```
POST https://<connector>/vault/v1/vk_fal_3f9a/fal-ai/flux/dev
Authorization: Bearer yui_ct_...     <- the agent's own connection token
{ ...the provider's own request body... }
```

- The connector checks the token belongs to the agent the grant names, the grant is live, the path is on that provider's list, and the cap has room. Then it forwards to the provider's real host with the real key and streams the answer back.
- A handle on its own is worthless: it only works with the connection token of the agent it was granted to. Another agent, or the same handle on another account, gets `403 not_granted`.
- **Fixed hosts only.** Each provider maps to its one API host (fal's, Replicate's, OpenRouter's, Anthropic's, OpenAI's). There is no way to send a vault key to any other address, so a key cannot be pointed at an attacker's server.
- A Hermes agent on your Mac uses the same proxy through a small tool in the Yui plugin (`vault_call(handle, path, body)`), and the model bridge (spec/MODELS.md) takes `--vault vk_openrouter_...` instead of `--key-env`. Neither ever holds the key.

## 5. What an agent is told when it can't

Every refusal is plain JSON the agent can read and a person would understand:

| Error | When | The agent should say |
| --- | --- | --- |
| `not_granted` | no grant, revoked, or the wrong agent | ask again, once, with a reason |
| `cap_reached` | this month's cap is spent | the cap is spent until the 1st; the person can raise it in the drawer |
| `path_not_allowed` | an endpoint off the provider's list | nothing to the person; the call was wrong |
| `key_rejected` | the provider refused the key (revoked, no credits) | the key needs fixing in Settings > Keys |
| `once_used` | an Allow once grant was already used | ask again |

## 6. Spend caps

- **Every key has a monthly cap**, in dollars, default $10, set when you add it. Each grant can have a lower cap of its own ("Penny: $5 of this key").
- **The connector keeps count.** After each call it adds what the call cost: the provider's own figure where the response carries one (OpenRouter reports cost per call), otherwise tokens or images times a price table the connector keeps per model. Before each call it holds a small estimate so ten calls at once cannot all slip under the cap.
- **At 80%** the owner gets one push ("fal is at $8 of $10 this month") with **Raise the cap** and **Leave it**. **At 100%** calls stop with `cap_reached` until the 1st of the month or until the owner raises it (Face ID).
- **The provider's own limits are the backstop.** The connector's count is an estimate. Where a provider lets you put a limit on the key itself (OpenRouter keys can carry a credit limit; Anthropic and OpenAI have spend limits on the account or project), Add a key says so and links there.

## 7. Audit trail

- **Every call through the vault is one row:** time, agent, key (by name), provider, endpoint path, status, what it cost, and whether it was allowed. Never the request or the answer.
- Rows live in `yui_vault_uses`, readable by the owner only, deleted after 90 days.
- **Settings > Keys > a key > Activity** lists them newest first, grouped by day, with the month's total at the top. The drawer's Keys row shows the same, filtered to that agent.
- Grants, revokes, cap changes, adds and removes are rows too (`kind: grant`, `revoke`, `cap`, `add`, `remove`), so the list answers "who let this agent use my key, and when".

## 8. Removing a key

- **Settings > Keys > a key > Remove** (Face ID) deletes the Keychain item, deletes the sealed blob, ends every grant that used it and tells those agents.
- The key still works at the provider until you revoke it there. The confirm says so and offers **Revoke it at fal**, which opens the provider's key page.
- Signing out of Yui, or removing the app, leaves nothing usable behind: the Keychain items go with the app (this device only), and sign-out deletes the sealed blobs.

## 9. Threats, and what the design does about each

| Threat | What happens |
| --- | --- |
| An agent asks for your key in chat or a form | The channel guide forbids it; the app holds any key-shaped send and offers Move it to Keys; a known provider shape cannot be sent at all. |
| An agent draws a fake "add your key" screen | The real ask is app chrome, not Yui Lines, and keys only go in through Settings > Keys. A key typed into a drawn form is caught by the same check. |
| A prompt-injected agent runs up a bill | Per-agent grants, a cap per key and per grant, the 80% push, fixed hosts and paths, Allow once for anything unsure, the audit list and one-tap Revoke. Provider-side limits as the backstop. |
| The relay database leaks | It holds sealed blobs and last-four only. Without the connector's private key they are noise. |
| The agent's host is compromised (your Mac, a starter sandbox) | The host never had the key. It has handles and its own connection token, which still spend inside the cap until you revoke; revoking the connection kills every handle it holds. |
| The hosted connector is compromised | This is the one place a key exists in the clear, for the length of a call. Kept small: the key is opened per call and never stored, the private key is a Worker secret, and the caps and provider limits bound the damage. Rotating the connector key and re-sealing is the recovery. Said plainly in the add sheet: "Yui's connector uses this key for the calls you allow." |
| Someone picks up your unlocked phone | Using a granted key needs no Face ID, but adding, granting, raising a cap and removing do, and the key is never shown. |
| Shoulder surfing or a screenshot | Secure field, masked everywhere after save, hidden in the app switcher. |
| The key ends up in a log or crash report | The app never logs the field; the connector scrubs provider error text; the host plugin's secret redaction (spec/CONTROLS.md section 4) still runs on everything it sends. |
| A handle leaks | It only works with the granted agent's own connection token. |
| An old sealed blob after rotation | Blobs name their connector key id; old ids stop opening after 30 days. |

## 10. Relay changes (for step 2)

```sql
create table yui_vault_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('fal','replicate','openrouter','anthropic','openai')),
  name text not null, last4 text not null,
  sealed bytea not null, key_id text not null,
  cap_cents int not null default 1000,
  created_at timestamptz not null default now());

create table yui_vault_grants (
  id uuid primary key default gen_random_uuid(),
  key uuid not null references yui_vault_keys on delete cascade,
  agent_id uuid not null, handle text unique not null,
  purpose text not null, cap_cents int, once boolean not null default false,
  created_at timestamptz not null default now(), revoked_at timestamptz);

create table yui_vault_uses (
  id bigint generated always as identity primary key,
  user_id uuid not null, key uuid, agent_id uuid, kind text not null,
  path text, status int, cost_cents int, at timestamptz not null default now());
```

- Row-level security: owner only, as `yui_user`. `sealed` is never selectable by `yui_user` (a view without it). Grants are inserted by the app after Face ID; only the connector role writes `yui_vault_uses` rows of kind `call`.
- `key_ask` is a new `op` on `kind = 'control'` rows, host to app. The owner-only policy from CONTROLS.md section 5 already covers it.
- `yui_retention` deletes `yui_vault_uses` rows older than 90 days.

## 11. Not yet

- More providers (Gemini, xAI, Meta's Model API, ElevenLabs). Each needs its fixed host, its paths and its price table.
- Keys on Android and the Mac app.
- A shared agent spending its client's own keys.
- Spend from the connector's count shown live in the war room.
- Buying credits in the app instead of bringing a key (YUI-45).

## Step 2 (native)

Done when all of this is true, with proof on the card:

1. **Keychain.** Settings > Keys lists keys by provider, name, last four, last used and this month against its cap. Add a key (paste and scan) saves one Keychain item, this device only unless the iCloud switch is on; no reveal, no copy; Face ID on add, replace, remove.
2. **Key-shaped sends held.** Composer and forms both, with a UI test per provider shape.
3. **The ask.** A host's `key_ask` shows the app's own sheet (Allow, Allow once, Don't allow; Add a key when there is none), the agent gets the one line, and a second ask inside 24 hours after a no is dropped.
4. **Sealing.** Keys are sealed with HPKE to the pinned connector key; the relay holds only sealed blobs (checked by a query: no row holds a provider-shaped string).
5. **Connector proxy.** `/vault/v1/<handle>/...` checks token, grant, path and cap, forwards to the fixed host, logs one use row. Tests: wrong agent, revoked, path off the list, cap reached, Allow once used, provider refusal, the key absent from every log line.
6. **Drawer.** Controls > Keys per agent with spend and Revoke; Revoke works on the next call.
7. **One live call per provider** from a throwaway account with a low provider-side limit, then the key revoked at the provider.
8. Shipped in a VALID TestFlight build, with a progress entry and screenshots.

## Open questions for Chris

1. iCloud Keychain sync: off by default with a switch per key, or no sync at all in step 2?
2. Should agents on your own Mac use vault keys through the connector, or is the vault only for hosted and starter agents? Through the connector means Yui sits in the path of every paid call they make.
3. The default monthly cap for a new key: $10, or something else?
4. Shared agents (a client's Penny): may they ever use the client's own keys, or only the owner's, or neither?
5. Should the price table estimate the cost when a provider does not report it, or should a provider without a reported cost need its own provider-side limit before Yui lets you grant it?
6. Which providers first in step 2: all five, or fal and OpenRouter (avatars and cloud models) and the rest after?
7. A grant lasts until you revoke it. Should grants lapse after 90 days without a call instead?
