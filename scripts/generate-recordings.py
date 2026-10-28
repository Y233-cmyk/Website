"""Generate static MP3s with the free eSpeak NG tool and ffmpeg.
Set ESPEAK_BINARY, ESPEAK_DATA_PATH and LD_LIBRARY_PATH for a local installation.
Do not silently use old recordings after editing text: regenerate and deploy both.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json,os,tempfile,re
root=Path(__file__).resolve().parents[1]
scripts=json.loads((root/'audio/recording-text.json').read_text())
exe=os.environ.get('ESPEAK_BINARY','espeak-ng')
voices={'en':'en-us','zh':'yue','zh-CN':'cmn'}
manifest={locale:{}for locale in scripts}
def make(task):
 locale,key,entry=task
 if not entry['blocks']:raise ValueError('Empty narration '+key)
 filename=key.replace('/','-')+'-'+entry['hash'][:12]+'.mp3'
 output=root/'audio'/locale/filename;output.parent.mkdir(parents=True,exist_ok=True)
 if not output.exists():
  text='\n\n'.join(entry['blocks'])
  if locale=='en':
   text=re.sub(r'(\d)\s*g\b',r'\1 grams',text);text=re.sub(r'(\d)\s*ml\b',r'\1 millilitres',text);text=text.replace('°C',' degrees Celsius').replace('kcal','kilocalories').replace('↗','').replace('♡','')
  else:text=text.replace('°C','攝氏度'if locale=='zh'else'摄氏度').replace('kcal','千卡').replace('↗','').replace('♡','')
  with tempfile.TemporaryDirectory()as temp:
   temp=Path(temp);(temp/'script.txt').write_text(text)
   subprocess.run([exe,'-v',voices[locale],'-s','155'if locale=='en'else'150','-f',str(temp/'script.txt'),'-w',str(temp/'speech.wav')],check=True,capture_output=True)
   subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-i',str(temp/'speech.wav'),'-ac','1','-ar','22050','-c:a','libmp3lame','-b:a','40k','-af','apad=pad_dur=0.2',str(output)],check=True,capture_output=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(output)]))
 if duration<1:raise ValueError('Audio too short '+str(output))
 return locale,key,{'file':output.relative_to(root).as_posix(),'hash':entry['hash'],'duration':round(duration,2),'voice':voices[locale],'engine':'eSpeak NG 1.52.0'}
tasks=[(locale,key,entry)for locale,values in scripts.items()for key,entry in values.items()]
with ThreadPoolExecutor(max_workers=4)as pool:
 for i,(locale,key,value)in enumerate(pool.map(make,tasks),1):
  manifest[locale][key]=value
  if i%12==0:print('Generated and verified',i,'/',len(tasks),flush=True)
(root/'audio/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(root/'audio/manifest.js').write_text('window.ROOT_RICE_RECORDINGS='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
print('Completed',len(tasks),'recordings;',round(sum(v['duration']for a in manifest.values()for v in a.values())/60,1),'minutes;',round(sum((root/v['file']).stat().st_size for a in manifest.values()for v in a.values())/1024/1024,1),'MB.',flush=True)
