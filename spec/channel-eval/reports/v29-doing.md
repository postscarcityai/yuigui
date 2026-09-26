# Channel eval: v29-doing

Guide v29+2f4f324b (2647 words), model claude-opus-5-5, 2026-09-26T21:59.

**0/1 passed (0%).**

| category | passed |
|---|---|
| doing | 0/1 |

| case | result | why |
|---|---|---|
| doing-long-turn | FAIL | doing: 0 doing lines with words, want 2 |

## Transcripts

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- doing: 0 doing lines with words, want 2

````
Four things need you today: two meetings, two replies, and one ship call.

```yui
list Today "10:00 Call with Dana (30 min)" "4:00 Design review" +check
list "Reply today" "Sam: venue contract" "Invoice question" +check
ask "Draft both replies for you to check?" "Draft them"|"I'll write them"
ask "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for the tuner"
menu review@contract "Reply to Sam about the venue contract" sub="due today"
menu review@invoice "Answer the invoice question" sub="due today"
menu review@ship "Ship 0.3.3 without the tuner?" sub="board waits on you"
```
````
