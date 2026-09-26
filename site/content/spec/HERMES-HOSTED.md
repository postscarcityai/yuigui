# Hermes for everyone | spec v0 (YUI-149, NATIVE-2, Sep 26 2026)

Tier 2 of [Native Yui](NATIVE.md). The native Yui (tier 1) is one shared runtime where each person's agents are rows. Some people will want more: a real Hermes of their own, with its skills, its memory files and its tools. This page is how Yui gives each of them one, without a computer of their own.

Status: spec now, build later. Nothing is set up and nothing is spent. The build waits until NATIVE-1 ships.

```
 Yui app  <-->  Yui relay (Supabase)  --new row webhook-->  provisioner  --start/wake-->  that person's Hermes sandbox (Beam)
                                                                                              |  the Yui plugin, as on any Mac
                                                                                              v
                                                                                        OpenRouter (their key)
```

## 1. Why not put everyone on one Hermes

Hermes is built for one owner on one machine: profiles, memory and skills are folders, tools can run commands and edit files, and keys sit in its environment. Many people on one Hermes means any agent with a shell can reach everyone else's files and keys. So tier 2 is **one sandbox per person**, and the sandbox sleeps when nobody is talking.

## 2. Where it runs

**Beam** (beam.cloud) by default. Its sandboxes run under gVisor, start in under a second, scale to zero and bill by the second, and the platform is open source (beta9), so it can also run on our own cloud later.

The provisioner talks to hosts through one small interface (`create`, `wake`, `sleep`, `destroy`, `status`), so Fly.io Machines and Cloudflare Containers can be added without touching the rest.

## 3. The sandbox

- **One image.** Hermes plus the Yui plugin, pinned versions, no keys inside.
- **One volume per person.** Profiles, memory and skills live on it, so a sandbox that sleeps wakes up as it was.
- **Pairs itself.** On first start the provisioner hands it a one-time code through the host API (`yui-connect add`), so the person never types one.
- **Wake on a message.** A sleeping Hermes cannot hold a Realtime socket. The relay webhook that wakes the native runtime also wakes the sandbox; the plugin catches up by polling, answers, and stays up for a few idle minutes before it sleeps.

## 4. Moving your agents

"Give me a real Hermes" can bring your native agents along: each native profile becomes a Hermes profile (soul, notes, look), and the native copies pause so there is one of each.

## 5. Who gets it

Invite or plan gated, always on the person's own model key (tier 2 has real cost per person). The exact gate is decided when the build starts.

## 6. Running many of them

- **Updates.** A new image rolls out a few sandboxes at a time and rolls back on errors.
- **Backups.** Volumes are snapshotted daily.
- **Kill switch.** One sandbox (suspend its connector, as today) or all of them (`hermes_hosted_enabled` off).
- **Share-safety.** The plugin's sandbox check still runs before any turn for someone who is not the owner.

## 7. Cards

NATIVE-2: YUI-149 this spec; YUI-150 the Hermes image that pairs itself; YUI-151 the provisioner, Beam first; YUI-152 move my agents; YUI-153 who gets it; YUI-154 updates, backups and the kill switch.

## Sources (read Sep 26 2026)

- Beam sandboxes and pricing: https://docs.beam.cloud/v2/resources/pricing-and-billing
- Beam, open source (beta9): https://github.com/beam-cloud/beta9
