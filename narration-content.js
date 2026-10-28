// One shared extractor for recording generation and runtime playback validation.
// Never include visitor submissions, typed form values, or reader controls.
window.siteNarrationContent={
 locale(){return document.documentElement.lang==='en'?'en':document.documentElement.lang==='zh-CN'?'zh-CN':'zh'},
 blocks(kind,id){
  const root=kind==='recipe'?document.querySelector('#recipe-detail'):document.getElementById(id);
  if(!root)return [];
  if(kind==='recipe'&&!recipes.some(r=>r.id===id&&!r.user))return [];
  const selector=kind==='recipe'?'h1,h2,h3,p,li':'h1,h2,h3,p,li,label>span,select option,.eyebrow,.art-caption,.vertical-label,.section-label,.filters button,.gallery-toolbar>span,footer a';
  const blocks=[...root.querySelectorAll(selector)].filter(node=>{
   if(node.closest('[hidden],.section-reading-controls,#voice-dialog,#site-audio-player,[data-editor-ui]'))return false;
   if(node.matches('.voice-status,#recipe-reading-status')||node.closest('#upload-status'))return false;
   // Gallery filters and personal favourites are dynamic; record the fixed
   // built-in collection below, never visitor card text or empty-state messages.
   if(node.closest('#recipe-grid'))return false;
   return true;
  }).map(node=>node.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);
  if(kind==='section'&&id==='recipes')for(const recipe of recipes.filter(r=>!r.user)){
   blocks.push(recipe.name[idx()],recipe.type[idx()],recipe.time[idx()]);
   const energy=recipeEnergyEstimates[recipe.id];if(energy)blocks.push(this.locale()==='en'?'About '+energy.kcal+' kilocalories per serving.':'每份約 '+energy.kcal+' 千卡。');
  }
  return blocks;
 },
 async hash(blocks){const bytes=new TextEncoder().encode(blocks.join('\n'));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
};
