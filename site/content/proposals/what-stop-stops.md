---
id: PROP-3
title: What Stop stops
summary: When you tap Stop, does it stop everything the agent queued, or only the reply you are watching?
status: Open for votes
date: 2026-09-28
becomes: The rule for YUI-190 (Stop on the main screen), plus a Stop on each long job if we pick the middle path
cost: M
call: recommend
by: Chris
---

```hero
say Stopped.
card "Stopped" "Logged your breakfast. Cancelled the macros and the grocery update." sub="Your song keeps rendering. 2 min left." cta="Stop the song too"
```

## The problem

Yui is getting a Stop button (YUI-190). While an agent works, the mic turns into a stop square. Tap it and the agent stops.

But an agent often does more than one thing from one message. It writes a reply, saves rows to a table, starts a long job in the background, sets a reminder. Some of those are done in a second. Some take minutes. Some were started by an earlier message.

So what should Stop stop? Two honest answers pull in opposite directions:

- **Stop everything.** Every job the agent queued is cancelled. Nothing lands after you tap.
- **Stop the reply, let the rest go.** You silence what you are watching. Work already handed off keeps running.

Chris, 2026-09-28, first: "the stop button should stop the queue." Then: "maybe it's good that it lets other things go." Both are right about something. This page lays out each side at its best and at its worst, then walks through real moments so you can pick.

## Who it is for

Anyone who taps Stop because the agent is doing the wrong thing, is too slow, or because they changed their mind. And anyone who has long work running (a song render, a week plan, a meal breakdown) and does not want to lose it by accident.

## How it works

### Side A: Stop stops the queue

Tap Stop and everything the agent has queued is cancelled: the model call, tool calls that have not run, table writes, background jobs, pushes. Each queued step checks "was Stop tapped?" right before it runs. The thread then shows a receipt: what ran, what did not.

**Steel man.** Stop is a brake, and a brake has to work every time. You tap Stop because something is wrong: the wrong photo, the wrong week, the wrong person. You cannot know which queued job carries the mistake, so you stop them all. A Stop that lets things slip through is a decorative pedal, and once a person catches it lying they stop trusting every button in the app. Agents on Moltbook make the same point about permissions: a grant you cannot revoke mid-queue was never revocable. One rule, no surprises.

**Straw man.** Stop is a panic button that nukes everything. You tap it to hush a long reply and lose a four-minute song render, the grocery list from ten minutes ago, and the reminder you set this morning. Every tap is a gamble, so people stop tapping it.

| Pros | Cons |
|---|---|
| One rule anyone can remember | Easy to lose long work by accident |
| Nothing lands after you tap, ever | You have to redo things that were fine |
| Safe when the agent misunderstood you | Stop feels risky, so people wait instead |
| Easy to prove in a test | Every queued step needs a cancel check |
| Builds trust in every other button | Can leave work half done (half a list saved) unless each job is undoable |

### Side B: Stop stops the reply, the rest goes on

Tap Stop and the reply you are watching ends. The agent stops talking and listens. Work it already handed off keeps running: renders, saves, reminders, other threads.

**Steel man.** Stop is how you get the floor back. Most of the time you are not saying "undo everything," you are saying "enough, listen to me." The expensive, slow work (a song render, a meal breakdown, a week plan) is exactly the work you want to survive a tap. Background jobs already show as rows you can open; if you want one gone, you stop that one. This is how a person works with a helper: "hold on a second" does not mean "throw out everything you did today."

**Straw man.** Stop is a mute button. The agent keeps writing to your tables, sending, scheduling, while the screen says "Stopped." You find out a minute later when the wrong meal lands in your log. The screen lied to you.

| Pros | Cons |
|---|---|
| You never lose long work to one tap | Wrong work keeps going after you tap |
| Tapping Stop feels safe | "Stopped" is not the whole truth |
| Matches how you talk to a person | You have to hunt down each job to cancel it |
| Cheap to build: end the reply, drop the late text | Hard to trust when something is actually wrong |
| Background jobs keep their own controls | The mistake you tapped Stop for may already be queued |

### The middle path (Yui's pick)

Stop ends the reply **and cancels everything that reply queued that has not started yet**. Work that is already running for a while, or that came from an earlier message, keeps going, and the receipt says so with a button to stop it too.

- Fresh work from this turn: cancelled.
- Long jobs already under way: keep going, named in the receipt, one tap to stop.
- Anything from earlier (reminders, timers, other threads): untouched.

The hero at the top of this page is that receipt.

### Scenarios

1. **Basil and the wrong photo.** You snap your lunch, but it is the photo from yesterday. Basil starts working out the macros, saving the meal and updating your groceries. You tap Stop.
   - *Side A:* nothing is saved. Good.
   - *Side B:* the wrong meal lands in your log a few seconds later. Bad.
   - *Middle:* all three were queued by this turn, so all three are cancelled. Good.

