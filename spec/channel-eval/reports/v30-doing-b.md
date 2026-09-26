# Channel eval: v30-doing-b

Guide v30+06701c19 (2710 words), model claude-opus-5-5, 2026-09-26T21:59.

**1/1 passed (100%).**

| category | passed |
|---|---|
| doing | 1/1 |

| case | result | why |
|---|---|---|
| doing-long-turn | pass |  |

## Transcripts

### doing-long-turn (pass)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

````
Five things today: two meetings, two replies, and one ship call.
```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Looking at the board" 3/3
list Today "10:00 Call with Dana (30 min)" "Reply to Sam: venue contract" "Reply: invoice question" "2:00 Mick out of school" "4:00 Design review" +check
ask "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for tuner"
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
```
````
