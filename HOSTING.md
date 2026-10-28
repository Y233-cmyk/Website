# Free static hosting: GitHub Pages

This version uses prerecorded MP3 narration. It needs no Azure account, speech API key, Node server, or paid speech-hosting service. Visitors need an internet connection and a supported modern browser. Microphone permission is always their choice.

## Publication

The repository contains a GitHub Pages Actions workflow. Pushing `main` builds `_site` and deploys the complete site, model and 96 recordings. If GitHub does not allow the workflow to create Pages automatically:

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source → GitHub Actions**.
3. Open **Actions → Publish Root and Rice → Run workflow**.
4. Use the HTTPS address reported by the deployment. For this project it is normally `https://y233-cmyk.github.io/Website/`.

GitHub Pages eligibility depends on the repository/account plan; it is normally free for public repositories. Deployment is not proven until GitHub reports success and the public URL responds. Local edits do not by themselves change the live site.

## Narration coverage

The English, Cantonese and Mandarin MP3s cover each of the 25 built-in recipes and the seven content sections (home, introduction, science, kitchen, recipe-submission explanation, voice introduction and footer). Recipe audio includes ingredients, all method steps, nutrition notes, estimated calories, portion assumptions and dietary/allergen notes. The kitchen's section recording describes the full built-in collection regardless of the current gallery filter. Visitor recipes, typed form values and personal favourites are never recorded.

Visitors press a Read button or enable the microphone and say Read / 阅读. Next / 下一页 changes section; Stop / 停止 stops playback. A native player offers Play/Pause/seek controls if the browser blocks autoplay. Speakers, volume, permission and network access still cannot be forced by a website.

The recordings are generated with free offline **eSpeak NG 1.52.0** voices: en-us, yue and cmn. They are distinctly synthetic/robotic, not human recordings or Azure neural voices. You can replace them with licensed human recordings. The MP3s do not require any installed system speech voices.

## Updating text and recordings

Recordings are fixed assets. A SHA-256 text check prevents playing old wording after a site-content edit. Changed content needs fresh recordings, not an Azure account.

For a build machine with eSpeak NG, ffmpeg and Python Playwright:

1. Start the source site: `python3 -m http.server 3000`.
2. Run `python3 scripts/extract-recording-text.py`.
3. Run `python3 scripts/generate-recordings.py`.
4. Run `python3 scripts/build-static.py`, check the site, and commit the changed text, manifest and audio files together.

The extraction script reads the actual rendered text, not an old copy. Generation checks MP3 durations and records the engine/voice. Existing matching recordings are reused. Do not update only the HTML and assume audio changes automatically.

## Visitor submissions

Visitors may add, edit and delete their own local recipes, but those recipes are text-only and cannot invoke narration. Submissions are stored only in that browser; they are not a shared public collection or an account-based service. No audio or typed recipe text is sent to a third-party speech service.
