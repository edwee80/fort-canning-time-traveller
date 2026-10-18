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
    document.getElementById('downloadCertificate').disabled=n!==places.length;
    document.getElementById('downloadCertificate').textContent=n===places.length?'↓ Download your completion certificate (PDF)':'↓ Download certificate (complete all 5)';
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
      <button type="button" class="capture-button" data-camera="${esc(p.id)}" aria-label="Take a photograph of ${esc(p.title)}"><svg class="camera-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg> Take a photo</button><button type="button" class="manual-stamp" data-manual="${esc(p.id)}">✥ Stamp manually</button></div>
      <input class="camera-input" id="camera-${esc(p.id)}" type="file" accept="image/*" capture="environment" aria-label="Capture ${esc(p.title)} photograph">
      <p class="photo-note">On phones this opens the camera when supported; on computers it may open a file picker. Images are checked locally and are not uploaded.</p>
      <div class="place-feedback" id="feedback-${esc(p.id)}" aria-live="polite" hidden></div>
      <div class="place-story" id="story-${esc(p.id)}" ${visited[p.id]?'':'hidden'}><h4>✥ Heritage story unlocked</h4><p>${esc(p.story)}</p></div>
      </div></article>`).join('');
    document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>document.getElementById('camera-'+b.dataset.camera).click()));
    places.forEach(p=>document.getElementById('camera-'+p.id).addEventListener('change',e=>checkPhoto(p,e.target.files?.[0])));
    document.querySelectorAll('[data-manual]').forEach(b=>b.addEventListener('click',()=>{const p=places.find(x=>x.id===b.dataset.manual);if(p && window.confirm('Confirm that you have visited '+p.title+'? Manual stamps are self-reported and do not verify your location.'))completePlace(p,'manual');}));
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
  function completePlace(p,method='photo'){
    visited[p.id]={date:new Date().toISOString(),method};store();updateStamps();
    document.getElementById('badge-'+p.id).textContent='✓ PASSPORT STAMP COLLECTED';
    document.getElementById('badge-'+p.id).classList.add('done');
    document.getElementById('story-'+p.id).hidden=false;
    const box=document.getElementById('feedback-'+p.id);
    box.hidden=false;box.innerHTML='<strong>✥ Stamp collected!</strong><p>You have recorded this landmark in your heritage passport. Its story is now unlocked below.</p>';
    showHeritageDialog(p);
  }

  const dialog=document.getElementById('heritageDialog');
  let returnFocus=null;
  function showHeritageDialog(p){
    returnFocus=document.activeElement;
    document.getElementById('heritageDialogTitle').textContent=p.title;
    document.getElementById('heritageDialogText').textContent=p.story;
    dialog.hidden=false;document.body.classList.add('heritage-dialog-open');
    document.getElementById('closeHeritageDialog').focus();
  }
  function closeHeritageDialog(){dialog.hidden=true;document.body.classList.remove('heritage-dialog-open');returnFocus?.focus?.();}
  document.getElementById('closeHeritageDialog').addEventListener('click',closeHeritageDialog);
  document.getElementById('heritageDialogDone').addEventListener('click',closeHeritageDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeHeritageDialog();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeHeritageDialog();});
  const intro='Fort Canning Hill, once known as Bukit Larangan, has played many roles in Singapore’s history. It is associated with the royal centre of 14th-century Singapura, later served as Government Hill and a colonial military fort, and became the site of a British underground command centre during World War II. Today, its historical gardens, surviving structures and green spaces invite visitors to explore these overlapping stories.';
  function getPDF(orientation='portrait'){
    const PDF=(window.jspdf&&window.jspdf.jsPDF)||window.jsPDF;
    if(!PDF){
      document.getElementById('downloadHelp').textContent='PDF generator could not load. If you are offline, ensure assets/jspdf.umd.min.js is present and reload.';
      return null;
    }
    document.getElementById('downloadHelp').textContent='Preparing your PDF…';
    return new PDF({orientation,unit:'mm',format:'a4'});
  }
  const heritageGuideData = [
    {
      id: 'sang-nila',
      title: 'Sang Nila Utama Garden',
      period: '14TH-CENTURY ANCIENT SINGAPURA',
      location: 'Southern Slopes near Canning Rise & Cox Terrace',
      photoKey: 'sang-nila',
      historyTitle: 'The Forbidden Hill & The Srivijayan Royal Garden',
      historyText: 'Long before colonial arrival in 1819, Fort Canning Hill was known to indigenous Malays as Bukit Larangan ("The Forbidden Hill"). Local tradition and 14th-century archaeological excavations confirm that this hill served as the royal palace compound and ancestral burial ground of ancient Singaporean kings. Named in honor of Sang Nila Utama (Sri Tri Buana)—the Srivijayan prince who according to the Malay Annals founded Singapura in 1299 after spotting an auspicious lion-like beast—this themed garden recreates the aura of a 14th-century Southeast Asian royal estate.',
      highlightsTitle: 'Architectural & Botanical Features',
      highlightsText: 'The garden exhibits a classical symmetrical Javanese palace layout punctuated by Candi Bentar (traditional split entrance gates) built of warm red brick, symbolizing the transition from the earthly realm into a tranquil sanctuary. Serene reflective water pools pay homage to the nearby Pancur Larangan (Forbidden Spring), where royal court consorts bathed in hillside freshwater streams. The surrounding flora highlights culturally revered species: fragrant gardenias, champaca (Magnolia champaca), Ixora, and fruit trees historically cultivated in royal Southeast Asian orchards.',
      fieldNote: 'Field Tip: Walk through the Candi Bentar split gates to view the tranquil reflective pools and examine the delicate carvings echoing ancient Majapahit and Srivijaya craftsmanship.'
    },
    {
      id: 'fort-gate',
      title: 'Fort Gate & 19th-Century Citadel',
      period: 'BRITISH COLONIAL MILITARY ERA (1859–1907)',
      location: 'Hilltop Plateau surrounding Fort Canning Centre',
      photoKey: 'fort-gate',
      historyTitle: 'The Hilltop Fortress of Captain Collyer',
      historyText: 'In 1859, mounting European defence concerns prompted the British administration to transform Government Hill into a formidable hilltop fortress. Designed by Captain (later Colonel) George Chancellor Collyer of the Madras Engineers and completed in the 1860s, the stronghold was officially christened Fort Canning after Charles John Canning, the first Viceroy of India. The citadel commanded panoramic artillery firing arcs over Singapore Harbour, designed to protect the settlement from foreign naval incursions and provide a defended European refuge.',
      highlightsTitle: 'Fortress Anatomy & Surviving Relics',
      highlightsText: 'The original installation spanned the entire hilltop, equipped with high earthworks, thick masonry ramparts, an underground powder magazine, barracks for 400 soldiers, and heavy 68-pounder artillery batteries. Although the fortress was decommissioned in 1907 and largely dismantled in 1926 to build the hilltop reservoir, the imposing Fort Gate stands today as the fortress’s primary surviving portal. It features heavy wrought-iron gates, a fortified Gothic archway, and embrasures for musket fire. Two authentic 9-pounder rifled muzzle-loading cannons remain stationed adjacent to the gate.',
      fieldNote: 'Field Tip: Inspect the thick masonry walls flanking the gate. Look for the narrow vertical musket embrasures designed for defenders guarding the sally port.'
    },
    {
      id: 'battlebox',
      title: 'The Battlebox Underground Bunker',
      period: 'WORLD WAR II & MALAYA COMMAND (1936–1942)',
      location: 'Cox Terrace, Nine Metres beneath Fort Canning Hill',
      photoKey: 'battlebox',
      historyTitle: 'Secret Nerve Centre of Malaya Command',
      historyText: 'Excavated between 1936 and 1938, the Battlebox (Headquarters Malaya Command Operations Bunker) was an emergency underground military command post built nine metres deep beneath the crest of Fort Canning Hill. Designed to be bomb-proof and gas-proof against 500-pound aerial bombs, the reinforced concrete subterranean bunker housed 29 interconnected operational rooms, including tactical plotting rooms, telephone and cipher exchanges, and its own dedicated air-filtration plant.',
      highlightsTitle: 'The Surrender Decision: 15 February 1942',
      highlightsText: 'On the morning of 15 February 1942—the first day of Chinese New Year—Lieutenant-General Arthur Percival assembled his senior division and fortress commanders within the Battlebox plotting room. With Singapore\'s municipal water supply catastrophically severed, fuel and ammunition depleted, and Japanese artillery pounding the town, Percival made the momentous decision to capitulate. Hours later, British envoys carrying a white flag proceeded to the Old Ford Factory to formalize the surrender—often cited by Winston Churchill as the largest capitulation in British military history.',
      fieldNote: 'Field Tip: The bunker’s exterior blast doors and ventilation shafts still blend naturally into the hillside foliage, demonstrating wartime concealment engineering.'
    },
    {
      id: 'raffles-garden',
      title: 'Raffles Garden & Botanical Heritage',
      period: 'COLONIAL BOTANICAL EXPLORATION (1819–1826)',
      location: 'Upper Hill Plateau near Fort Canning Lighthouse',
      photoKey: 'raffles-garden',
      historyTitle: 'Singapore\'s First Government House & Experimental Gardens',
      historyText: 'In January 1823, Sir Stamford Raffles erected his personal residence—Singapore’s first Government House, a 100-foot attap-and-timber bungalow—upon this gentle hilltop ridge. Writing to friends in London, Raffles marveled that the location offered "the most picturesque view of the harbour and the rising town." Beyond administrative governance, Raffles was a passionate naturalist and Fellow of the Royal Society. In 1822, together with Danish botanist Dr. Nathaniel Wallich, Raffles established Singapore\'s very first 48-acre botanical and experimental garden across Fort Canning Hill.',
      highlightsTitle: 'Economic Spice Cultivation & Heritage Plantings',
      highlightsText: 'Raffles sought to cultivate economic spices that could sustain the young trading colony, introducing more than 1,000 nutmeg seedlings, clove trees, and cinnamon bushes. Although the initial colonial spice plantation ceased by 1829, it seeded Singapore\'s enduring botanical tradition, later giving rise to the Singapore Botanic Gardens. Today’s Raffles Garden showcases authentic heritage spice plants, aromatic trees, and indigenous flora encountered by 19th-century botanical expeditions in the Malay Archipelago.',
      fieldNote: 'Field Tip: Locate the historical flagpole and lighthouse nearby, and take in the breeze that first inspired Raffles to establish Singapore’s botanical research on this summit.'
    },
    {
      id: 'tree-tunnel',
      title: 'Fort Canning Tree Tunnel',
      period: 'CONTEMPORARY URBAN LANDSCAPE & LIVING HERITAGE',
      location: 'Northern Park Perimeter at Penang Road & Canning Rise',
      photoKey: 'tree-tunnel',
      historyTitle: 'Architectural Aperture & Living Canopy',
      historyText: 'The Fort Canning Tree Tunnel is a celebrated pedestrian underpass constructed along the northern base of the hill near Dhoby Ghaut and Penang Road. Designed to facilitate pedestrian transit between the civic district and the historic parkland, the structure features a dramatic open-air cylindrical light well encasing a spiral masonry staircase. Looking upward from the base of the stairwell, visitors gaze through a circular concrete aperture framed by a giant, umbrella-shaped heritage Rain Tree (Samanea saman) and trailing tropical ferns.',
      highlightsTitle: 'Connecting Urban Modernity with 700 Years of History',
      highlightsText: 'The Tree Tunnel functions as an evocative transitional portal, welcoming visitors from Singapore\'s bustling shopping and university corridor into the serene, centuries-old greenery of Bukit Larangan. Its photogenic contrast between raw masonry architecture and vibrant living foliage draws travelers from around the globe, exemplifying Singapore’s City in Nature philosophy. Ascending the stairs leads directly into Fort Canning’s historical garden network and higher heritage trails.',
      fieldNote: 'Field Tip: Stand at the base of the stairs and look directly upwards to admire how the sprawling branches of the heritage Rain Tree frame the open sky.'
    }
  ];

  function guidePDF(){
    try {
      const doc = getPDF('portrait');
      if (!doc) return;
      const images = window.GUIDE_IMAGES || {};

      function drawPageFrame(pageNum, totalPages, pageTitle) {
        // Warm parchment background
        doc.setFillColor(251, 246, 234);
        doc.rect(0, 0, 210, 297, 'F');

        // Double borders
        doc.setDrawColor(166, 130, 78);
        doc.setLineWidth(0.85);
        doc.rect(10, 10, 190, 277);
        doc.setDrawColor(204, 184, 153);
        doc.setLineWidth(0.35);
        doc.rect(13, 13, 184, 271);

        // Top running header
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(112, 82, 54);
        doc.text('FORT CANNING TIME TRAVELLER  ·  HERITAGE FIELD GUIDE', 18, 20);
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.text(pageTitle, 192, 20, { align: 'right' });
        doc.setDrawColor(194, 170, 132);
        doc.setLineWidth(0.3);
        doc.line(18, 23, 192, 23);

        // Bottom running footer
        doc.line(18, 274, 192, 274);
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(125, 105, 88);
        doc.text('Preserving Singapore\'s 700-Year Heritage  ·  National Parks Board & Heritage Documentation', 18, 279);
        doc.setFont('times', 'bold');
        doc.text('Page ' + pageNum + ' of ' + totalPages, 192, 279, { align: 'right' });
      }

      function addParagraph(text, x, y, maxWidth = 174, fontSize = 9.6, lineHeight = 4.6) {
        doc.setFont('times', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(58, 46, 36);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * lineHeight;
      }

      // ==========================================
      // PAGE 1: COVER & ANNOTATED HERITAGE TRAIL MAP
      // ==========================================
      drawPageFrame(1, 6, 'Trail Map & Site Directory');

      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(50, 36, 25);
      doc.text('The Heritage Landmarks of Fort Canning', 18, 33);

      doc.setFont('times', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(115, 85, 58);
      doc.text('A comprehensive visitor field guide and annotated map across 700 years of Singapore history.', 18, 40);

      // Map Image (174mm wide by 125mm high)
      if (images['map']) {
        doc.setDrawColor(154, 119, 74);
        doc.setLineWidth(0.4);
        doc.rect(17.5, 43.5, 175, 126.5);
        doc.addImage(images['map'], 'JPEG', 18, 44, 174, 125);
      }

      // Map Legend Header
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(157, 80, 59);
      doc.text('VISITOR CHECKPOINT DIRECTORY & TRAIL KEY', 18, 176);
      doc.setDrawColor(194, 170, 132);
      doc.line(18, 178, 192, 178);

      const directory = [
        { num: '01', name: 'Sang Nila Utama Garden', era: '14th-Century Ancient Singapura', desc: 'Javanese royal palace garden, Candi Bentar split gates, and sacred Forbidden Spring heritage.' },
        { num: '02', name: 'Fort Gate & Ramparts', era: 'Colonial Military Fort (1860s)', desc: 'Surviving heavy iron entrance gate, garrison wall embrasures, and 9-pounder British cannons.' },
        { num: '03', name: 'The Battlebox Bunker', era: 'World War II Command Post', desc: 'Bomb-proof subterranean labyrinth 9m underground where Singapore\'s surrender was decided in 1942.' },
        { num: '04', name: 'Raffles Garden', era: 'First Botanic Garden (1822)', desc: 'Homage to Stamford Raffles\' 1823 residence and the first experimental nutmeg & clove plantations.' },
        { num: '05', name: 'Fort Canning Tree Tunnel', era: 'Living Landscape Heritage', desc: 'Subterranean spiral staircase looking up into the majestic canopy of a heritage Rain Tree.' }
      ];

      let dirY = 184;
      directory.forEach((item) => {
        // Badge circle
        doc.setFillColor(157, 80, 59);
        doc.circle(23, dirY + 2.5, 3.8, 'F');
        doc.setFont('times', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(item.num, 23, dirY + 3.8, { align: 'center' });

        // Title & Era
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(60, 42, 28);
        doc.text(item.name, 29, dirY + 2);

        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(135, 95, 60);
        doc.text('·  ' + item.era, 29 + doc.getTextWidth(item.name) + 3, dirY + 2);

        // Description
        doc.setFont('times', 'normal');
        doc.setFontSize(8.8);
        doc.setTextColor(80, 68, 55);
        doc.text(item.desc, 29, dirY + 6.2);

        dirY += 15.8;
      });

      doc.setFont('times', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(110, 90, 75);
      doc.text('Use the locator pins (01–05) on the map above to navigate each historic milestone on Fort Canning Hill.', 18, 269);

      // ==========================================
      // PAGES 2 - 6: DETAILED HERITAGE ARTICLES & PHOTOS
      // ==========================================
      heritageGuideData.forEach((place, index) => {
        doc.addPage();
        const pageNum = index + 2;
        drawPageFrame(pageNum, 6, 'Checkpoint 0' + (index + 1) + ' · ' + place.title);

        // Top Status & Period
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(157, 80, 59);
        doc.text('CHECKPOINT 0' + (index + 1) + '  ·  ' + place.period, 18, 31);

        const isCollected = !!visited[place.id];
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(isCollected ? 79 : 140, isCollected ? 105 : 95, isCollected ? 68 : 80);
        doc.text(isCollected ? '✓ PASSPORT STAMP COLLECTED' : '○ AWAITING FIELD VISIT', 192, 31, { align: 'right' });

        // Title
        doc.setFont('times', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(50, 36, 25);
        doc.text(place.title, 18, 39);

        // Location
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(115, 85, 58);
        doc.text('Location: ' + place.location, 18, 45);

        // Landmark Photo
        if (images[place.photoKey]) {
          doc.setDrawColor(154, 119, 74);
          doc.setLineWidth(0.4);
          doc.rect(17.5, 48.5, 175, 83);
          doc.addImage(images[place.photoKey], 'JPEG', 18, 49, 174, 82);
        }

        // Caption
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(115, 95, 78);
        doc.text('Field Reference Photograph: ' + place.title + ', Fort Canning Hill, Singapore.', 18, 136);

        // Section 1: History
        let textY = 144;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(157, 80, 59);
        doc.text(place.historyTitle, 18, textY);
        doc.setDrawColor(194, 170, 132);
        doc.line(18, textY + 2, 192, textY + 2);

        textY = addParagraph(place.historyText, 18, textY + 7, 174, 9.6, 4.6);

        // Section 2: Highlights
        textY += 3.5;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(157, 80, 59);
        doc.text(place.highlightsTitle, 18, textY);
        doc.setDrawColor(194, 170, 132);
        doc.line(18, textY + 2, 192, textY + 2);

        textY = addParagraph(place.highlightsText, 18, textY + 7, 174, 9.6, 4.6);

        // Field Observation Box
        textY += 3.5;
        const noteLines = doc.splitTextToSize(place.fieldNote, 166);
        const boxHeight = Math.max(13, noteLines.length * 4.4 + 5);
        doc.setFillColor(243, 234, 218);
        doc.setDrawColor(185, 155, 115);
        doc.setLineWidth(0.4);
        doc.roundedRect(18, textY, 174, boxHeight, 1.5, 1.5, 'FD');

        doc.setFont('times', 'bolditalic');
        doc.setFontSize(8.8);
        doc.setTextColor(110, 65, 40);
        doc.text(noteLines, 22, textY + 5.2);
      });

      doc.save('Fort-Canning-Visited-Heritage-Guide.pdf');
      document.getElementById('downloadHelp').textContent = 'Visited heritage guide PDF downloaded!';
    } catch(err){
      console.error(err);
      document.getElementById('downloadHelp').textContent = 'Could not generate PDF: ' + (err?.message || err);
    }
  }
  function drawFloret(doc, cx, cy, size = 1.35, color = [157, 80, 59]) {
    doc.setFillColor(...color);
    doc.setDrawColor(...color);
    const r = size * 0.30;
    const d = size * 0.68;
    doc.circle(cx, cy - d, r, 'F');
    doc.circle(cx, cy + d, r, 'F');
    doc.circle(cx - d, cy, r, 'F');
    doc.circle(cx + d, cy, r, 'F');
    doc.circle(cx, cy, r * 1.05, 'F');
    const dd = d * 0.52;
    const rd = r * 0.38;
    doc.circle(cx - dd, cy - dd, rd, 'F');
    doc.circle(cx + dd, cy - dd, rd, 'F');
    doc.circle(cx - dd, cy + dd, rd, 'F');
    doc.circle(cx + dd, cy + dd, rd, 'F');
  }

  function certificatePDF(){
    if(places.some(p=>!visited[p.id]))return;
    try {
      const doc=getPDF('landscape');if(!doc)return;
      
      // Warm parchment background
      doc.setFillColor(251, 246, 234);
      doc.rect(0, 0, 297, 210, 'F');
      
      // Double border frame
      doc.setDrawColor(166, 130, 78);
      doc.setLineWidth(1.0);
      doc.rect(10, 10, 277, 190);
      doc.setDrawColor(194, 170, 132);
      doc.setLineWidth(0.4);
      doc.rect(14, 14, 269, 182);

      // Top line with clean vector florets
      drawFloret(doc, 22, 24.5, 1.5, [140, 105, 70]);
      doc.setTextColor(92, 68, 46);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('REPUBLIC OF STORIES', 26, 26);
      drawFloret(doc, 73, 24.5, 1.5, [140, 105, 70]);
      doc.text('NO. FC-001', 275, 26, { align: 'right' });

      // Heading
      doc.setFont('times', 'bold');
      doc.setFontSize(30);
      doc.setTextColor(50, 37, 26);
      doc.text('HERITAGE PASSPORT', 148.5, 47, { align: 'center' });

      // Five stamp circles in a row (refined and smaller)
      const startX = 49.5;
      const stepX = 49.5;
      const cy = 101;
      const rOuter = 19.5;
      const rInner = 17.6;

      places.forEach((p, i) => {
        const cx = startX + i * stepX;
        
        // Double concentric circle
        doc.setDrawColor(157, 80, 59);
        doc.setLineWidth(0.65);
        doc.circle(cx, cy, rOuter);
        doc.setLineWidth(0.35);
        doc.circle(cx, cy, rInner);

        // Top floret emblem (dainty & refined)
        drawFloret(doc, cx, cy - 11.2, 1.35, [157, 80, 59]);

        // Place Name (Bolder and well-proportioned)
        doc.setFont('times', 'bold');
        doc.setTextColor(60, 42, 28);
        
        let lines;
        if (p.id === 'sang-nila') {
          lines = ['Sang Nila Utama', 'Garden'];
        } else if (p.id === 'tree-tunnel') {
          lines = ['Fort Canning', 'Tree Tunnel'];
        } else {
          lines = [p.title];
        }

        if (lines.length === 1) {
          doc.setFontSize(12);
          doc.text(lines[0], cx, cy - 0.4, { align: 'center' });
        } else {
          doc.setFontSize(10.5);
          doc.text(lines[0], cx, cy - 2.8, { align: 'center' });
          doc.text(lines[1], cx, cy + 1.8, { align: 'center' });
        }

        // Checkpoint number
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(157, 80, 59);
        doc.text('0' + (i + 1), cx, cy + 8.0, { align: 'center' });

        // Status
        doc.setFont('times', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(157, 80, 59);
        doc.text('COLLECTED', cx, cy + 12.2, { align: 'center' });
      });

      // Bottom texts
      doc.setFont('times', 'italic');
      doc.setFontSize(11.5);
      doc.setTextColor(92, 70, 54);
      doc.text('A stamp is awarded after a visitor photo is checked or manually confirmed.', 148.5, 148, { align: 'center' });

      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(105, 78, 48);
      doc.text('FORT CANNING HILL   ·   SINGAPORE', 148.5, 164, { align: 'center' });

      const dateStr = new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(130, 110, 95);
      doc.text('Completed on ' + dateStr + '  ·  Educational Prototype', 148.5, 177, { align: 'center' });

      doc.save('Fort-Canning-Time-Traveller-Certificate.pdf');
      document.getElementById('downloadHelp').textContent='Completion certificate PDF downloaded!';
    } catch(err){
      console.error(err);
      document.getElementById('downloadHelp').textContent='Could not generate certificate: '+(err?.message||err);
    }
  }
  document.getElementById('downloadGuide').addEventListener('click',guidePDF);
  document.getElementById('downloadCertificate').addEventListener('click',certificatePDF);

  window.resetHeritagePassport=()=>{visited={};store();renderPlaces();};
  renderPlaces();
})();
