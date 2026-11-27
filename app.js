const categories = { concerti: 'Concerti', storie: 'Ritratti', sport: 'Sport', eventi: 'Eventi' };

// Copertine e gallerie usano le fotografie originali del portfolio.
const descriptions=['Un artista al microfono, di profilo sul palco','Un cantante illuminato da luce blu','Il palco e il pubblico sotto un fascio di luce','Il pubblico di un concerto tra luci blu e rosse','Un artista si esibisce davanti al pubblico','Un cantante sul palco sotto luci blu','Un ritratto in silhouette davanti a una tenda azzurra','Un dettaglio di un tronco nel prato','Una figura in costume con una spada nel bosco','Un ritratto in costume tra gli alberi','Una figura incappucciata all’aperto','Una figura in costume seduta su un tetto','Due pugili e l’arbitro sul ring','Un incontro di pugilato, guantoni rossi e blu','Un pugile con i guantoni alzati','Un pugile in primo piano tra le corde','Un volto concentrato dietro le corde del ring','Due pugili sul ring in bianco e nero','Due pugili si affrontano sotto le luci del ring','Un pugile in bianco e nero','Un padre tiene in braccio un bambino','Una festa all’aperto con una nuvola di colore rosa','Un momento condiviso durante una festa in giardino','Un uomo con un bambino tra le braccia','Un abbraccio durante una festa all’aperto','Un gruppo di persone festeggia in giardino','Una donna dipinge all’aperto'];
const landscapeIds = new Set([2,4,5,13,16,17,19,20,26,27]);
const dimensions = [[799, 1200], [1200, 799], [799, 1200], [1200, 799], [1200, 799], [799, 1200], [799, 1200], [798, 1200], [798, 1200], [799, 1200], [798, 1200], [799, 1200], [1200, 799], [799, 1200], [799, 1200], [1200, 799], [1200, 798], [799, 1200], [1200, 798], [1200, 799], [799, 1200], [798, 1200], [799, 1200], [799, 1200], [798, 1200], [1200, 799], [1200, 799]];
const photos=Array.from({length:27},(_,i)=>{
  const filename=`mga${String(i+1).padStart(3,'0')}.webp`;
  return {width:dimensions[i][0],height:dimensions[i][1],id:i+1,src:`assets/thumb/${filename}`,full:`assets/full/${filename}`,category:i<6?'concerti':i<12?'storie':i<20?'sport':'eventi',orientation:landscapeIds.has(i+1)?'landscape':'portrait',alt:descriptions[i]};
});

// Ordine dedicato per categoria: composizione a colonne, con accoppiamenti mirati.
const categoryOrder = {
  concerti: [4,1,3,2,5,6],
  sport: [19,20,14,15,16,13,18,17],
  storie: [7,8,9,10,11,12],
  eventi: [24,25,26,22,23,27]
};
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('#lightbox');
const viewer = document.querySelector('#viewer-image');
let visible = [], visiblePhotos = [], visibleImages = [], current = 0, opener = null, touchStart = null;

