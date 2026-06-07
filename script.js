/* ============================================================
   DATA — Product Catalog
============================================================ */
const STORAGE_KEY = "shomarProducts";
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Urban Messenger Bag",
    img: "assets/bag-messanger.png",
    price: 4500,
    origPrice: 7000,
    category: "bags",
    badge: "Bestseller",
    icon: "fa-briefcase",
    desc: "Sleek, structured, and city-ready. Water-resistant exterior with multiple padded compartments for your laptop, gear, and everyday essentials.",
  },
  {
    id: 2,
    name: "Elite Messenger Bag",
    img: "assets/images.jfif",
    price: 2550,
    origPrice: 7000,
    category: "bags",
    badge: "New Arrival",
    icon: "fa-suitcase",
    desc: "Our premium flagship carrier. Full-grain leather accents, YKK zippers, and an ergonomic padded strap. Built for the professional on the move.",
  },
  {
    id: 3,
    name: "Premium Arm Sleeves",
    img: "assets/images-1.jfif",
    price: 550,
    origPrice: 3000,
    category: "accessories",
    badge: "Popular",
    icon: "fa-hand-paper",
    desc: "UV-protective, moisture-wicking compression sleeves. Ideal for outdoor sports, cycling, or daily commutes. Available in multiple shades.",
  },
  {
    id: 4,
    name: "Tactical Wallet",
    img: "assets/images-2.jfif",
    price: 1399,
    origPrice: 3000,
    category: "wallets",
    badge: "Top Pick",
    icon: "fa-wallet",
    desc: "RFID-blocking slim wallet with quick-draw card access, cash slot, and reinforced stitching. Compact enough for any pocket.",
  },
  {
    id: 5,
    name: "Travel Organizer",
    img: "assets/images-3.jfif",
    price: 2200,
    origPrice: 3000,
    category: "travel",
    badge: "New Arrival",
    icon: "fa-plane",
    desc: "Keep all your travel essentials sorted. Dedicated slots for passport, cards, boarding passes, cables, and a hidden secure zipper pocket.",
  },
  {
    id: 6,
    name: "Leather Card Sleeve",
    img: "assets/images-4.jfif",
    price: 950,
    origPrice: 2000,
    category: "wallets",
    badge: null,
    icon: "fa-credit-card",
    desc: "Minimalist genuine leather card sleeve holding up to 6 cards. RFID protection built-in. Gift-worthy and durable.",
  },
  {
    id: 7,
    name: "Sport Duffel Bag",
    img: "assets/images-5.jfif",
    price: 5550,
    origPrice: 8000,
    category: "bags",
    badge: null,
    icon: "fa-dumbbell",
    desc: "Heavy-duty canvas duffel with shoe compartment, wet pocket, and adjustable straps. Perfect for gym sessions and weekend trips.",
  }
];

let PRODUCTS = [];

function loadStoredProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PRODUCTS.slice();

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  } catch (error) {
    console.warn("Could not parse stored products:", error);
  }

  return DEFAULT_PRODUCTS.slice();
}

function initProductData() {
  PRODUCTS = loadStoredProducts();
}

function persistProductData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS));
  } catch (error) {
    console.warn("Could not save products:", error);
  }
}

/* ============================================================
   STATE
============================================================ */
let cart      = [];   // { id, name, price, icon, qty }
let wishlist  = [];   // product ids
let activeCategory = "all";

/* ============================================================
   NAVBAR SCROLL
============================================================ */
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60);
});

/* ============================================================
   MOBILE NAV
============================================================ */
function toggleMobileNav() {
  document.getElementById("mobile-nav").classList.toggle("open");
}
function closeMobileNav() {
  document.getElementById("mobile-nav").classList.remove("open");
}

/* ============================================================
   CART TOGGLE
============================================================ */
function toggleCart() {
  document.getElementById("cart-overlay").classList.toggle("open");
  document.getElementById("cart-sidebar").classList.toggle("open");
}

/* ============================================================
   RENDER PRODUCTS
============================================================ */
function renderProducts() {
  const grid   = document.getElementById("product-grid");
  const query  = document.getElementById("search-input").value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p => {
    const matchCat  = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = !query || p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p style="margin-bottom:8px;font-size:1rem;">No products found</p>
        <p style="font-size:0.78rem;">Try a different search or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const inWishlist = wishlist.includes(p.id);
    return `
    <div class="product-card fade-in visible" data-id="${p.id}">
      <div class="product-img-wrap">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        ${p.img ? (`<div class="product-img"><img src="${p.img}" alt="${p.name}"></div>`) : (`<div class="product-img-placeholder">
          <i class="fas ${p.icon}"></i>
          <span>${p.name}</span>
        </div>`)}
        <div class="product-actions-hover">
          <button onclick="toggleWishlist(${p.id})" title="${inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <i class="fa${inWishlist ? 's' : 'r'} fa-heart" style="color:${inWishlist ? 'var(--gold)' : 'inherit'}"></i>
          </button>
          <button onclick="addToCart(${p.id})" title="Add to Cart">
            <i class="fas fa-shopping-bag"></i>
          </button>
          <button title="Quick View" onclick="showToast('${p.name} — Quick view coming soon!')">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">${p.origPrice ? ('<span class="orig">PKR ' + p.origPrice.toLocaleString() + '</span>') : ''}<span>PKR</span>${p.price.toLocaleString()}</div>
          <button class="add-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>`;
  }).join("");
}

