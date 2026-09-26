# Encrypted sync | spec v1 (YUI-36, draft)

Agent tables (spec/TABLES.md) live on one iPhone. This page decides whether Yui v1 needs to copy them anywhere else, and designs the sync for when it does: end to end encrypted, off by default, no new account.

The mock is in the playground: [/playground?demo=sync](/playground?demo=sync). Step 1 (this page and the mock) is design only. Nothing here is built.

## Does v1 need sync?

**No.** v1 ships with tables on the phone and no sync. The design below is ready for the day a second Yui device arrives.

Why:

1. **v1 is one iPhone.** Sync matters when you use two Yui devices at once. The Mac app, the browser and an iPad layout are drafts ([macOS](/developers/macos), [Browser](/developers/browser)); none ships in v1.
2. **A new phone is covered by the phone's own backup.** The real v1 risk is "I got a new iPhone and my workout log is gone". Keeping the tables file in the iPhone's backup (iCloud Backup, or an encrypted backup on a computer) fixes that with nothing new on Yui's side (question 2).
3. **On-device first.** Sync puts a copy on Yui's relay. Encrypted or not, that is a server copy and a pairing flow to explain. It should arrive only when it buys something.
4. **Tables are not in the app yet.** The phone's store is YUI-89. Sync sits on top of it, so it cannot come first.

When to build it (step 2): once a second Yui client is scheduled to ship, or when enough people ask for tables on two devices. Until then this page is the plan, and the TestFlight feedback button is where people ask for it.

## 1. What syncs

| Syncs | Does not sync |
| --- | --- |
| Each agent's tables: the columns, the rows, and deletes | Chats. They already live in the relay and reach every signed-in device. |
| | Keys. They stay in the Keychain ([Key vault](/developers/vault)). |
| | Unsent drafts, saved screens, looks, settings. Per device, as today. |

- Sync is **all or nothing** per account: every agent's tables, or none. A per-agent switch is question 3.
- **Off by default.** Nothing leaves the phone until you turn it on in Settings > Sync.
- **No new account.** The devices you pair are the ones signed in to your Yui account (Sign in with Apple). No password, no email, no recovery words.

## 2. The encryption

The relay stores ciphertext it cannot read. Only your devices hold the key.

- **One sync key per account.** A random 256-bit key, made on the device that turns sync on. It lives in that device's Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`, so sync can run in the background after the first unlock). It is never sent anywhere in the clear, never logged, and never shown.
- **Each device has its own key pair** (X25519, CryptoKit) in its Keychain, used only to receive the sync key when it is paired, and again when the key changes.
- **Every change is sealed** with ChaCha20-Poly1305 under a key derived from the sync key (HKDF-SHA256, label `yui-sync-v1 ops`). The sealed box also binds the account, the key's epoch and the change's number, so the relay cannot move a change to another account or pass an old one off as new.
- **Names are hidden too.** The relay never sees a table name, a column, a row key or a value. Each row is filed under an opaque id: an HMAC of `agent / table / key` under a second derived key (`yui-sync-v1 ids`). Sizes are padded up to the next 512 bytes.
- **What the relay does see:** your user id, which agent a change belongs to (so removing an agent can delete its copy on the relay), which device sent it, when, and the padded size. Section 7 lists what that reveals.

```
change = seal(ops key, nonce, row change as JSON,
              aad = "yui-sync-v1" | user | epoch | device | seq)
relay row = { user, agent, device, epoch, seq, id: hmac(ids key, agent/table/key), box: change }
```

## 3. Pairing a second device

From **Settings > Sync > Add a device**, on a device that already syncs:

1. It shows a QR code and, under it, the same thing as 12 characters to type (for a device without a camera). The code holds a one-time pairing id, the device's pairing public key and a secret the relay never sees. It lasts 2 minutes and works once.
2. On the new device, signed in to the same Yui account: **Settings > Sync > Join with a code**, then scan or type.
3. The new device sends its public key through the relay, tagged with an HMAC under the secret from the code. The relay can carry it but cannot swap in its own key: it does not have the secret.
4. The first device shows "iPad wants to join. It will get every agent's tables." with **Add iPad** (Face ID) and **Not this one**.
5. On Add, the first device seals the sync key to the new device's public key (HPKE, X25519 + ChaCha20-Poly1305) and posts it. The new device opens it, pulls the tables and says "Synced. 4 agents, 7 tables."

