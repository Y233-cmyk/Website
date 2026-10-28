// Browser narration, using available natural/system voices instead of the
// robotic offline MP3s. Text is always taken from the current rendered content.
window.siteNarrator=(()=>{
 let generation=0,current=null,timer=null,startTimer=null,keepAlive=null,rejectPlayback=null;
 function stop(){generation++;window.chineseRecordedNarrator?.stop();clearTimeout(timer);clearTimeout(startTimer);clearInterval(keepAlive);timer=keepAlive=null;current=null;if(rejectPlayback){const reject=rejectPlayback;rejectPlayback=null;reject(new DOMException('Stopped','AbortError'))}window.speechSynthesis?.cancel()}
 function chunks(blocks){const result=[];for(const block of blocks){for(let sentence of block.match(/[^。！？.!?\n]+[。！？.!?]?/g)||[block]){sentence=sentence.trim();while(sentence){const limit=/[\u3400-\u9fff]/.test(sentence)?45:130;let cut=Math.min(limit,sentence.length);if(cut<sentence.length&&limit===130){const space=sentence.lastIndexOf(' ',cut);if(space>40)cut=space}else if(cut<sentence.length){const comma=Math.max(sentence.lastIndexOf('，',cut),sentence.lastIndexOf('；',cut),sentence.lastIndexOf('、',cut));if(comma>15)cut=comma+1}result.push(sentence.slice(0,cut));sentence=sentence.slice(cut).trim()}}}return result}
 function voiceMatches(voice,locale){const code=voice.lang.toLowerCase().replace(/_/g,'-');const name=voice.name||'';if(locale!=='en-US'&&/^en(?:-|$)/.test(code))return false;const cantonese=code.startsWith('yue')||/^zh-(?:hant-)?hk(?:-|$)/.test(code)||/cantonese|廣東|广东|粵語|粤语|sin[- ]?ji/i.test(name);if(locale==='zh-HK')return cantonese;if(locale==='zh-CN')return !cantonese&&(code==='zh'||code.startsWith('cmn')||/^zh-(?:hans|cn|tw|sg|hant)(?:-|$)/.test(code)||/mandarin|普通話|普通话|ting[- ]?ting/i.test(name));return /^en(?:-|$)/.test(code)}
 function selectVoice(locale){return speechSynthesis.getVoices().filter(v=>voiceMatches(v,locale)).sort((a,b)=>{const rank=v=>(/natural|neural|premium|enhanced/i.test(v.name)?20:0)+(/Google|Samantha|Sin-ji|Tingting/i.test(v.name)?10:0)+(v.lang.toLowerCase().replace(/_/g,'-')===locale.toLowerCase()?4:0);return rank(b)-rank(a)})[0]}
 async function readyVoice(locale){let voice=selectVoice(locale);if(voice)return voice;return new Promise(resolve=>{let interval,timeout;function done(value){clearInterval(interval);clearTimeout(timeout);speechSynthesis.removeEventListener?.('voiceschanged',check);resolve(value)}function check(){const v=selectVoice(locale);if(v)done(v)}speechSynthesis.addEventListener?.('voiceschanged',check);interval=setInterval(check,150);timeout=setTimeout(()=>done(selectVoice(locale)),2500)})}

 async function play(kind,id,blocks,announce){stop();const token=generation;const language=siteNarrationContent.locale();const local=(en,zh)=>language==='en'?en:language==='zh-CN'?simplifyChinese(zh):zh;
  if(kind==='recipe'&&!recipes.some(r=>r.id===id&&!r.user))throw new Error(local('Visitor recipes are text-only.','訪客食譜只提供文字。'));
  if((!window.speechSynthesis||!window.SpeechSynthesisUtterance)&&language!=='en'&&window.chineseRecordedNarrator)return window.chineseRecordedNarrator.play(kind,id,blocks,announce);
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)throw new Error(local('Read-aloud is not supported in this browser. Please try Chrome, Edge or Safari.','此瀏覽器不支援朗讀，請試用 Chrome、Edge 或 Safari。'));
  const queue=chunks(blocks);const locale=language==='en'?'en-US':language==='zh-CN'?'zh-CN':'zh-HK';let index=0;announce(local('Preparing the selected voice…','正在準備所選語言的聲音…'));const selectedVoice=await readyVoice(locale);if(token!==generation)return;
  if(language!=='en'&&!selectedVoice){
   if(window.chineseRecordedNarrator)return window.chineseRecordedNarrator.play(kind,id,blocks,announce);
   throw new Error(local('A matching Chinese voice is not available.','暫時找不到合適的中文聲音，請稍後重試。'));
  }

  await new Promise((resolve,reject)=>{rejectPlayback=reject;
   function next(){if(token!==generation)return;if(index>=queue.length){clearInterval(keepAlive);current=null;rejectPlayback=null;resolve();return}
    const utterance=new SpeechSynthesisUtterance(queue[index++]);current=utterance;utterance.lang=selectedVoice?.lang.replace(/_/g,'-')||locale;utterance.rate=.95;if(selectedVoice)utterance.voice=selectedVoice;
    announce(local('Reading the full text: ','正在朗讀全文：')+index+' / '+queue.length);
    utterance.onstart=()=>clearTimeout(startTimer);
    utterance.onend=()=>{clearTimeout(startTimer);if(token===generation){current=null;timer=setTimeout(next,70)}};
    utterance.onerror=()=>{clearTimeout(startTimer);if(token!==generation)return;clearInterval(keepAlive);current=null;rejectPlayback=null;reject(new Error(local('Reading was interrupted. Press Read to restart, or choose another browser voice.','朗讀中斷，可按閱讀重新開始，或改用另一個瀏覽器聲音。')))};
    if(language!=='en')startTimer=setTimeout(()=>{if(token===generation){current=null;rejectPlayback=null;reject(new Error('Chinese browser voice did not start'))}},6000);
    speechSynthesis.speak(utterance);
   }
   keepAlive=setInterval(()=>{if(token===generation&&speechSynthesis.speaking){speechSynthesis.pause();speechSynthesis.resume()}},9000);next();
  }).catch(error=>{if(language!=='en'&&token===generation&&window.chineseRecordedNarrator){clearTimeout(startTimer);clearInterval(keepAlive);speechSynthesis.cancel();return window.chineseRecordedNarrator.play(kind,id,blocks,announce)}throw error});
 }
 // Ask the browser to populate its voices early, without starting any audio.
 window.speechSynthesis?.getVoices();return {play,stop};
})();
