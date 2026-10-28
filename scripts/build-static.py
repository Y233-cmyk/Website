"""Copy the complete free static site into _site for GitHub Pages."""
from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parents[1];out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
files=['index.html','style.css','app.js','language.js','recipe-content.js','owner-content.js','traditional-revisions.js','voice.js','narration-content.js','static-audio.js','editor.js','RootRice.html']
for name in files:shutil.copy2(root/name,out/name)
for name in ['assets','vendor','my_model']:shutil.copytree(root/name,out/name)
(out/'audio').mkdir()
for name in ['manifest.js','manifest.json']:shutil.copy2(root/'audio'/name,out/'audio'/name)
manifest=json.loads((root/'audio/manifest.json').read_text())
for locale,values in manifest.items():
 if len(values)!=32:raise RuntimeError('Incomplete recordings for '+locale)
 for entry in values.values():
  source=root/entry['file']
  if not source.is_file()or source.stat().st_size<1000:raise RuntimeError('Missing recording '+str(source))
  target=out/entry['file'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
(out/'.nojekyll').write_text('')
print('Built complete static site with',sum(len(v)for v in manifest.values()),'recordings. No backend or speech-service credentials required.')