// Generazione DOM sicura: le descrizioni sono testo, mai HTML interpolato.
function createPhotoButton(photo, index) {
  const button = document.createElement('button');
  button.className = 'photo';
  button.type = 'button';
  button.setAttribute('aria-label', `Apri fotografia — ${photo.alt}`);
  const img = document.createElement('img');
  img.width = photo.width;
  img.height = photo.height;
  img.dataset.full = photo.full;
  img.alt = photo.alt;
  img.loading = index < 6 ? 'eager' : 'lazy';
  if (index < 3) img.fetchPriority = 'high';
  img.decoding = 'async';
  const reveal = () => {
    if (!img.naturalWidth) return;
    const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    decoded.then(() => img.classList.add('is-loaded'));
  };
  img.addEventListener('load', reveal, { once: true });
  img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
  img.src = photo.src;
  if (img.complete) reveal();
  button.append(img);
  button.addEventListener('click', () => {
    opener = button;
    current = visiblePhotos.indexOf(photo);
    showPhoto();
    dialog.showModal();
    document.body.classList.add('viewing');
  });
  return button;
}
function render(category) {
  visible = categoryOrder[category].map(id => photos[id - 1]);
  visiblePhotos = visible;
  gallery.replaceChildren();
  gallery.classList.toggle('sport-layout', category === 'sport');
  gallery.classList.toggle('event-layout', category === 'eventi');
  if (category === 'sport') {
    // Posizioni copiate dal riferimento: colonna sinistra, centrale, destra.
    const columns = [[19,20,14], [15,16], [13,18,17]];
    columns.forEach(ids => {
      const column = document.createElement('div');
      column.className = 'gallery-column';
      column.append(...ids.map((id, index) => createPhotoButton(photos[id - 1], visible.indexOf(photos[id - 1]))));
      gallery.append(column);
    });
  } else if (category === 'eventi') {
    // La foto orizzontale MGA026 apre la colonna centrale.
    const columns = [[24,25], [26,22], [23,27]];
    columns.forEach(ids => {
      const column = document.createElement('div');
      column.className = 'gallery-column';
      column.append(...ids.map((id, index) => createPhotoButton(photos[id - 1], visible.indexOf(photos[id - 1]))));
      gallery.append(column);
    });
  } else {
    gallery.append(...visible.map((photo, index) => createPhotoButton(photo, index)));
  }
  visibleImages = [...gallery.querySelectorAll('.photo img')];
}

// Routing tramite hash: supporta link diretti, Indietro e apertura da file locale.
function route(event) {
  const key = location.hash.slice(1);
  const category = key === 'ritratti' ? 'storie' : key;
  const isCategory = Object.hasOwn(categories, category);
  if (dialog.open) dialog.close();
  document.querySelector('#home').hidden = isCategory;
  document.querySelector('#category-view').hidden = !isCategory;
  document.title = isCategory
    ? `${categories[category]} — Claudio Meggiato`
    : 'Claudio Meggiato — Fotografia';

  if (isCategory) {
    const title = document.querySelector('#category-title');
    title.textContent = categories[category];
    render(category);
    const section = document.querySelector('#category-view');
    section.classList.remove('entering');
    void section.offsetWidth;
    section.classList.add('entering');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (event) title.focus({ preventScroll: true });
  } else {
    gallery.replaceChildren();
    // Aspetta che la home sia visibile prima di raggiungere l'ancora richiesta.
    requestAnimationFrame(() => {
      const target = ['portfolio', 'contatti', 'main'].includes(key)
        ? document.getElementById(key) : null;
      if (target) target.scrollIntoView({ block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
}
window.addEventListener('hashchange', route);

function showPhoto() {
  const photo = visible[current];
  const fullImage = visibleImages[current]?.dataset.full || photo.full;
  viewer.dataset.full = fullImage;
  viewer.src = fullImage;
  viewer.alt = photo.alt;
  document.querySelector('#viewer-count').textContent =
    `${String(current + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
  // Precarica solo lo scatto successivo, senza caricare tutta la galleria.
  const preload = new Image();
  preload.src = visibleImages[(current + 1) % visible.length]?.dataset.full
    || visible[(current + 1) % visible.length].full;
}
function step(delta) {
  if (!visible.length) return;
  current = (current + delta + visible.length) % visible.length;
  showPhoto();
}
document.querySelector('#close').addEventListener('click', () => dialog.close());
document.querySelector('#prev').addEventListener('click', () => step(-1));
document.querySelector('#next').addEventListener('click', () => step(1));
dialog.addEventListener('close', () => {
  document.body.classList.remove('viewing');
  if (opener?.isConnected && !document.querySelector('#category-view').hidden) {
    opener.focus({ preventScroll: true });
  }
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
// Swipe sullo scatto: soglia di 50px, nessun blocco dei gesti verticali.
viewer.addEventListener('touchstart', event => {
  touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
}, { passive: true });
viewer.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  touchStart = null;
}, { passive: true });
viewer.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
route();
