"""Extract the exact fixed website narration text for all three language modes.
Run the local site first, then: python3 scripts/extract-recording-text.py
Requires Playwright in the build environment, not on the published website.
"""
from pathlib import Path
import json,hashlib,os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
 page=browser.new_page()
 page.route('https://**/*',lambda route:route.abort())
 page.goto(os.environ.get('SITE_URL','http://127.0.0.1:3000/'),wait_until='networkidle')
 output={}
 for locale in ['en','zh','zh-CN']:
  page.locator('#language').select_option(locale)
  page.wait_for_timeout(100)
  values={}
  for section in page.locator('main > section,footer').evaluate_all('nodes=>nodes.map(n=>n.id)'):
   values['section/'+section]=page.evaluate('(id)=>siteNarrationContent.blocks("section",id)',section)
  for id in page.evaluate('recipes.filter(r=>!r.user).map(r=>r.id)'):
   page.evaluate('(id)=>openRecipe(id)',id)
   page.wait_for_timeout(20)
   values['recipe/'+id]=page.evaluate('(id)=>siteNarrationContent.blocks("recipe",id)',id)
   page.locator('#recipe-dialog .close-dialog').click()
  output[locale]={key:{'blocks':blocks,'hash':hashlib.sha256('\n'.join(blocks).encode()).hexdigest()} for key,blocks in values.items()}
  assert len(output[locale])==32,(locale,len(output[locale]))
 (root/'audio/recording-text.json').write_text(json.dumps(output,ensure_ascii=False,indent=2))
 print('Extracted',sum(len(v)for v in output.values()),'complete recording scripts (25 recipes + 7 sections, three languages).')
 browser.close()