Pairing needs one device you already have. If every synced device is gone, so is the key, and the relay copy cannot be opened by anyone, us included. That is the price of the relay never holding the key. Question 4 asks whether to offer a way out (iCloud Keychain, or a recovery code).

## 4. Conflicts

Two devices can change the same table while one is offline. Every change carries a clock (a hybrid logical clock: wall time plus a counter plus the device), and the rule is the same everywhere, so every device ends up with the same rows without asking you.

| What clashed | Rule |
| --- | --- |
| Two edits to the same row | **Per cell, the newest clock wins.** Phone sets Weight, iPad sets Reps: both stay. Both set Weight: the later one stays. |
| An edit and a delete | **The newer one wins.** A delete made after the edit removes the row. An edit made after the delete brings the row back with that edit's cells. |
| Two new rows with no key (a log) | **No clash.** Both are kept. Rows the person adds get a key that names the device (`r7-ab`), so two devices never make the same key. |
| The same agent reply seen on two devices | **One row, not two.** A reply reaches every device, and each applies its `put` lines. A row the reply appends takes its key from the message and the line (`m9f2c.3`), and relative dates (`today`, `now`) are read at the reply's time, so both devices write the same row and sync merges it into one. |
| Two changes to a table's columns | **The newest `table create` wins.** Each device then converts values by the rules in TABLES.md section 1, so they agree. |
| A row over a limit (5,000 rows, 20 tables) | The change that crossed it is refused on the device that receives it, the same as a local `put`, and the device that wrote it hears why on its next sync. |

Row order stays "as first written", by each row's first clock.

## 5. Turning it off, removing things

- **Turn off sync** (Face ID) on any synced device: the relay copy is deleted right away, every paired device is told, and each keeps its own copy of the tables on the device. Nothing on any phone is deleted. Turning it back on starts a new key and uploads again from that device.
- **Remove a device** from the device list: that device stops getting changes at once. The others make a new sync key (a new epoch) and re-seal it to each other, so the removed device cannot open anything written after. It keeps what it already had. A device you still hold can also leave from its own Settings.
- **Delete a row or a table:** synced like any change. The relay keeps a delete marker 30 days so an offline device still hears about it, then drops it.
- **Remove an agent:** its tables go from every device and its rows go from the relay.
- **Delete the account:** every sync row goes with it, like messages and media.
- The relay's own backups roll off within 7 days, so a wiped copy is fully gone within a week.

## 6. Size caps

| What | Cap |
| --- | --- |
| One change, sealed | 48 KB (a full row at the table limits fits) |
| Everything on the relay per account | 50 MB |
| Changes per device per minute | 600 (a burst of `put` lines queues, it is never dropped) |
| Paired devices | 5 |
| Pairing code | 2 minutes, one use |
| A device silent for 90 days | dropped from the list; it pairs again to rejoin |

Compaction: after 500 changes to a table, the device that crosses it writes one sealed snapshot of that table and the older changes are deleted. A new device pulls the snapshots first, then the changes after them.

## 7. Threats

| Threat | What the design does |
| --- | --- |
| Someone reads the relay's database (an insider, a breach, a subpoena) | They get sealed boxes and opaque ids. No table names, columns, keys or values. The key is only on your devices. |
| The relay changes, replays or reorders changes | Each box is authenticated and bound to its account, epoch, device and number. A changed box fails to open and is dropped. A replay is harmless: the same clock gives the same result. A gap in a device's numbers shows "Sync is behind" instead of a silent hole. |
| The relay swaps keys during pairing | The new device's key travels with an HMAC under a secret only the QR or the typed code carries, and you confirm the device by name on the first one with Face ID. |
| What the relay can still learn | Which agents have synced data, how much (to the nearest 512 bytes), when you change it and from which device. Said plainly in Settings > Sync. Hiding the agent too would mean the relay could not delete an agent's copy on its own. |
| A lost or stolen device | Remove it from any other device: it gets nothing new and cannot open anything after the new epoch. It keeps what it held, the same as a lost phone today, behind its passcode. |
| An unlocked phone in someone else's hands | Adding a device, turning sync off and removing a device each need Face ID. |
| Losing every device | The relay copy cannot be opened. The phone's own backup is the fallback (question 2), and question 4 asks about recovery. |
| An agent writes too much | The table limits apply before a change is sealed, and the per-minute cap queues the rest. An agent can fill your tables, not the relay. |
| An agent reads synced data | It can't. Agent hosts (the `yui_connector` role) have no grant on any sync table, and sync adds nothing to what an agent can ask for. |
| A shared agent (YUI-95) | The person it is shared with keeps its tables on their own devices, under their own sync key. The owner never sees them. |

