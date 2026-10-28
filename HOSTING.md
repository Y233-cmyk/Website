# Free GitHub Pages hosting with fluent browser read-aloud

The active website has returned to the browser narration system preferred by the owner. Robotic eSpeak MP3s are no longer included in the deployment or used by the reader. No Azure account, speech API key or paid speech backend is required.

## Publish

Push changes to `main`; the included GitHub Actions workflow builds `_site` and deploys Pages. Source must be GitHub Actions under repository Settings → Pages. The project address is normally https://y233-cmyk.github.io/Website/ . Confirm a successful workflow before calling a change live.

## Reading

Every content section, including the footer, and all 25 built-in recipes use current text. Narration includes ingredients, every method step, nutrition, calories and notes. English requests en-US, Cantonese zh-HK and Mandarin zh-CN. Available Natural/Neural/Premium/Enhanced voices are preferred. Short utterances are spoken sequentially to avoid first-sentence-only playback. Stop, Next, a language change or closing a recipe cancels the current session.

Voice availability and quality depend on the browser/device. This free solution cannot guarantee an identical natural voice on every device. A visitor needs a browser with Web Speech synthesis and a suitable voice; some voices may use the browser provider's online service. If unavailable, the site explains this and all written content remains accessible. No robotic MP3 fallback is used.

Microphone access is separate and optional. It is requested only after Enable microphone is clicked; denial leaves reading and manual navigation usable. Teachable Machine command recognition runs locally and listens for Read / 阅读, Next / 下一页, and Stop / 停止. Actual accent accuracy is determined by the exported model and needs real-speaker testing.

## Updates and visitor recipes

Changing website text now changes what is read immediately; recordings do not need regenerating. Visitor recipes remain editable, local to their browser and text-only, with both reader buttons and spoken Read blocked for those recipes. Section narration excludes visitor cards and typed form values.
