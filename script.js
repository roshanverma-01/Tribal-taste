// Data (copied/derived from your React list)
const products = [
  { id:1,name:'Wild Forest Honey',description:'Pure, unprocessed honey harvested from tribal forest communities in the Western Ghats',price:450,image:'https://images.unsplash.com/photo-1645549826194-1956802d83c2?q=80&w=1080&auto=format&fit=crop',category:'Sweeteners',origin:'Western Ghats, Karnataka'},
  { id:2,name:'Red Rice',description:'Nutrient-rich indigenous rice variety grown by tribal farmers using traditional methods',price:180,image:'https://images.unsplash.com/photo-1613728913341-8f29b02b8253?q=80&w=1080&auto=format&fit=crop',category:'Grains',origin:'Odisha Tribal Regions'},
  { id:3,name:'Organic Turmeric',description:'High-curcumin turmeric powder from indigenous farming communities of Northeast India',price:220,image:'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?q=80&w=1080&auto=format&fit=crop',category:'Spices',origin:'Meghalaya'},
  { id:4,name:'Herbal Tea Blend',description:'Traditional medicinal herb tea blend prepared by tribal healers',price:320,image:'https://images.unsplash.com/photo-1689402059850-eaff40b7b994?q=80&w=1080&auto=format&fit=crop',category:'Beverages',origin:'Arunachal Pradesh'},
  { id:5,name:'Forest Spice Mix',description:'Authentic blend of wild-harvested spices used in tribal cuisine for centuries',price:280,image:'https://images.unsplash.com/photo-1700227280140-ee5a75cc096b?q=80&w=1080&auto=format&fit=crop',category:'Spices',origin:'Jharkhand'},
  { id:6,name:'Bamboo Shoot Pickle',description:'Traditional fermented bamboo shoot pickle made by Naga tribal communities',price:240,image:'https://images.unsplash.com/photo-1626572984401-83cbf7bfb3f3?q=80&w=1080&auto=format&fit=crop',category:'Preserves',origin:'Nagaland'}
];

const stories = [
  { id:1,title:'The Ancient Art of Wild Honey Harvesting',excerpt:'Deep in the forests of the Western Ghats, tribal honey hunters continue a tradition that has been passed down through generations...',image:'https://images.unsplash.com/photo-1606239763507-f44d0c248629?q=80&w=1080&auto=format&fit=crop',author:'Priya Sharma',readTime:'5 min read'},
  { id:2,title:'Red Rice: The Forgotten Superfood',excerpt:'Discover how tribal communities in Odisha have been cultivating this nutrient-dense grain for over a thousand years...',image:'https://images.unsplash.com/photo-1758812818698-4814bdfed2d5?q=80&w=1080&auto=format&fit=crop',author:'Rajesh Kumar',readTime:'7 min read'},
  { id:3,title:'Empowering Women Through Spice Cooperatives',excerpt:'Meet the women-led self-help groups transforming the spice trade in Northeast India and reclaiming their heritage...',image:'https://images.unsplash.com/photo-1700227280140-ee5a75cc096b?q=80&w=1080&auto=format&fit=crop',author:'Anita Devi',readTime:'6 min read'}
];

// categories (include "all")
const categories = ['all','Grains','Spices','Sweeteners','Beverages','Preserves'];

// --- Mobile menu toggle ---
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
let mobileOpen = false;
mobileToggle.addEventListener('click', () => {
  mobileOpen = !mobileOpen;
  if (mobileOpen) mobileMenu.classList.remove('mobile-hidden'); else mobileMenu.classList.add('mobile-hidden');
});

// --- TypewriterText ---
const typeEl = document.getElementById('typewriter');
const typeTexts = ['Authentic Tribal Foods','Empowering Communities','Preserving Traditions'];
let tIndex = 0, charIndex = 0, deleting=false;
function typeLoop() {
  const current = typeTexts[tIndex];
  if (!deleting) {
    charIndex++;
    typeEl.textContent = current.slice(0,charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 900);
      return;
    }
  } else {
    charIndex--;
    typeEl.textContent = current.slice(0,charIndex);
    if (charIndex === 0) {
      deleting = false;
      tIndex = (tIndex +1) % typeTexts.length;
    }
  }
  setTimeout(typeLoop, deleting ? 40 : 80);
}
typeLoop();

// --- Render Tabs ---
const tabsContainer = document.getElementById('categoryTabs');
let selectedCategory = 'all';
function renderTabs(){
  tabsContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat === 'all' ? 'All' : cat;
    btn.className = cat === selectedCategory ? 'active' : '';
    btn.addEventListener('click', () => {
      selectedCategory = cat;
      renderTabs();
      renderProducts();
    });
    tabsContainer.appendChild(btn);
  });
}
renderTabs();

// --- Render Products ---
const productGrid = document.getElementById('productGrid');
function renderProducts(){
  productGrid.innerHTML = '';
  const filtered = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="product-img" src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="product-title">${escapeHtml(p.name)}</div>
      <div class="product-desc">${escapeHtml(p.description)}</div>
      <div class="product-meta">
        <div class="muted small">${escapeHtml(p.origin)}</div>
        <div style="font-weight:700;color:var(--white)">₹ ${p.price}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-outline add-cart">Add</button>
        <button class="btn">Details</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}
renderProducts();

// --- Render Stories ---
const storiesGrid = document.getElementById('storiesGrid');
function renderStories(){
  storiesGrid.innerHTML = '';
  stories.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="story-image" src="${s.image}" alt="${escapeHtml(s.title)}" />
      <div style="margin-top:10px">
        <div class="story-title">${escapeHtml(s.title)}</div>
        <div class="story-excerpt">${escapeHtml(s.excerpt)}</div>
        <div class="muted small" style="margin-top:8px">${escapeHtml(s.author)} • ${escapeHtml(s.readTime)}</div>
      </div>
    `;
    storiesGrid.appendChild(card);
  });
}
renderStories();

// small helper
function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// --- Simple: scroll from "Explore" to marketplace ---
document.getElementById('exploreBtn').addEventListener('click', () => {
  document.getElementById('marketplace').scrollIntoView({behavior:'smooth'});
});

// close mobile menu when clicking a link (improve UX)
document.querySelectorAll('#mobileMenu a').forEach(a=>{
  a.addEventListener('click', ()=> {
    mobileOpen = false;
    mobileMenu.classList.add('mobile-hidden');
  });
});
