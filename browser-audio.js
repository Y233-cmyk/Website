// Browser narration, using available natural/system voices instead of the
// robotic offline MP3s. Text is always taken from the current rendered content.
window.siteNarrator=(()=>{
 let generation=0,current=null,timer=null,keepAlive=null,rejectPlayback=null;
 function stop(){generation++;clearTimeout(timer);clearInterval(keepAlive);timer=keepAlive=null;current=null;if(rejectPlayback){const reject=rejectPlayback;rejectPlayback=null;reject(new DOMException('Stopped','AbortError'))}window.speechSynthesis?.cancel()}
 function chunks(blocks){const result=[];for(const block of blocks){for(let sentence of block.match(/[^。！？.!?\n]+[。！？.!?]?/g)||[block]){sentence=sentence.trim();while(sentence){const limit=/[\u3400-\u9fff]/.test(sentence)?45:130;let cut=Math.min(limit,sentence.length);if(cut<sentence.length&&limit===130){const space=sentence.lastIndexOf(' ',cut);if(space>40)cut=space}else if(cut<sentence.length){const comma=Math.max(sentence.lastIndexOf('，',cut),sentence.lastIndexOf('；',cut),sentence.lastIndexOf('、',cut));if(comma>15)cut=comma+1}result.push(sentence.slice(0,cut));sentence=sentence.slice(cut).trim()}}}return result}
 function selectVoice(locale){const voices=speechSynthesis.getVoices();const match=voice=>{const code=voice.lang.toLowerCase().replace('_','-');if(locale==='zh-HK')return code==='zh-hk'||code.startsWith('yue');if(locale==='zh-CN')return code==='zh-cn'||code.startsWith('cmn');return code==='en-us'||code.startsWith('en-')};return voices.filter(match).sort((a,b)=>{const rank=v=>(/natural|neural|premium|enhanced/i.test(v.name)?20:0)+(/Google|Samantha|Sin-ji|Tingting/i.test(v.name)?10:0)+(v.lang.toLowerCase()===locale.toLowerCase()?2:0);return rank(b)-rank(a)})[0]}
 async function play(kind,id,blocks,announce){stop();const token=generation;const language=siteNarrationContent.locale();const local=(en,zh)=>language==='en'?en:language==='zh-CN'?simplifyChinese(zh):zh;
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)throw new Error(local('Read-aloud is not supported in this browser. Please try Chrome, Edge or Safari.','此瀏覽器不支援朗讀，請試用 Chrome、Edge 或 Safari。'));
  if(kind==='recipe'&&!recipes.some(r=>r.id===id&&!r.user))throw new Error(local('Visitor recipes are text-only.','訪客食譜只提供文字。'));
  const queue=chunks(blocks);const locale=language==='en'?'en-US':language==='zh-CN'?'zh-CN':'zh-HK';let index=0;
  await new Promise((resolve,reject)=>{rejectPlayback=reject;
   function next(){if(token!==generation)return;if(index>=queue.length){clearInterval(keepAlive);current=null;rejectPlayback=null;resolve();return}
    const utterance=new SpeechSynthesisUtterance(queue[index++]);current=utterance;utterance.lang=/[\u3400-\u9fff]/.test(utterance.text)?locale:'en-US';utterance.rate=.95;const voice=selectVoice(utterance.lang);if(voice)utterance.voice=voice;
    announce(local('Reading the full text: ','正在朗讀全文：')+index+' / '+queue.length);
    utterance.onend=()=>{if(token===generation){current=null;timer=setTimeout(next,70)}};
    utterance.onerror=()=>{if(token!==generation)return;clearInterval(keepAlive);current=null;rejectPlayback=null;reject(new Error(local('Reading was interrupted. Press Read to restart, or choose another browser voice.','朗讀中斷，可按閱讀重新開始，或改用另一個瀏覽器聲音。')))};
    speechSynthesis.speak(utterance);
   }
   keepAlive=setInterval(()=>{if(token===generation&&speechSynthesis.speaking){speechSynthesis.pause();speechSynthesis.resume()}},9000);next();
  });
 }
 // Ask the browser to populate its voices early, without starting any audio.
 window.speechSynthesis?.getVoices();return {play,stop};
})();
