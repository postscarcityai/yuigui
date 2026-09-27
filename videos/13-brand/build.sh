#!/bin/bash
# Build 13-brand films: music, landscape, reel, posters, mux, then small copies for yuigui.com/brand.
#   videos/13-brand/build.sh sting-ink sting-mark journey ...     (folders; no args = all stings)
# Chapter shorts: videos/13-brand/build.sh short:ink  (the journey windowed by ?chapter=ink, reel only)
set -e
cd "$(dirname "$0")/.."
export YUI_GL=1
SITE=../site/public/brand/lab/films
mkdir -p "$SITE"
small() { # 720p (or 720x1280), CRF 25, audio copied, faststart. $1 in, $2 out
  ffmpeg -v error -y -i "$1" -vf "scale='if(gt(iw,ih),1280,720)':-2" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -c:a copy -movflags +faststart "$2"
}
name() { python3 -c "import sys;print(''.join(w.capitalize() for w in sys.argv[1].split('-')))" "$1"; }
ITEMS=${@:-sting-ink sting-quiet sting-celadon sting-bojagi sting-pop sting-mark}
for it in $ITEMS; do
  if [[ $it == short:* ]]; then
    ch=${it#short:}; d=13-brand/journey
    [ -f $d/work/music.wav ] || python3 $d/music.py
    python3 kit/render.py $d/comp.html video --reel --q chapter=$ch
    python3 kit/render.py $d/comp.html poster --reel --q chapter=$ch
    read A B < <(python3 -c "import json;w=json.load(open('$d/chapters.json'))['$ch'];print(w[0],w[1])")
    ffmpeg -v error -y -ss $A -t $(python3 -c "print($B-$A)") -i $d/work/music.wav -af "afade=t=in:d=0.3,afade=t=out:st=$(python3 -c "print($B-$A-0.6)"):d=0.6" $d/work/music-$ch.wav
    kit/mux.sh $d/work/silent-reel-$ch.mp4 $d/work/music-$ch.wav $d/Yui_Brand_Short_$(name $ch)_Reel.mp4
    ffmpeg -v error -y -i $d/work/poster-reel-$ch.png -q:v 3 $SITE/short-$ch-9x16.jpg
    small $d/Yui_Brand_Short_$(name $ch)_Reel.mp4 $SITE/short-$ch-9x16.mp4
    continue
  fi
  d=13-brand/$it; N=Yui_Brand_$(name $it)
  [[ $it == sting-* ]] && N=Yui_Brand_Sting_$(name ${it#sting-})
  if [ ! -f $d/music.py ]; then  # the loops: silent, 16:9 and 9:16, straight to the site
    for f in "" --reel; do python3 kit/render.py $d/comp.html video $f; python3 kit/render.py $d/comp.html poster $f; done
    small $d/work/silent.mp4 $SITE/$it-16x9.mp4; small $d/work/silent-reel.mp4 $SITE/$it-9x16.mp4
    ffmpeg -v error -y -i $d/work/poster.png -q:v 3 $SITE/$it-16x9.jpg
    continue
  fi
  python3 $d/music.py
  python3 kit/render.py $d/comp.html video
  python3 kit/render.py $d/comp.html poster
  python3 kit/render.py $d/comp.html video --reel
  python3 kit/render.py $d/comp.html poster --reel
  kit/mux.sh $d/work/silent.mp4 $d/work/music.wav $d/$N.mp4
  kit/mux.sh $d/work/silent-reel.mp4 $d/work/music.wav $d/${N}_Reel.mp4
  ffmpeg -v error -y -i $d/work/poster.png -q:v 3 $SITE/$it-16x9.jpg
  ffmpeg -v error -y -i $d/work/poster-reel.png -q:v 3 $SITE/$it-9x16.jpg
  small $d/$N.mp4 $SITE/$it-16x9.mp4
  small $d/${N}_Reel.mp4 $SITE/$it-9x16.mp4
done