2. **Gouda's song and a quick question.** Gouda is rendering a two-minute song. While it works, Gouda starts a long reply about chords. You tap Stop to ask something else.
   - *Side A:* the song render dies. You wanted it.
   - *Side B:* the reply stops, the song keeps going. Good.
   - *Middle:* the render was already running, so it keeps going, and the receipt says "Your song keeps rendering" with "Stop the song too." Good.

3. **Penny plans the week.** You ask Penny to plan your week. She has saved Monday and Tuesday when you notice she put your gym time over your 3 pm meeting. You tap Stop.
   - *Side A:* Wednesday to Sunday never get written. Monday and Tuesday stay, and the receipt says so.
   - *Side B:* Penny finishes all seven days with the clash. You fix it by hand.
   - *Middle:* same as Side A, because the rest of the week was queued by this turn.

4. **A timer from this morning.** Arnold started a rest timer an hour ago. Now he is answering a new question slowly and you tap Stop.
   - *Side A, read strictly:* is the timer part of "the queue"? If yes, it dies. Surprising.
   - *Side B:* the timer keeps going. Good.
   - *Middle:* earlier work is never touched. Good.

5. **Yui files a card.** You ask Yui to add something to the board and to tell the team. It has created the card and is about to post the note when you tap Stop.
   - *Side A:* the card stays (it already happened), the note is never sent.
   - *Side B:* the note goes out anyway.
   - *Middle:* the note was queued by this turn, so it is cancelled. The receipt says "Card created. Note not sent."


### Whichever side wins: Stop has to hold where the work is saved

Added Sep 29, from a Moltbook thread that named the trap: "A polished Stop button has the same problem if the server still accepts the write. Lovely animation, though." So, for either side:

- **Checked at the save, not at the start.** Every write a turn makes re-checks "was Stop tapped?" in the same step that saves it. A job that read "go" ten minutes ago can't land after you tapped Stop.
- **Not sure is its own answer.** If a step was mid-flight when you tapped, and we can't tell whether it landed, the receipt says "not sure, checking" and then the truth. It never retries on its own, so one meal never becomes two.
- **The receipt shows what happened**, not what the agent meant to do.

The wider version of these rules is in four proposals: [Fresh asks](/proposals/fresh-asks), [Checked when it's saved](/proposals/checked-when-saved), [Not sure is an answer](/proposals/not-sure-is-an-answer) and [Receipts](/proposals/receipts).

## Pros

- The middle path keeps Side A's promise where it matters: whatever this turn queued never lands after you tap.
- It keeps Side B's kindness: long work and earlier work survive a tap.
- The receipt tells the truth: what ran, what was cancelled, what is still going.
- Every long job gets its own Stop, so nothing hides.

## Cons

- Two rules to explain instead of one: "this turn" and "already running".
- "Already running" needs a line: a job that started one second ago is not a long job. We would pick a threshold (say 10 seconds) and could get it wrong.
- More to build than either side: cancel checks on every queued step, plus a Stop on each long job.
- Some steps cannot be taken back once they run (a message sent, a push delivered). Stop can only prevent, never undo.

## Cost

M. The app already has the Stop square (YUI-190, built, not yet on a phone). The work is the runtime side: a cancel check before each queued step, a way to mark a job as long-running, the receipt line and a Stop on each running job. Native agents first, then the Hermes plugin (it needs to pass the cancel through), then other runtimes as they support it.

## Risks

- **A late write slips through.** The whole point is that nothing from this turn lands after Stop. We test it: queue three steps, stop after the first, prove the other two never write.
- **Half-done work.** Stop mid-plan leaves some rows saved. The receipt must say exactly which, so the person can keep them or undo them.
- **Runtimes that cannot cancel.** Some agents cannot be stopped mid-call. Then Yui drops the late reply and says "Stopped, but the agent may still finish in the background." Honest beats tidy.
- **The threshold feels random.** If people are surprised by what counted as "already running", we show it in the working row before they tap.

## Open questions

- **Which rule?** (a) Side A, stop everything. (b) Side B, stop the reply only. (c) The middle path. Yui would pick (c).
- **Where is the line for "already running"?** A time (10 seconds), a kind of job (renders, uploads) or whatever the agent marks as long?
- **Should a long press on Stop mean "stop everything"?** One tap for the middle path, hold for Side A.
- **What about shared agents?** When a client taps Stop on an agent they were given, can it cancel work the owner started? Yui would say no.

## Yui's call

Recommend the middle path. Stop has to be a real brake for whatever you just asked, because that is almost always why you tapped it. But one tap should never throw away a song, a plan or a timer you asked for earlier. The receipt makes it honest either way.
