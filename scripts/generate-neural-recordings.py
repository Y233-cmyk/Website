"""Generate natural Cantonese/Mandarin fallback MP3s with offline neural models.
Needs sherpa-onnx, numpy, soundfile and ffmpeg on the BUILD machine only.
Set NEURAL_MODEL_DIR to the verified official sherpa-onnx model directories.
Models are not shipped to website visitors; no runtime speech account is needed.
"""
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import subprocess,json,os,tempfile,re,time
import numpy as np
import sherpa_onnx,soundfile
from opencc import OpenCC
TO_SIMPLE=OpenCC("t2s")
ROOT=Path(__file__).resolve().parents[1]
MODELS=Path(os.environ['NEURAL_MODEL_DIR'])
MODELS_CACHE={}
REPLACEMENTS={
 'Less restriction. More balance.':'少一点限制，多一点平衡。',
 'ADA: BMI cut points for diabetes screening in Asian Americans (2015) ↗':'美国糖尿病学会，亚裔美国人糖尿病筛查的身体质量指数界值，二零一五年。',
 'BMJ: Low and very low carbohydrate diets for type 2 diabetes, systematic review (2021) ↗':'英国医学杂志，第二型糖尿病的低碳水及极低碳水饮食系统综述，二零二一年。',
 'Harvard: Healthy Eating Plate ↗':'哈佛大学，健康饮食餐盘。',
 'Motion inspiration: GreenSock & Codrops ↗':'动画灵感来自格林索克与科德罗普斯。'
}
def model_for(locale):
 if locale in MODELS_CACHE:return MODELS_CACHE[locale]
 if locale=='zh':
  m=MODELS/'vits-cantonese-hf-xiaomaiiwn';vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(m/'vits-cantonese-hf-xiaomaiiwn.onnx'),lexicon=str(m/'lexicon.txt'),tokens=str(m/'tokens.txt'));rules=str(m/'rule.fst')
 else:
  m=MODELS/'vits-melo-tts-zh_en';vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(m/'model.onnx'),lexicon=str(m/'lexicon.txt'),tokens=str(m/'tokens.txt'),dict_dir=str(m/'dict'));rules=','.join(str(m/n)for n in ['date.fst','number.fst'])
 config=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=vits,num_threads=1),rule_fsts=rules,max_num_sentences=1)
 if not config.validate():raise RuntimeError('Invalid neural model config')
 MODELS_CACHE[locale]=sherpa_onnx.OfflineTts(config);return MODELS_CACHE[locale]
def make(task):
 locale,key,entry=task;file='audio/neural-'+locale+'/'+key.replace('/','-')+'-'+entry['hash'][:12]+'-v1.mp3';target=ROOT/file;target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():
  tts=model_for(locale);segments=[]
  for block in entry['blocks']:
   text=REPLACEMENTS.get(block,block).replace('°C','摄氏度').replace('BMI','身体质量指数').replace('kcal','千卡').replace('↗','').replace('♡','')
   text=TO_SIMPLE.convert(text).replace('乾','干')
   text=re.sub('THE ART OF EATING WELL','好好吃饭',text,flags=re.I)
   text=re.sub(r'ROOT\s*&\s*RICE','本米',text,flags=re.I)
   text=re.sub(r'\bJPEG\b','J P E G',text,flags=re.I);text=re.sub(r'\bPNG\b','P N G',text,flags=re.I);text=re.sub(r'\bWebP\b','W E B P',text,flags=re.I);text=re.sub(r'\bMB\b','兆字节',text,flags=re.I)
   text=text.replace('／','，').replace('·','，').replace('/','，').replace('—','，').replace('「','').replace('」','').replace('（','，').replace('）','，')
   if locale=='zh':text=re.sub(r'\bRead\b','阅读',text,flags=re.I);text=re.sub(r'\bNext\b','下一页',text,flags=re.I);text=re.sub(r'\bStop\b','停止',text,flags=re.I)
   result=tts.generate(text,sid=0,speed=.96)
   if not len(result.samples):raise RuntimeError('Empty neural speech: '+text)
   segments.extend([np.asarray(result.samples,dtype=np.float32),np.zeros(int(result.sample_rate*.16),dtype=np.float32)])
  samples=np.concatenate(segments)
  with tempfile.TemporaryDirectory()as temp:
   wav=Path(temp)/'speech.wav';soundfile.write(wav,samples,result.sample_rate)
   subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-i',str(wav),'-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','56k',str(target)],check=True,capture_output=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(target)]))
 if duration<2:raise RuntimeError('Neural recording too short '+file)
 return locale,key,{'file':file,'hash':entry['hash'],'duration':round(duration,2),'engine':'VITS neural / sherpa-onnx','model':'vits-cantonese-hf-xiaomaiiwn'if locale=='zh'else'vits-melo-tts-zh_en'}
if __name__=='__main__':
 data=json.loads((ROOT/'audio/recording-text.json').read_text());tasks=[(locale,key,entry)for locale in ['zh','zh-CN']for key,entry in data[locale].items()];manifest={'zh':{},'zh-CN':{}};started=time.time()
 with ProcessPoolExecutor(max_workers=4)as pool:
  for i,(locale,key,value)in enumerate(pool.map(make,tasks),1):
   manifest[locale][key]=value
   if i%4==0:print('Neural recordings:',i,'/',len(tasks),'elapsed',round(time.time()-started),'seconds',flush=True)
 (ROOT/'audio/neural-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(ROOT/'audio/neural-manifest.js').write_text('window.ROOT_RICE_CHINESE_RECORDINGS='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
 print('Complete:',len(tasks),'neural Chinese recordings;',round(sum(v['duration']for values in manifest.values()for v in values.values())/60,1),'minutes.',flush=True)
