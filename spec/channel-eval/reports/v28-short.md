# Channel eval: v28-short

Guide v28+68ed0e65 (2524 words), model claude-opus-5-5, 2026-09-26T21:50.

**0/2 passed (0%).**

| category | passed |
|---|---|
| short | 0/2 |

| case | result | why |
|---|---|---|
| short-status-latest-build | FAIL | words: 49 > 30; sentences: 5 > 3 |
| short-release-go-ahead | FAIL | preset: timeline not in [card say ask choose stat list]; preset: done not in [card say ask choose stat list]; preset: now not in [card say ask choose stat list]; preset: next not in [card say ask choose stat list] |

## Transcripts

### short-status-latest-build (FAIL)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

- words: 49 > 30
- sentences: 5 > 3

````
Yes, this phone is on **build 160**, the newest on TestFlight.

Your **iPad is behind on build 135**. Open TestFlight on it and tap Update.

Nothing newer is out yet. Release 0.3.2, with keys and chords in the music tools and a faster Send tap, is still being built.
````

### short-release-go-ahead (FAIL)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

- preset: timeline not in [card say ask choose stat list]
- preset: done not in [card say ask choose stat list]
- preset: now not in [card say ask choose stat list]
- preset: next not in [card say ask choose stat list]

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords. The faster Send tap isn't in this one because it isn't done yet.

```yui
timeline "0.3.2 release"
done "Release started" at=9:10
now "Building"
next "TestFlight (~9:50)"
menu backlog@release032 "0.3.2 release" sub="building, ~40 min"
```
````
