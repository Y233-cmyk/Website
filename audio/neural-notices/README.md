# Chinese neural audio provenance

These are newly generated neural-speech recordings, not the earlier eSpeak recordings. Runtime ONNX models are not distributed in the website; the site serves generated MP3 files only. No Azure, browser-installed Chinese voice or paid runtime API is needed for fallback playback.

- Cantonese: official sherpa-onnx `vits-cantonese-hf-xiaomaiiwn` release conversion of the upstream xiaomaiiwn/vits-cantonese model. Conversion source: https://github.com/csukuangfj/vits-cantonese/tree/cantonese . Upstream model: https://huggingface.co/xiaomaiiwn/vits-cantonese . The original VITS software licence is retained here; do not confuse the software licence with a separate assertion about every training-data right.
- Mandarin: official sherpa-onnx `vits-melo-tts-zh_en`, converted from MyShell MeloTTS. The model package's MIT licence is retained here.
- Source release: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models . Downloaded models were verified against the publisher's SHA-256 checksum list before use.

Official release archive SHA-256 values:
- Cantonese: bf3013cd4be34f531b7e514e708d835584dd60c9ad6eaf467ac1402005c04e46
- Mandarin: e58351ed7149f290a54534538badd4077cdbe6fddc964b24d0bee870415d1514

Traditional Chinese is normalized to simplified characters only for lexicon lookup, while the Cantonese model still produces Cantonese pronunciation. The on-page Traditional Chinese remains unchanged. A few English reference headings are rendered as their Chinese meaning in the Chinese recordings; exact raw page-text hashes still detect stale content. The recording generator includes these spoken expansions.
