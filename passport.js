/* Fort Canning Heritage Passport — educational prototype.
   Image matching is a coarse, on-device visual similarity check, NOT location or identity verification. */
(() => {
  const places = [
    {id:'sang-nila',title:'Sang Nila Utama Garden',period:'ANCIENT SINGAPURA',img:'assets/sang-nila-utama-garden.jpg',query:'Sang Nila Utama Garden Fort Canning Park Singapore',story:'This garden evokes the atmosphere of ancient Southeast Asian palace gardens. Fort Canning Hill, once known as Bukit Larangan, is believed to have been associated with the royal centre of 14th-century Singapura. The garden helps visitors imagine this early layer of Singapore’s history.'},
    {id:'fort-gate',title:'Fort Gate',period:'THE 19TH-CENTURY FORT',img:'assets/fort-gate.jpg',query:'Fort Gate Fort Canning Park Singapore',story:'Fort Gate is a surviving remnant of the military fort established on the hill in the 1860s. Government Hill was renamed Fort Canning after Charles John Canning. Its remaining stonework offers a glimpse of the hill’s colonial military role.'},
    {id:'battlebox',title:'Battlebox',period:'WORLD WAR II',img:'assets/battlebox.jpg',query:'Battlebox Fort Canning Singapore',story:'Battlebox was built as an underground British command centre before World War II. On 15 February 1942, Lieutenant-General Arthur Percival made the decision to surrender Singapore to Japanese forces here. The site is a place for reflection on wartime history.'},
    {id:'raffles-garden',title:'Raffles Garden',period:'COLONIAL BOTANICAL HERITAGE',img:'assets/raffles-garden.jpg',query:'Raffles Garden Fort Canning Park Singapore',story:'Raffles Garden interprets plants connected with Singapore’s colonial-era botanical interests and the natural environment. It is one of Fort Canning’s historical gardens, linking the park’s green landscape with the story of Singapore’s early botanical exploration.'},
    {id:'tree-tunnel',title:'Fort Canning Tree Tunnel',period:'LANDSCAPE & LIVING HERITAGE',img:'assets/tree-tunnel.jpg',query:'Fort Canning Tree Tunnel Singapore',story:'The Tree Tunnel is a popular photographic landmark that reveals the relationship between Fort Canning’s mature greenery and its built landscape. It offers a gateway to discover nearby gardens and the hill’s layered natural and cultural heritage.'}
  ];
  const KEY='fort-canning-heritage-places-v2';
  let visited = {};
  try { const v=JSON.parse(localStorage.getItem(KEY)||'{}'); if(v && typeof v==='object') visited=v; } catch (_) {}
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function store(){try{localStorage.setItem(KEY,JSON.stringify(visited));}catch(_){}}
  function updateStamps(){
    const n=places.filter(p=>visited[p.id]).length;
    document.getElementById('stampStatus').textContent=`${n} of ${places.length} places visited`;
    document.getElementById('stamps').innerHTML=places.map((p,i)=>`<div class="stamp ${visited[p.id]?'earned':''}" aria-label="${esc(p.title)}: ${visited[p.id]?'collected':'not collected'}"><span class="stamp-symbol">${visited[p.id]?'✥':'?'}</span><span>0${i+1}</span><span>${visited[p.id]?'COLLECTED':'LOCKED'}</span></div>`).join('');
  }
  function mapsLink(p){return 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination='+encodeURIComponent(p.query);}
  function mapEmbed(p){return 'https://maps.google.com/maps?q='+encodeURIComponent(p.query)+'&z=16&output=embed';}
  function renderPlaces(){
    document.getElementById('placesGrid').innerHTML=places.map((p,i)=>`<article class="place-card" id="stop-${esc(p.id)}">
      <img class="place-photo" src="${esc(p.img)}" alt="Reference photo of ${esc(p.title)}" loading="lazy">
      <div class="place-inner"><div class="place-topline">CHECKPOINT 0${i+1} · ${esc(p.period)}</div><h3>${esc(p.title)}</h3>
      <div class="place-badge ${visited[p.id]?'done':''}" id="badge-${esc(p.id)}">${visited[p.id]?'✓ PASSPORT STAMP COLLECTED':'○ AWAITING YOUR VISIT'}</div>
      <p>Compare your view with the reference photo. Use the map below to locate the landmark.</p>
      <iframe class="place-map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map showing ${esc(p.title)}" src="${esc(mapEmbed(p))}"></iframe>
      <div class="place-actions"><a href="${esc(mapsLink(p))}" target="_blank" rel="noopener noreferrer">↗ Walking directions</a>
      <button type="button" class="capture-button" data-camera="${esc(p.id)}" aria-label="Take a photograph of ${esc(p.title)}"><svg class="camera-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg> Take a photo</button></div>
      <input class="camera-input" id="camera-${esc(p.id)}" type="file" accept="image/*" capture="environment" aria-label="Capture ${esc(p.title)} photograph">
      <p class="photo-note">On phones this opens the camera when supported; on computers it may open a file picker. Images are checked locally and are not uploaded.</p>
      <div class="place-feedback" id="feedback-${esc(p.id)}" aria-live="polite" hidden></div>
      <div class="place-story" id="story-${esc(p.id)}" ${visited[p.id]?'':'hidden'}><h4>✥ Heritage story unlocked</h4><p>${esc(p.story)}</p></div>
      </div></article>`).join('');
    document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>document.getElementById('camera-'+b.dataset.camera).click()));
    places.forEach(p=>document.getElementById('camera-'+p.id).addEventListener('change',e=>checkPhoto(p,e.target.files?.[0])));
    updateStamps();
  }
  async function getSignature(src){
    const img=new Image(); img.decoding='async';
    if(src instanceof File){const url=URL.createObjectURL(src);try{img.src=url;await img.decode();}finally{URL.revokeObjectURL(url);}}
    else {img.src=src;await img.decode();}
    const canvas=document.createElement('canvas');canvas.width=48;canvas.height=48;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,48,48);
    const a=ctx.getImageData(0,0,48,48).data;let hist=Array(24).fill(0),lum=[];
    for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2];hist[Math.min(7,r>>5)]++;hist[8+Math.min(7,g>>5)]++;hist[16+Math.min(7,b>>5)]++;lum.push(.299*r+.587*g+.114*b);}
    return {hist:hist.map(x=>x/2304),lum};
  }
  function similarity(a,b){
    // Very approximate comparison: global colour distribution and coarse brightness pattern.
    // NOT robust to viewpoint, lighting, crops or visually similar unrelated scenes.
    let delta=0;for(let i=0;i<24;i++)delta+=Math.abs(a.hist[i]-b.hist[i]);
    const histScore=Math.max(0,1-delta/6);
    let bright=0;for(let i=0;i<a.lum.length;i++)bright+=Math.abs(a.lum[i]-b.lum[i])/255;
    const pixelScore=Math.max(0,1-bright/a.lum.length);
    return .55*histScore+.45*pixelScore;
  }
  async function checkPhoto(p,file){
    if(!file)return;
    const box=document.getElementById('feedback-'+p.id);box.hidden=false;
    if(!file.type.startsWith('image/')){box.textContent='Please select or capture an image.';return;}
    box.textContent='Checking your photograph on this device…';
    let score;
    try{const [ref,shot]=await Promise.all([getSignature(p.img),getSignature(file)]);score=similarity(ref,shot);}catch(err){box.textContent='This photo could not be read. Please try a different image.';return;}
    const url=URL.createObjectURL(file);
    box.innerHTML=`<strong>Photo captured</strong><img alt="Your captured photo" src="${url}"><p>${score>=.88?'Your photo looks visually similar to the reference.':'The automatic check could not confidently match the reference photo.'}</p><p class="photo-note">Experimental image comparison only. This does not verify your GPS location or prove that the photograph shows the landmark. Different lighting and camera angles can affect the result.</p><div class="review-actions"><button class="confirm" type="button" data-confirm="${esc(p.id)}">${score>=.88?'Collect stamp (confirm visit)':'I visited this place — confirm manually'}</button><button type="button" data-retake="${esc(p.id)}">Retake photo</button></div>`;
    const im=box.querySelector('img');im.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
    box.querySelector('[data-confirm]').addEventListener('click',()=>completePlace(p));
    box.querySelector('[data-retake]').addEventListener('click',()=>{document.getElementById('camera-'+p.id).value='';document.getElementById('camera-'+p.id).click();});
  }
  function completePlace(p){
    visited[p.id]=true;store();updateStamps();
    document.getElementById('badge-'+p.id).textContent='✓ PASSPORT STAMP COLLECTED';
    document.getElementById('badge-'+p.id).classList.add('done');
    document.getElementById('story-'+p.id).hidden=false;
    const box=document.getElementById('feedback-'+p.id);
    box.hidden=false;box.innerHTML='<strong>✥ Stamp collected!</strong><p>You have recorded this landmark in your heritage passport. Its story is now unlocked below.</p>';
    document.getElementById('story-'+p.id).scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  window.resetHeritagePassport=()=>{visited={};store();renderPlaces();};
  renderPlaces();
})();
