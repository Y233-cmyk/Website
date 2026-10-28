"""Copy the complete free static site into _site for GitHub Pages."""
from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parents[1];out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
files=['index.html','style.css','app.js','language.js','recipe-content.js','owner-content.js','traditional-revisions.js','voice.js','narration-content.js','browser-audio.js','editor.js','RootRice.html']
for name in files:shutil.copy2(root/name,out/name)
for name in ['assets','vendor','my_model']:shutil.copytree(root/name,out/name)
(out/'.nojekyll').write_text('')
print('Built static site with browser read-aloud. Robotic prerecorded audio is not deployed.')