/* ============================================================
   FILTER & SEARCH
============================================================ */
function setCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
}
function filterProducts() { renderProducts(); }

/* ============================================================
   CART FUNCTIONS
============================================================ */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, icon: product.icon, img: product.img || "", qty: 1 });
  }
  updateCartUI();
  showToast(`"${product.name}" added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((a, c) => a + c.qty, 0);
  const badge = document.getElementById("cart-count");
  badge.textContent = total;
  badge.classList.toggle("visible", total > 0);

  const list = document.getElementById("cart-items-list");
  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty">
      <i class="fas fa-shopping-bag"></i>
      <p>Your cart is empty.</p>
      <p style="font-size:0.75rem;margin-top:6px;color:var(--grey);">Add some elite products!</p>
    </div>`;
  } else {
    list.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.img ? ('<img src="' + item.img + '" alt="' + item.name + '">') : ('<i class="fas ' + item.icon + '"></i>')}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)"><i class="fas fa-minus" style="font-size:0.7rem;"></i></button>
            <div class="qty-num">${item.qty}</div>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)"><i class="fas fa-plus" style="font-size:0.7rem;"></i></button>
            <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>`).join("");
  }

  const sum = cart.reduce((a, c) => a + (c.price * c.qty), 0);
  document.getElementById("cart-total").textContent = "PKR " + sum.toLocaleString();
}

function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  const sum = cart.reduce((a, c) => a + (c.price * c.qty), 0);
  showToast(`Order placed! Total: PKR ${sum.toLocaleString()}. We'll contact you shortly.`);
  cart = [];
  updateCartUI();
  toggleCart();
}

/* ============================================================
   WISHLIST
============================================================ */
function toggleWishlist(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
    showToast(`"${product.name}" removed from wishlist.`);
  } else {
    wishlist.push(id);
    showToast(`"${product.name}" added to wishlist!`);
  }
  renderProducts();
  renderWishlist();
}

function renderWishlist() {
  const grid = document.getElementById("wishlist-grid");
  if (wishlist.length === 0) {
    grid.innerHTML = `<div class="wishlist-empty">
      <i class="far fa-heart" style="font-size:2rem;margin-bottom:10px;display:block;color:var(--border);"></i>
      <p style="font-size:0.82rem;">Your wishlist is empty. Browse our collection and save items you love!</p>
    </div>`;
    return;
  }
  grid.innerHTML = wishlist.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return "";
    return `
    <div class="wishlist-card">
      <div style="font-size:1.8rem;color:rgba(201,168,76,0.3);">${p.img ? ('<img src="' + p.img + '" alt="' + p.name + '" style="height:44px;object-fit:cover;">') : ('<i class="fas ' + p.icon + '"></i>')}</div>
      <div class="wishlist-card-name">${p.name}</div>
      <div class="wishlist-card-price">PKR ${p.price.toLocaleString()}</div>
      <div class="wishlist-card-actions">
        <button class="wl-add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="wl-remove-btn" onclick="toggleWishlist(${p.id})"><i class="fas fa-times"></i></button>
      </div>
    </div>`;
  }).join("");
}

/* ============================================================
   NEWSLETTER
============================================================ */
function subscribeNewsletter() {
  const input = document.getElementById("newsletter-email");
  const msg   = document.getElementById("newsletter-msg");
  const email = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    msg.textContent = "Please enter your email address.";
    msg.className   = "newsletter-msg error";
    return;
  }
  if (!emailRegex.test(email)) {
    msg.textContent = "Please enter a valid email address.";
    msg.className   = "newsletter-msg error";
    return;
  }
  msg.textContent = "✓ Welcome to the ShoMar Elite family! Check your inbox soon.";
  msg.className   = "newsletter-msg success";
  input.value     = "";
  setTimeout(() => { msg.textContent = ""; msg.className = "newsletter-msg"; }, 5000);
}

/* ============================================================
   CONTACT FORM
============================================================ */
function submitContact() {
  const name    = document.getElementById("c-name").value.trim();
  const email   = document.getElementById("c-email").value.trim();
  const message = document.getElementById("c-message").value.trim();
  const msg     = document.getElementById("contact-msg");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name)  { showFormMsg(msg, "Please enter your name.", false); return; }
  if (!email || !emailRegex.test(email)) { showFormMsg(msg, "Please enter a valid email address.", false); return; }
  if (!message) { showFormMsg(msg, "Please write your message.", false); return; }

  const mailto = `mailto:shomarelite@gmail.com?subject=${encodeURIComponent("Website message: " + document.getElementById("c-subject").value.trim())}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message)}`;
  window.location.href = mailto;

  showFormMsg(msg, "✓ Message window opened in your email app.", true);
  document.getElementById("c-name").value    = "";
  document.getElementById("c-email").value   = "";
  document.getElementById("c-subject").value = "";
  document.getElementById("c-message").value = "";
  setTimeout(() => { msg.textContent = ""; msg.className = "form-msg"; }, 6000);
}

function showFormMsg(el, text, success) {
  el.textContent = text;
  el.className   = "form-msg " + (success ? "success" : "error");
}

/* ============================================================
   TOAST
============================================================ */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ============================================================
   INTERSECTION OBSERVER — Fade-in on scroll
============================================================ */
function observeFadeIns() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initProductData();
  renderProducts();
  renderWishlist();
  updateCartUI();
  observeFadeIns();

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.getElementById("cart-overlay").classList.remove("open");
      document.getElementById("cart-sidebar").classList.remove("open");
    }
  });
});
