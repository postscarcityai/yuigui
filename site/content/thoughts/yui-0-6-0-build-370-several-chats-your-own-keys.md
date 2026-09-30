---
date: 2026-09-29
tag: release
title: "Yui 0.6.0, build 370: several chats, your own keys, and shortcuts on the icon"
dek: Keep more than one chat with each agent, put your own keys in Keychain and pick which one each agent runs on, and hold the Yui icon to jump into a thread. Build 370 is on TestFlight.
---

```shot
/progress/yui169-app-drawer-dark.webp | Basil's drawer: a New chat button, then three chats newest first
/progress/yui34-keys-list.webp | Settings, Keys: a key on this iPhone only, with this month's spend against its cap
```

Build 370 is on TestFlight. It is still Yui 0.6.0, and it is the biggest drop since build 342, 35 changes later.

Three things you can feel right away. Every agent can hold several chats. Your own keys now live on your phone, and each agent can run on a different one. And the Yui icon on your home screen knows your agents.

## Several chats with one agent

Open the drawer and you see New chat on top, then your chats with that agent, newest first. Tap one and it opens where you left it. Hold a chat to rename it, or delete it after a check.

A new chat still knows you. Screens, the shelf and memory belong to the agent, so your pinned screens are the same in every chat. Only the conversation starts fresh.

```shot
/progress/yui169-app-rename-light.webp | Renaming a chat in place
/progress/yui169-app-delete-sheet-dark.webp | The delete sheet: its messages go, the agent still remembers what it learned
```

## Your own keys, on your phone

Settings has a Keys card. Add a key by paste or scan. It goes into Keychain on this iPhone, behind Face ID, and it never shows again. iCloud is off. You set a monthly cap for each one and watch the month's spend against it.

An agent that needs a key has to ask. You get Allow, Allow once or Don't allow. What each agent may use, and what it spent, is under its own Controls, with a Revoke button. A message that looks like a key is held instead of sent, so you do not paste one into a chat by mistake.

```shot
/progress/yui34-keys-add.webp | The Add a key sheet: provider, paste field, name, monthly cap, iCloud switch off
/progress/yui34-keys-ask.webp | An agent asks to use your fal key, with Allow, Allow once and Don't allow
/progress/yui34-keys-drawer.webp | An agent's Controls, Keys: what it may use, this month's spend and Revoke
```

## Pick which key each agent runs on

Controls, Model has a Runs on card for each agent. Choose Yui's key, Claude or ChatGPT for that one agent. The rest stay where they are. Put Quill on your Claude key and leave Arnold on Yui's. The same plain key form shows up at every stop: Settings, the limit card, Add agent, and Controls.

```shot
/progress/yui139g-3-on-claude-light.webp | One agent set to run on your Claude key
/progress/yui139-2-settings-key-light.webp | The plain key form in Settings
```

## Hold the icon, get your agents

Press and hold the Yui icon on the home screen. Your agents' shortcuts are right there, up to four, and you pick which. Tap Log food, Basil and you land in Basil's thread with the words ready to finish.

```shot
/progress/yui191-icon-hold-menu.webp | The home screen icon held down, showing the agents' shortcuts
```

## A sleeker type, and a calmer stage

Yui's base type is now the system sans with a real nine step scale that follows your text size. Serif is a look an agent can wear, never the base.

```shot
/progress/yui211-2-after-drawer-light.webp | The drawer in the new sans
```

The stage got a pass too. A question fits six lines. The mic stays put with a quiet Back home. Type your own has room to write.

## Also in this build

A reply now quotes what you were looking at: the screen's title and its first rows, or a list's items. A crash when you held a card and tapped Reply is fixed. So is a drawer that stayed empty when a chat was opened before its list arrived. The chip at the top of a chat is gone, since the drawer is the only place you pick an agent.

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 370 checklist, drawn from one line.
say "Try build 370. Tick each one as you go."
list "Open the drawer and start a second chat with an agent" "Rename a chat, then delete one" "Add a key in Settings, Keys" "Set one agent to run on your own key in Controls, Model" "Hold the Yui icon on your home screen" +check
```

Something broken or confusing? The feedback button in TestFlight goes straight onto the board.

```try
/progress | See each change with its screens
/thoughts/yui-0-6-0-the-crew-gets-real-tools | Yui 0.6.0, build 342
```
