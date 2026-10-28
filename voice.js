// Teachable Machine audio recognition. Model assets stay on this site's origin.
(() => {
 const dialog=document.getElementById('voice-dialog');
 const start=document.getElementById('start-listening');
 const stop=document.getElementById('stop-listening');
 const status=document.getElementById('voice-live-status');
 const labels=document.getElementById('label-container');
 const footer=document.querySelector('footer');footer.id='footer';const sections=[...document.querySelectorAll('main > section'),footer];
 const text=(en,zh)=>document.documentElement.lang==='en'?en:zh;
 const messages={startListening:['Enable microphone','啟用麥克風'],stopListening:['Disable microphone','停用麥克風'],readCommand:['Read current section','閱讀本節'],nextCommand:['Next section','下一節'],stopCommand:['Stop reading','停止朗讀']};
 function translate(){Object.entries(messages).forEach(([key,values])=>{document.querySelector(`[data-i="${key}"]`).textContent=values[document.documentElement.lang==='en'?0:1]})}
 translate();new MutationObserver(()=>{cancelReading();translate()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 let recognizer,loading,starting=false,active=false,session=0,current=0,lastCommand='',lastTime=0,noiseSince=null;
 const commandMap={'read':'read','阅读':'read','閱讀':'read','next':'next','下一页':'next','下一頁':'next','stop':'stop','停止':'stop'};
 function findCurrent(){let best=0;const position=innerHeight*.4;sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=position)best=i});return sections[best].id==='voice'?1:best}
 document.getElementById('voice-button').addEventListener('click',()=>{current=findCurrent();if(sections[current].id==='voice')current=1;status.textContent=text('Microphone off. Choose a command or enable listening.','麥克風未開啟。可點選指令或啟用聆聽。')});
 addEventListener('scroll',()=>{if(dialog.open)current=findCurrent()},{passive:true});
 let readingSession=0,readingActive=false,stopCandidateSince=null;
 function cancelReading(){readingSession++;readingActive=false;window.siteNarrator?.stop();window.speechSynthesis?.cancel()}
 function announceReading(message){status.textContent=message;const recipeStatus=document.querySelector('#recipe-reading-status');if(recipeStatus)recipeStatus.textContent=message}
 async function narrateTarget(kind,id){cancelReading();const token=readingSession;const blocks=siteNarrationContent.blocks(kind,id);if(!blocks.length){announceReading(text('Read-aloud is available for the website content and built-in recipes only.','朗讀只適用於網站內容和內置食譜。'));return}readingActive=true;stopCandidateSince=null;
  try{await siteNarrator.play(kind,id,blocks,announceReading);if(token===readingSession){readingActive=false;announceReading(text('Finished reading the whole article.','已完成全文朗讀。'))}}catch(error){if(token===readingSession){readingActive=false;announceReading(error.message)}}
 }
 document.querySelector('#recipe-dialog').addEventListener('close',cancelReading);
 function run(command){
  if(command==='stop'){cancelReading();announceReading(text('Reading stopped.','已停止朗讀。'));return}
  if(command==='next'){
   cancelReading();
   if(current>=sections.length-1){status.textContent=text('You are at the last section.','已到最後一節。');return}
   if(document.querySelector('#recipe-dialog').open)document.querySelector('#recipe-dialog').close();
   current++;sections[current].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   status.textContent=text('Next section: ','下一節：')+(sections[current].querySelector('h1,h2')?.textContent||text('Footer','頁尾'));return;
  }

  if(document.querySelector('#recipe-dialog').open){
   const recipe=recipes.find(r=>r.id===currentRecipeId);
   if(!recipe||recipe.user){cancelReading();announceReading(text('Read-aloud is only for the website’s own recipes. Visitor recipes remain text-only.','朗讀只適用於網站本身的食譜，訪客食譜只提供文字。'));return}
   narrateTarget('recipe',recipe.id);
  }else{current=findCurrent();narrateTarget('section',sections[current].id)}
 }
 // Each section also offers an explicit reader, so narration does not depend
 // on which part of the page is behind the floating voice panel.
 sections.forEach(section=>{
  const controls=document.createElement('div');controls.className='section-reading-controls';
  const read=document.createElement('button');read.type='button';read.className='section-read-button';
  const stopRead=document.createElement('button');stopRead.type='button';stopRead.className='section-read-button';
  function localize(){read.textContent=text('Read this whole section','朗讀本節全文');stopRead.textContent=text('Stop reading','停止朗讀');if(document.documentElement.lang==='zh-CN'){read.textContent=simplifyChinese(read.textContent);stopRead.textContent=simplifyChinese(stopRead.textContent)}}
  localize();new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  read.addEventListener('click',()=>{current=sections.indexOf(section);readSection(section)});stopRead.addEventListener('click',()=>run('stop'));
  controls.append(read,stopRead);section.append(controls);
 });
 function readSection(section){narrateTarget('section',section.id)}

 window.rootRiceReadRecipe=()=>run('read');
 window.rootRiceStopReading=()=>run('stop');
 document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>run(b.dataset.command)));
 function loadScript(src,ready){if(ready())return Promise.resolve();return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>ready()?resolve():reject(new Error('library'));script.onerror=()=>{script.remove();reject(new Error('library'))};document.head.append(script)})}
 async function createModel(){
  if(recognizer)return recognizer;
  if(!loading)loading=(async()=>{
   await loadScript(new URL('./vendor/tf.min.js',document.baseURI).href,()=>!!window.tf);
   await loadScript(new URL('./vendor/speech-commands.min.js',document.baseURI).href,()=>!!window.speechCommands);
   const base=new URL('./my_model/',document.baseURI).href;
   let artifacts=base+'model.json',metadata=base+'metadata.json';
   if(window.ROOT_RICE_AUDIO){const embedded=window.ROOT_RICE_AUDIO;const binary=atob(embedded.weights);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);artifacts={modelTopology:embedded.model.modelTopology,weightSpecs:embedded.model.weightsManifest.flatMap(g=>g.weights),weightData:bytes.buffer};metadata=embedded.metadata}
   const model=speechCommands.create('BROWSER_FFT',undefined,artifacts,metadata);
   await model.ensureModelLoaded();recognizer=model;return model;
  })().finally(()=>{loading=null});
  return loading;
 }
 function predictions(result){
  if(!active)return;
  const scores=Array.from(result.scores);const names=recognizer.wordLabels();
  [...labels.children].forEach((row,i)=>{row.querySelector('meter').value=scores[i];row.querySelector('.score').textContent=Math.round(scores[i]*100)+'%'});
  const best=scores.indexOf(Math.max(...scores));const command=commandMap[names[best]?.trim().toLowerCase()];const now=performance.now();
  // Require a release/noise interval to re-arm a sustained command, plus cooldown.
  if(!command||scores[best]<.75){stopCandidateSince=null;if(noiseSince===null)noiseSince=now;if(now-noiseSince>650)lastCommand='';return}
  noiseSince=null;
  // The laptop speaker can be classified as a command by the microphone.
  // Keep protection active across the gaps between sentences, and require a
  // sustained, very confident Stop rather than a single noisy prediction.
  if(readingActive){
   if(command!=='stop'||scores[best]<.97){stopCandidateSince=null;return}
   if(stopCandidateSince===null){stopCandidateSince=now;return}
   if(now-stopCandidateSince<750)return;
  }else stopCandidateSince=null;
  if(command===lastCommand||now-lastTime<1800)return;
  lastCommand=command;lastTime=now;run(command);
 }
 async function disable(){
  session++;active=false;start.disabled=starting;stop.disabled=true;
  if(recognizer?.isListening())try{await recognizer.stopListening()}catch{}
  status.textContent=text('Microphone off.','麥克風已停用。');
 }
 start.addEventListener('click',async()=>{
  if(starting)return;starting=true;
  const token=++session;start.disabled=true;stop.disabled=false;
  status.textContent=text('Loading audio model…','正在載入音訊模型…');
  try{
   if(!isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('secure');
   const model=await createModel();if(token!==session)return;
   labels.replaceChildren();model.wordLabels().forEach(name=>{const row=document.createElement('div');row.className='prediction';const title=document.createElement('span');title.textContent=name;const meter=document.createElement('meter');meter.min=0;meter.max=1;meter.value=0;meter.setAttribute('aria-label',name);const score=document.createElement('span');score.className='score';score.textContent='0%';row.append(title,meter,score);labels.append(row)});
   lastCommand='';lastTime=-Infinity;noiseSince=null;active=true;
   await model.listen(predictions,{includeSpectrogram:false,probabilityThreshold:0,invokeCallbackOnNoiseAndUnknown:true,overlapFactor:.5,audioTrackConstraints:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(token!==session){if(model.isListening())await model.stopListening();return}
   status.textContent=text('Listening — say Read, Next, or Stop.','正在聆聽 — 請說「閱讀」、「下一页」或「停止」。');
  }catch(error){
   if(token!==session)return;
   await disable();
   const denied=error.name==='NotAllowedError'||error.name==='PermissionDeniedError';
   status.textContent=denied?text('Microphone permission denied. Allow access in browser settings or use the buttons.','麥克風權限被拒絕。請在瀏覽器設定允許使用，或使用按鈕。'):error.message==='secure'?text('Microphone requires HTTPS or localhost and a supported browser. Use the buttons below.','麥克風需要 HTTPS 或 localhost 及支援的瀏覽器。可使用下方按鈕。'):text('Could not start voice recognition. Check microphone permission and try HTTPS or localhost, then retry. Manual controls still work.','無法啟動語音辨識。請檢查麥克風權限，並透過 HTTPS 或 localhost 重試。仍可使用手動按鈕。');
  }finally{starting=false;start.disabled=active;stop.disabled=!active}
 });
 stop.addEventListener('click',disable);
 dialog.addEventListener('close',()=>{disable();cancelReading()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){disable();cancelReading()}});
 window.addEventListener('pagehide',()=>{disable();cancelReading()});
})();
