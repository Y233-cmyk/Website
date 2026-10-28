"""Copy the complete free static site into _site for GitHub Pages."""
from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parents[1];out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
files=['index.html','style.css','app.js','language.js','recipe-content.js','owner-content.js','traditional-revisions.js','voice.js','narration-content.js','browser-audio.js','neural-audio.js','editor.js','RootRice.html']
for name in files:shutil.copy2(root/name,out/name)
for name in ['assets','vendor','my_model']:shutil.copytree(root/name,out/name)
(out/'audio').mkdir()
for name in ['neural-manifest.js','neural-manifest.json']:shutil.copy2(root/'audio'/name,out/'audio'/name)
manifest=json.loads((root/'audio/neural-manifest.json').read_text())
for locale in ['zh','zh-CN']:
 if len(manifest.get(locale,{}))!=32:raise RuntimeError('Missing Chinese neural recordings for '+locale)
 for entry in manifest[locale].values():
  source=root/entry['file'];target=out/entry['file'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
shutil.copytree(root/'audio/neural-notices',out/'audio/neural-notices')
(out/'.nojekyll').write_text('')
print('Built static site with browser read-aloud. Chinese neural fallback recordings included; old robotic recordings excluded.')
