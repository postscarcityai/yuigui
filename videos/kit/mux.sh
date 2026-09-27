#!/bin/bash
# Mux a silent render and its music into a delivery file at about -14 LUFS, true peak under -1 dB.
# Uses Apple's AAC encoder (aac_at): ffmpeg's own encoder overshoots peaks by up to 3 dB.
#   kit/mux.sh <folder>/work/silent.mp4 <folder>/work/music.wav <folder>/Name.mp4
set -e
SILENT=$1; MUSIC=$2; OUT=$3
I=$(ffmpeg -hide_banner -nostats -i "$MUSIC" -af ebur128 -f null - 2>&1 | grep -A3 "Integrated" | grep " I:" | awk '{print $2}')
G=$(python3 -c "print(round(max(-12.0, min(2.0, -14 - ($I))), 2))")
enc() { ffmpeg -v error -y -i "$SILENT" -i "$MUSIC" -map 0:v -map 1:a -c:v copy -af "volume=${1}dB" -c:a aac_at -b:a 256k -ar 48000 -movflags +faststart -shortest "$OUT"; }
enc "$G"
read LI TP < <(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | awk '/ I:/{i=$2} /Peak:/{p=$2} END{print i, p}')
if python3 -c "import sys; sys.exit(0 if $TP > -1.0 else 1)"; then
  G=$(python3 -c "print(round($G - ($TP + 1.2), 2))"); enc "$G"
  read LI TP < <(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | awk '/ I:/{i=$2} /Peak:/{p=$2} END{print i, p}')
fi
echo "$OUT: $(ffprobe -v error -show_entries format=duration:stream=width,height -of compact=nk=1 "$OUT" | tr '\n' ' ') | $LI LUFS, true peak $TP dBFS"
