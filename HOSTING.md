# Free GitHub Pages hosting and Chinese read-aloud

The site prefers fluent browser voices. English remains browser narration. Cantonese and Mandarin now recognise common language tags, wait for delayed voice loading, and never select an English voice for Chinese text. If a matching Chinese voice is missing, fails, or never starts, the site uses prepared neural Chinese MP3s instead.

## Publication

Push `main`; GitHub Actions builds `_site` and publishes Pages. Settings → Pages must use GitHub Actions. The project address is https://y233-cmyk.github.io/Website/ . Confirm the workflow succeeds before calling an update live.

This needs no Azure account, paid speech API, Node backend or visitor installation. The fallback ONNX models run only on the author's build machine, not in visitors' browsers. Normal audio playback may require tapping Play if a browser blocks autoplay.

## Coverage

All seven website sections and all 25 built-in recipes support English, Traditional Chinese/Cantonese and Simplified Chinese/Mandarin. Chinese narration does not switch number-only chunks to English. Native matching covers tags including zh-Hant-HK, yue-HK and zh-Hans-CN. Chinese fallback covers all 32 fixed targets in each Chinese locale. Old eSpeak recordings remain archived in the repository but are not deployed or used.

Visitor-uploaded recipes remain editable and text-only, with no reader buttons and a spoken Read guard. They are stored in that browser, not shared publicly. Read-aloud never requires microphone access. The microphone is requested only after Enable microphone is clicked; it is needed only for Read/Next/Stop voice commands.

## Updating recordings after text edits

Browser voices read current rendered text immediately. Chinese fallback recordings are fixed assets; a text-hash check prevents playing stale wording. If content changes, regenerate the affected recordings:

1. Serve the source folder: `python3 -m http.server 3000`.
2. Run `python3 scripts/extract-recording-text.py` (requires build-time Playwright).
3. Install the pinned build-only dependencies from `scripts/neural-requirements.txt`.
4. Set `NEURAL_MODEL_DIR` to the verified official sherpa-onnx model folders, then run `python3 scripts/generate-neural-recordings.py`.
5. Commit changed text, `audio/neural-manifest.*` and corresponding `audio/neural-*/*.mp3` together.

Source models, publisher checksums and licence/provenance notes are documented in `audio/neural-notices/README.md`. Models/weights are not deployed. A few on-page English reference headings have an equivalent Chinese spoken rendering in the Chinese audio. The original on-page text remains unchanged.

## Voice quality

Native voice availability varies across devices. The new fallback uses neural VITS Cantonese and MeloTTS Mandarin, not the robotic eSpeak engine. It is synthetic speech, not a human recording. Real-device pronunciation and voice-command accuracy should still be checked by a listener; automated tests can verify routing, coverage, playback and correct language metadata but cannot prove subjective fluency.
