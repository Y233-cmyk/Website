# Root & Rice / 本·米

A three-language Cantonese food and nutrition website with 25 built-in recipes, horizontal browsing, category filters, local favourites and editable visitor recipes. The owner's supplied photographs and traditional recipe revisions are retained. Calorie notes are ingredient-based per-serving estimates, not measured nutrition labels.

## Run and publish

Run `python3 -m http.server 3000`, or push `main` to publish through the included GitHub Pages workflow. `npm run check` validates JavaScript and `python3 scripts/build-static.py` assembles `_site`. No Azure account, secret, speech API or server backend is needed for visitors.

## Read-aloud and voice commands

All seven content sections and all 25 built-in recipes can be read in full. English uses browser speech. Cantonese/Traditional Chinese and Mandarin/Simplified Chinese wait for the browser voice list and match language tags including zh-Hant-HK, yue-HK and zh-Hans-CN. Every chunk stays in the selected language; an English voice is never selected for Chinese text.

If a Chinese voice is missing, fails or does not start, `neural-audio.js` uses a corresponding newly generated neural Chinese MP3. There are 32 Cantonese and 32 Mandarin fallback recordings in `audio/neural-*`, with text hashes that prevent stale wording. This is not the earlier robotic eSpeak audio; those archived files are excluded from deployment. English remains on the fluent browser reader. See `audio/neural-notices/README.md` for model sources, checksum verification and licence provenance.

Recordings cover the current sections, recipe ingredients, all steps, benefits, calorie estimates and notes. Browser voices read edited text immediately; fallback recordings need regenerating after content changes. HOSTING.md documents the build process. The ONNX models run only on the author's build machine and are not downloaded by visitors.

Read / 阅读 starts the current section or open built-in recipe. Next / 下一页 moves on; Stop / 停止 cancels reading. Buttons work without a microphone. Microphone access is requested only after Enable microphone is clicked, over HTTPS or localhost, and the visitor may decline. Recognition uses the uploaded Teachable Machine model; actual speaker/accent accuracy requires real-speaker testing.

Visitor recipes remain text-only, editable and local to their browser. Narration rejects them, section extraction excludes their cards and typed values, and no visitor recipe text is sent to a speech service. This is not an account-based public recipe-sharing backend.

## Editing and photos

Public mode hides the local template editor. Editing/export controls are not secure server administration. Uploaded photos are retained unchanged and displayed without excessive enlargement/cropping; source detail is limited by the original resolution. `recipe-energy-estimates.json` records nutrition assumptions and serving counts.

## Design and third-party files

Opening motion is adapted from https://codepen.io/GreenSock/pen/YzbPYMx . The horizontal image reveal is inspired by https://github.com/Aqro/gooey-hover-codrops . These are lightweight native/SVG adaptations, not the original Three.js implementation. Vendored TensorFlow, speech-commands and OpenCC files retain their licence notices. Chinese fallback audio uses the verified official sherpa-onnx Cantonese VITS and Mandarin MeloTTS conversions; model weights are not deployed.

Native voices vary by device. Neural fallback is synthetic, not a human recording; pronunciation and subjective fluency should be checked by listeners. Automated tests verify language routing, complete content, playback and controls rather than proving a voice sounds human.

## Chinese routing verification

Checks covered script-tag Cantonese/Mandarin voices, delayed voice arrival, strict exclusion of English voices for Chinese, selected-language number chunks, and fallback selection. All 64 fixed Chinese targets matched their current text hashes. Actual Cantonese/Mandarin MP3 playback and completion worked with only English voices exposed, and Chinese playback also worked with browser speech synthesis unavailable. Full native section/recipe narration, English preservation, Stop, text-only visitor recipes, stale-recording rejection, no microphone request during reading and no paid speech API requests were checked. All 64 MP3 files decoded fully. Automated playback checks do not prove subjective voice quality or real-speaker recognition accuracy.
