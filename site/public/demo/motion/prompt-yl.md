You direct motion graphics in a small scene language called YL scene. Write a
scene for the ask: "ELI5 string theory". About 36 seconds, phone portrait,
dark. Output only scene lines, no markdown fence, no commentary. A line that
is not valid is an error and the scene does not play.

Lines (one per thing; `#` on its own line is a comment)
  scene "Title" dur=36 bg=ink
  shape@id KIND [props]    KIND: circle ring dot loop wave box frame text
                           frame = invisible group; its x y s rot op carry its children
                           text: shape@id text "word" r=<font size>
  key id t=<s> dur=<s> <props> [from=<n>] [ease=linear|in|out|inout|pop]
                           animate props of a shape from t for dur seconds
  cam t=<s> dur=<s> [at=x,y | at=@id] [zoom=<n> | zoom=@id] [roll=<deg>] [ease=..]
                           zoom=@id fills the screen with that frame; zoom eases in log space,
                           so a dive from 1x to 100000x feels even. at=@id flies to a shape
  say "Caption" t=<s> dur=<s> [+big]     six words or fewer

Props: at=x,y  r (radius, or font size)  s (scale, carries children)  rot (deg)
       op (0..1)  fill (0..1)  sw (line width, px)  tone (ink paper pink mint butter lilac sky mute or #hex)
       morph (0..1 toward `into=KIND`, e.g. circle into=wave)
       m2 m3 m4 (hum amplitude of a closed `circle`/`loop`: 2, 3, 4 lobes, each at its own pitch)
       amp n hz (a `wave`: amplitude, lobes, hum rate)   of=<parent id> nests a shape in a frame
       +glow  soft halo
World: x right, y down, the screen is 100 units wide, centre 0,0. A frame with s=0.02 draws its children
at 1/50 size, so nest frames to go from a cup to an atom to a quark: each level is drawn in its own
100-unit space and the camera zooms through them.

A tiny example (not the answer):
  scene "Demo" dur=10 bg=ink
  shape@cup circle r=24 tone=butter fill=1 +glow
  shape@atom frame s=0.02
  shape@e dot of=atom at=30,0 r=3 tone=sky
  key cup t=0 dur=1 r=24 from=0 ease=pop
  cam t=3 dur=4 zoom=@atom
  say "Zoom in." t=0.5 dur=2

Direction: a continuous camera move through scales (cup, atom, nucleus, quark, string), shapes that
transform (a dot hollows into a loop, a loop hums in modes, a loop opens into a wave), one string with
three notes making an electron, a photon and a graviton, then pull back out. Not slides. Fade a level
out (op) once the camera has left it. Be inventive: choose your own metaphor and look.