## 8. What an agent sees

Nothing new. `table create`, `put` and `query` are unchanged, and no event says sync exists. An agent writes the same lines whether the person has one device or five, and a `query` on any device draws the same rows once they have synced.

**No new Yui Lines word**, so no parser change and no new vectors.

## 9. Relay changes (for step 2)

```sql
create table yui_sync_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, name text not null,
  pub bytea not null, added_at timestamptz not null default now(),
  last_seen timestamptz, removed_at timestamptz);

create table yui_sync_keys (           -- the sync key, sealed to each device, per epoch
  user_id uuid not null, epoch int not null,
  device uuid not null references yui_sync_devices on delete cascade,
  sealed bytea not null, primary key (user_id, epoch, device));

create table yui_sync_ops (
  id bigint generated always as identity primary key,
  user_id uuid not null, agent_id uuid not null references yui_agents on delete cascade,
  device uuid not null, epoch int not null, seq bigint not null,
  obj bytea not null, box bytea not null check (octet_length(box) <= 49152),
  snapshot boolean not null default false,
  created_at timestamptz not null default now(),
  unique (device, epoch, seq));

create table yui_sync_pairings (
  id text primary key, user_id uuid not null, from_device uuid not null,
  new_pub bytea, new_mac bytea, new_name text, sealed bytea,
  expires_at timestamptz not null);
```

- Row-level security: owner only, as `yui_user`. No grant of any kind to `yui_connector`.
- A device inserts its own ops and reads everyone's since its last cursor. Nobody updates an op. Deletes happen through one function (turn off, remove agent, compaction), never row by row from the app.
- `yui_retention` drops delete markers after 30 days, expired pairings at once, and devices silent for 90 days.
- A turn-off is one call that deletes the account's sync rows in one transaction and returns the count, so the app can say "Removed from Yui's server".

## 10. Not yet

- A web or Mac client joining sync (they need the Keychain story of their platform).
- Syncing saved screens, looks or drafts.
- Sharing one table between two people.
- Letting an agent's host keep a copy (that would be a different feature: tables on the host, not on the phone).

## Step 2 (native)

Done when all of this is true, with proof on the card:

1. **Settings > Sync.** Off by default. Turn on makes the key, uploads every table sealed, and lists this device. The page says what the relay can see.
2. **Pairing.** QR and typed code, 2 minutes, one use; the confirm sheet with Face ID; the new device pulls snapshots then changes. A test where the relay swaps the public key fails the pairing.
3. **Conflicts.** Every row of the table in section 4 as a test in the store, plus the same agent reply applied on two devices giving one row.
4. **Nothing readable on the relay.** A query over `yui_sync_ops` finds no table name, column, row key or value from the test data.
5. **Remove a device** moves to a new epoch, and the removed device cannot open a change written after it.
6. **Turn off** leaves zero sync rows for the account and every device's tables intact.
7. Two simulators, one account, offline edits on both, then back online: the same rows on both, light and dark screenshots.
8. Shipped in a VALID TestFlight build, with a progress entry and screenshots.

## Open questions for Chris

1. Agree that v1 ships without sync, and step 2 waits for a second Yui device (Mac, browser or iPad)? Or build it sooner?
2. Should the tables file be in the iPhone's own backup (iCloud Backup, or a computer backup)? Yes means a new phone keeps your tables with no sync at all. It also means Apple holds that copy, end to end encrypted only if you use Advanced Data Protection.
3. One switch for every agent's tables, or a switch per agent?
4. Losing every device loses the synced copy. Keep it that way, or also put the sync key in iCloud Keychain (end to end encrypted by Apple), or offer a recovery code to write down?
5. Is 50 MB per account and 5 devices enough, or should the caps start smaller?
