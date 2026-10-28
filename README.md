# Root & Rice / 本·米

A three-language Cantonese food and nutrition site with 25 built-in recipes, horizontal browsing, category filters, local favourites and personal recipes. The owner's supplied photos and traditional recipe revisions are retained.

## Free static website

Serve this folder with `python3 -m http.server 3000`, or publish it using the included GitHub Pages workflow. No paid speech provider, secret, backend or package installation is needed for visitors. Run `npm run check` for JavaScript syntax and `python3 scripts/build-static.py` for the deployment artifact.

`RootRice.html` is the bundled HTML version. Its recordings are separate MP3s in `audio/`; use the live site, or download the complete repository if opening it locally. Downloading only the HTML does not also download 96 audio files.

## Reading and voice commands

All 25 built-in recipes and all seven website sections have English, Cantonese and Mandarin MP3 narration. Audio uses free offline eSpeak NG voices, which sound robotic. Visitors do not need matching installed speech voices. Playback has native Play/Pause/seek controls, and the page has Read/Next/Stop buttons. The local Teachable Machine model supports Read / 阅读, Next / 下一页 and Stop / 停止 after microphone permission is granted over HTTPS or localhost.

Visitor-uploaded recipes are text-only. Their reader buttons are absent, spoken Read is rejected when one is open, and the section extractor excludes visitor cards and typed form values. Personal recipes and favourites stay in browser storage and are not shared publicly.

Each recording has the SHA-256 hash of the exact current narration text. If text changes, playback asks for a refreshed recording rather than reading an old recipe. See [HOSTING.md](HOSTING.md) for regenerating audio and enabling Pages.

## Content and photos

The collection has eight soups, ten mains and seven desserts. The owner's 25 photo payloads remain unchanged. Scale-down presentation avoids magnifying/cropping the small originals, but cannot recover detail absent from the source. Calorie values are approximate per-serving kitchen estimates with explicit serving counts and assumptions, not certified measurements; calculations are in `recipe-energy-estimates.json`. Health notes describe nutrients without promising cures.

Cooking references consulted include the public HowToCook guides for sweet-and-sour pork, tomato eggs, corn/rib soup, scallion oil, lettuce and mango-pomelo dessert. These are cooking references, not medical sources. The requested traditional mango-pomelo version uses sago rather than the chia in that reference. Major food safety temperatures, allergens and frying considerations are included.

## Design and licences

Opening motion is adapted from GreenSock's https://codepen.io/GreenSock/pen/YzbPYMx . The horizontal recipe reveal is inspired by https://github.com/Aqro/gooey-hover-codrops . This is a lightweight SVG/CSS adaptation, not the original Three.js shader. Vendored TensorFlow, speech-commands and OpenCC files retain their licence notices. Offline recording generation uses eSpeak NG; only generated MP3 output is deployed, not the speech-tool binary.

The public version hides local template-editor controls. Editor functionality is local/export-based, not authenticated remote site administration. Do not treat it as a secure public content-management backend.

## Validation and deployment result

All 96 MP3s decode fully. Browser checks verified all 96 text hashes, actual MP3 playback and end-of-playback in English/Cantonese/Mandarin with `speechSynthesis` unavailable, section Play/Stop, gallery-filter stability, model startup with a simulated microphone, text-only visitor submissions and stale-text rejection. Twelve simulated model-score sequences exercised English and Chinese Read→Stop/Next labels across the three interface locales, including interruption before the normal Read cooldown. These checks do not establish accuracy for a real speaker or accent; the exported Teachable Machine model determines that.

The first GitHub Pages workflow reached publication configuration but GitHub rejected automatic site creation with `Resource not accessible by integration`. The repository owner must select **Settings → Pages → Source: GitHub Actions**, then rerun **Publish Root and Rice**. Files/recordings are uploaded; a successful live deployment is not yet verified.
