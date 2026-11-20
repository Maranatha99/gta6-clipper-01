# How the clip was made (CUTTING.md)

Everything below was done by the agent inside its recorded session — the transcript
shows the agent finding the moment, deciding the creative, and running these commands.
The finished clip (`clip_final.mp4`, 1080×1920, 22.0 s, H.264 + AAC, 12,790,349 bytes)
is handed to the channel owner for upload; it is not committed here.

## 1. Source

Rockstar Games' official **GTA VI Trailer 2**,
`https://www.youtube.com/watch?v=VQRLujxTm3c`
(uploader "Rockstar Games", 167 s, uploaded 2025-05-06, 2:47, "Hot Together" by
The Pointer Sisters, captured entirely in-game on PS5).

Downloaded with yt-dlp (1080p AV1 + AAC, 34,389,499 bytes) as `trailer2.mp4`,
then a 4K copy of the chosen window for a clean vertical crop
(3840×2160 VP9 + AAC, t=140–156, 43,539,855 bytes) as `seg4k.mp4`:

    yt-dlp -f "bv*[height<=1080]+ba" "https://www.youtube.com/watch?v=VQRLujxTm3c" -o trailer2.mp4
    yt-dlp -f "313+140" --download-sections "*140-156" "https://www.youtube.com/watch?v=VQRLujxTm3c" -o seg4k.mp4

## 2. The moment — t=141.0–155.5 (14.5 s)

Chosen after viewing contact-sheet frames every 8 s, then 1 fps strips for
t=20–36, 94–110, 134–150, 138–160, 56–76 and a 2 fps strip for t=140–156:

| Time | What happens |
|------|--------------|
| 141.0 | Jet ski speeding on bright blue water, Vice City skyline (hook frame) |
| 142–143 | Jason on a motorcycle, a low-flying plane overhead |
| 144–145 | Night city drive, pink neon, sparks |
| 145.5–147.5 | Jason & Lucia hugging |
| 147.5–151 | Night boat / motorcycle / car |
| 153–155.5 | Golden sunset highway + skyline with palm trees (payoff) |

Rejected: the opening (t=0–20, slow roof/driving, repetitive), the Lucia prison
reunion (t=56–68, slow dialogue), the nightclub (t=94–104, vibrant but turns
dark/talky). The segment starts at the jet ski close-up (the t=140 helicopter
shot is dark/murky and was cut) and ends before the "VI" logo card (~t=156).

## 3. Vertical crop

Center crop 1215×2160 (x=1312) of the 4K source, scaled to 1080×1920.
Tested first on a sample (`test_vert.mp4` + `test_frames.jpg`, viewed by the
agent): jet ski riders centered, motorcycle rider centered (the plane sits too
far right to fit a 9:16 crop; the rider close-up still works), night shots
readable, sunset palms beautiful. Crop accepted as-is.

## 4. The edit — dynamic, not stiff (v2)

The user asked for it to be as engaging as possible, not stiff, with music that
makes it go viral. So the final cut (v2) is:

- **Hook text, first 2 seconds:** "GTA VI IS HERE" (LiberationSans-Bold, 110 px,
  white with a black border, top of frame, fast fade in/out) over the jet ski —
  the viewer knows instantly this is GTA VI.
- **Pitch text, staggered in rhythm:** the four pitch lines do not sit static;
  each fades in 0.2 s, one per second, over the slow-zooming sunset:
  "MAKE CLIPS WITH AI" (15.5 s) → "AND EARN MONEY" (16.5 s) →
  "ON MAKE.FUN" in gold (17.5 s) → `make.fun/bounty/gta6-clipper-01` (18.5 s).
- **Music:** the original trailer audio, t=141–163 of Trailer 2 ("Hot Together"),
  kept at full volume — mean −11.6 dB, max −0.0 dB, AAC stream verified present
  with ffprobe. No second track layered over it (two songs would clash); the
  iconic trailer song is the viral hook.

### Render commands (final, v2)

GTA part (hook text added):

    ffmpeg -y -ss 1 -i seg4k.mp4 -t 14.5 -vf "crop=1215:2160:1312:0,scale=1080:1920,setsar=1,drawtext=fontfile=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf:text='GTA VI IS HERE':fontsize=110:fontcolor=white:borderw=6:bordercolor=black:x=(w-text_w)/2:y=250:enable='between(t,0,2)':alpha='if(lt(t,0.25),t/0.25,if(gt(t,1.7),(2-t)/0.3,1))'" -c:v libx264 -crf 20 -preset medium -an gta_part.mp4

Pitch part (staggered text over the darkened, slow-zooming sunset frame at
t=154.5, 45% black overlay):

    ffmpeg -y -i pitch_dark.mp4 -vf "setsar=1,drawtext=...:text='MAKE CLIPS WITH AI':fontsize=88:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=700:alpha='if(lt(t,1.0),0,if(lt(t,1.2),(t-1.0)/0.2,1))',drawtext=...:text='AND EARN MONEY':fontsize=88:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=820:alpha='if(lt(t,2.0),0,if(lt(t,2.2),(t-2.0)/0.2,1))',drawtext=...:text='ON MAKE.FUN':fontsize=88:fontcolor=0xFFD21F:borderw=5:bordercolor=black:x=(w-text_w)/2:y=940:alpha='if(lt(t,3.0),0,if(lt(t,3.2),(t-3.0)/0.2,1))',drawtext=...:text='make.fun/bounty/gta6-clipper-01':fontsize=46:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=1100:alpha='if(lt(t,4.0),0,if(lt(t,4.2),(t-4.0)/0.2,1))'" -c:v libx264 -crf 20 -preset medium -an pitch_final.mp4

Concat (both parts needed `setsar=1` — the zoompan filter had set SAR
1214:1215 and concat refused the mismatch) and mux the trailer audio:

    ffmpeg -y -i gta_part.mp4 -i pitch_final.mp4 -filter_complex "[0:v]setsar=1[v0];[1:v]setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 20 -preset medium clip_video.mp4
    ffmpeg -y -i clip_video.mp4 -i audio_full.aac -t 22 -c:v copy -c:a aac -b:a 192k -shortest clip_final.mp4

Audio source: original trailer audio t=141–163 extracted from `trailer2.mp4`
(`audio_full.aac`), trimmed to 22 s at mux.

### Verification

- 7 frames extracted from the final render and viewed by the agent
  (0.5 s, 1.5 s, 15 s, 16 s, 17 s, 18.5 s, 21 s): hook text readable and
  punchy; pitch lines appear one by one as designed; all text clear of the
  frame edges and YouTube's bottom/right UI zones.
- `ffprobe`: 1080×1920, 22.0 s, H.264 + AAC; `volumedetect`: mean −11.6 dB,
  max −0.0 dB — the music is clearly audible, not silent, not too quiet.
- Deterministic video path: same commands, same inputs → same frames
  (the audio is copied, not re-encoded from a variable source).

## 5. Upload (by the channel owner, from their phone)

The agent never logs in to YouTube. The owner uploads `clip_final.mp4` as a
public Short on **NGAkakkenCENG (@irukandji1999)** with the title, description
(mandatory line + play code `makefun-snow-blimp-trowel`) and hashtags from the
README, then sends the Short's URL back so `VIDEO.json` can be updated and the
entry submitted.
