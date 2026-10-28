// Neural Cantonese/Mandarin recordings only; never use the old eSpeak audio.
window.chineseRecordedNarrator=(()=>{
 let generation=0,audio=null,player=null,rejectPlayback=null;
 function stop(){generation++;if(rejectPlayback){const reject=rejectPlayback;rejectPlayback=null;reject(new DOMException('Stopped','AbortError'))}if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null}player?.remove();player=null}
 async function play(kind,id,blocks,announce){stop();const token=generation;const locale=siteNarrationContent.locale();const entry=window.ROOT_RICE_CHINESE_RECORDINGS?.[locale]?.[kind+'/'+id];
  const local=(en,zh)=>locale==='en'?en:locale==='zh-CN'?simplifyChinese(zh):zh;
  if(!entry)throw new Error(local('No recording is available for this content.','這段內容暫時沒有錄音。'));
  const actual=await siteNarrationContent.hash(blocks);if(token!==generation)return;
  if(entry.hash!==actual)throw new Error(local('This text has changed. Its recording needs to be updated before playback.','這段文字已修改，請先更新錄音，避免讀出舊內容。'));
  audio=new Audio(new URL(entry.file,document.baseURI).href);audio.preload='auto';audio.controls=true;
  player=document.createElement('aside');player.id='site-audio-player';player.setAttribute('aria-label',local('Website recording player','網站錄音播放器'));const note=document.createElement('p');note.textContent=local('Full recording · Tap Play if it does not start automatically.','全文錄音 · 如未自動播放，請按播放鍵。');const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label',local('Stop reading','停止朗讀'));close.onclick=()=>window.rootRiceStopReading?.();player.append(note,audio,close);(document.querySelector('#recipe-dialog').open?document.querySelector('#recipe-detail'):document.body).append(player);
  announce(local('Playing the full website recording.','正在播放網站全文錄音。'));
  try{await new Promise((resolve,reject)=>{rejectPlayback=reject;audio.onended=()=>{rejectPlayback=null;resolve()};audio.onerror=()=>reject(new Error(local('Recording could not load. Check the connection, then try again.','錄音無法載入，請檢查連線後重試。')));audio.play().catch(error=>{if(error.name!=='NotAllowedError')reject(error);else announce(local('Tap Play in the audio player to start the full recording.','請按播放器的播放鍵，開始全文錄音。'))})})}finally{if(token===generation)stop()}
 }
 return {play,stop};
})();
