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
    img: "",
    price: 6800,
    origPrice: 8000,
    category: "bags",
    badge: "New Arrival",
    icon: "fa-suitcase",
    desc: "Our premium flagship carrier. Full-grain leather accents, YKK zippers, and an ergonomic padded strap. Built for the professional on the move.",
  },
  {
    id: 3,
    name: "Premium Arm Sleeves",
    img: "",
    price: 1200,
    origPrice: 1500,
    category: "accessories",
    badge: "Popular",
    icon: "fa-hand-paper",
    desc: "UV-protective, moisture-wicking compression sleeves. Ideal for outdoor sports, cycling, or daily commutes. Available in multiple shades.",
  },
  {
    id: 4,
    name: "Tactical Wallet",
    img: "",
    price: 1800,
    origPrice: 2200,
    category: "wallets",
    badge: "Top Pick",
    icon: "fa-wallet",
    desc: "RFID-blocking slim wallet with quick-draw card access, cash slot, and reinforced stitching. Compact enough for any pocket.",
  },
  {
    id: 5,
    name: "Travel Organizer",
    img: "",
    price: 2200,
    origPrice: 2600,
    category: "travel",
    badge: "New Arrival",
    icon: "fa-plane",
    desc: "Keep all your travel essentials sorted. Dedicated slots for passport, cards, boarding passes, cables, and a hidden secure zipper pocket.",
  },
  {
    id: 6,
    name: "Leather Card Sleeve",
    img: "",
    price: 950,
    origPrice: 1200,
    category: "wallets",
    badge: null,
    icon: "fa-credit-card",
    desc: "Minimalist genuine leather card sleeve holding up to 6 cards. RFID protection built-in. Gift-worthy and durable.",
  },
  {
    id: 7,
    name: "Sport Duffel Bag",
    img: "",
    price: 5500,
    origPrice: 6500,
    category: "bags",
    badge: null,
    icon: "fa-dumbbell",
    desc: "Heavy-duty canvas duffel with shoe compartment, wet pocket, and adjustable straps. Perfect for gym sessions and weekend trips.",
  },
  {
    id: 8,
    name: "Cable & Tech Organizer",
    img: "",
    price: 1400,
    origPrice: 1800,
    category: "travel",
    badge: "Trending",
    icon: "fa-plug",
    desc: "Keep your cables, earbuds, adapters, and chargers tangle-free. Water-resistant shell with elastic loops and zippered mesh pockets.",
  }
];

let adminProducts = [];

const adminTable = document.getElementById("admin-products-table");
const adminEmpty = document.getElementById("admin-empty");
const adminSearch = document.getElementById("admin-search");
const adminForm = document.getElementById("admin-product-form");
const adminFormTitle = document.getElementById("admin-form-title");
const adminFormMsg = document.getElementById("admin-form-msg");
const adminToast = document.getElementById("admin-toast");
const totalProducts = document.getElementById("total-products");
const totalCategories = document.getElementById("total-categories");
const storageStatus = document.getElementById("storage-status");
const adminImgFile = document.getElementById("admin-img-file");
const adminImgUrl = document.getElementById("admin-img-url");

function isLocalStorageSupported() {
  try {
    localStorage.setItem("test", "1");
    localStorage.removeItem("test");
    return true;
  } catch {
    return false;
  }
}

function loadAdminProducts() {
  const supported = isLocalStorageSupported();
  storageStatus.textContent = supported ? "Active" : "Unavailable";

  if (!supported) {
    return DEFAULT_PRODUCTS.slice();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.slice();
  }

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

function saveAdminProducts() {
  if (!isLocalStorageSupported()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProducts));
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.toString());
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getUniqueCategoryCount() {
  return new Set(adminProducts.map(product => product.category.toLowerCase())).size;
}

function renderAdminStats() {
  totalProducts.textContent = adminProducts.length;
  totalCategories.textContent = getUniqueCategoryCount();
}

function renderAdminProducts() {
  const query = adminSearch.value.trim().toLowerCase();
  const filtered = adminProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.desc.toLowerCase().includes(query)
    );
  });

  adminTable.innerHTML = "";
  adminEmpty.style.display = filtered.length ? "none" : "block";

  filtered.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.img ? ('<img src="' + product.img + '" class="admin-prod-img" alt="' + product.name + '">') : ('<span class="admin-icon"><i class="fas ' + (product.icon || "fa-box") + '"></i></span>')}</td>
      <td>${product.category}</td>
      <td>${product.origPrice ? 'Rs ' + product.origPrice.toLocaleString() : '—'}</td>
      <td>Rs ${product.price.toLocaleString()}</td>
      <td>${product.badge || "—"}</td>
      <td>
        <button type="button" class="btn btn-outline" onclick="editAdminProduct(${product.id})">Edit</button>
        <button type="button" class="btn btn-outline" onclick="deleteAdminProduct(${product.id})">Delete</button>
      </td>
    `;
    adminTable.appendChild(row);
  });
}

function showAdminToast(message, type = "success") {
  adminToast.textContent = message;
  adminToast.className = type === "error" ? "error show" : "success show";
  clearTimeout(adminToast._timer);
  adminToast._timer = setTimeout(() => {
    adminToast.className = "";
  }, 3000);
}

function resetAdminForm() {
  adminForm.reset();
  document.getElementById("admin-product-id").value = "";
  adminFormTitle.textContent = "Add New Product";
  document.getElementById("admin-submit-btn").textContent = "Create Product";
  adminFormMsg.textContent = "";
  adminFormMsg.className = "form-msg";
  adminImgFile.value = "";
  adminImgUrl.value = "";
  document.getElementById("admin-origprice").value = "";
}

function editAdminProduct(id) {
  const product = adminProducts.find(item => item.id === id);
  if (!product) return;

  document.getElementById("admin-product-id").value = product.id;
  document.getElementById("admin-name").value = product.name;
  document.getElementById("admin-origprice").value = product.origPrice || "";
  document.getElementById("admin-price").value = product.price;
  document.getElementById("admin-category").value = product.category;
  document.getElementById("admin-badge").value = product.badge || "";
  document.getElementById("admin-icon").value = product.icon || "";
  adminImgFile.value = "";
  adminImgUrl.value = product.img && !product.img.startsWith("data:") ? product.img : "";
  document.getElementById("admin-desc").value = product.desc;

  adminFormTitle.textContent = "Edit Product";
  document.getElementById("admin-submit-btn").textContent = "Update Product";
  adminFormMsg.textContent = "You can update the values and save changes.";
  adminFormMsg.className = "form-msg success";
}

function deleteAdminProduct(id) {
  const product = adminProducts.find(item => item.id === id);
  if (!product) return;

  if (!confirm(`Delete "${product.name}" from the catalog?`)) {
    return;
  }

  adminProducts = adminProducts.filter(item => item.id !== id);
  saveAdminProducts();
  renderAdminProducts();
  renderAdminStats();
  showAdminToast(`Deleted ${product.name}`);
}

async function submitAdminProduct(event) {
  event.preventDefault();

  const id = Number(document.getElementById("admin-product-id").value || "");
  const name = document.getElementById("admin-name").value.trim();
  const price = Number(document.getElementById("admin-price").value);
  const category = document.getElementById("admin-category").value.trim();
  const origPrice = Number(document.getElementById("admin-origprice").value || 0);
  const badge = document.getElementById("admin-badge").value.trim();
  const icon = document.getElementById("admin-icon").value.trim() || "fa-box";
  const imgFile = adminImgFile.files[0];
  const imgUrl = adminImgUrl.value.trim();
  const desc = document.getElementById("admin-desc").value.trim();

  if (imgUrl && /^[A-Za-z]:\\/.test(imgUrl)) {
    showAdminFormMsg("Local desktop paths like C:\\... are not supported in Image URL. Use the upload field or a web/relative URL.", false);
    return;
  }

  if (!name || !category || !price || !desc) {
    showAdminFormMsg("Please complete all required fields.", false);
    return;
  }

  let img = "";
  if (imgFile) {
    try {
      img = await readImageFile(imgFile);
    } catch {
      showAdminFormMsg("Unable to read the selected image file.", false);
      return;
    }
  } else {
    img = imgUrl || "";
  }

  if (id) {
    const index = adminProducts.findIndex(item => item.id === id);
    if (index === -1) return;

    adminProducts[index] = { id, name, price, origPrice: origPrice || null, category, badge: badge || null, icon, img: img || "", desc };
    showAdminToast(`Updated ${name}`);
  } else {
    const nextId = adminProducts.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    adminProducts.unshift({ id: nextId, name, price, origPrice: origPrice || null, category, badge: badge || null, icon, img: img || "", desc });
    showAdminToast(`Added ${name}`);
  }

  saveAdminProducts();
  renderAdminProducts();
  renderAdminStats();
  resetAdminForm();
}

function showAdminFormMsg(text, success) {
  adminFormMsg.textContent = text;
  adminFormMsg.className = "form-msg " + (success ? "success" : "error");
}

function resetAdminCatalog() {
  if (!confirm("Reset the catalog to the default product set? This will overwrite local changes.")) {
    return;
  }

  adminProducts = DEFAULT_PRODUCTS.slice();
  saveAdminProducts();
  renderAdminProducts();
  renderAdminStats();
  resetAdminForm();
  showAdminToast("Catalog restored to default settings.");
}

function initAdminPanel() {
  adminProducts = loadAdminProducts();
  renderAdminProducts();
  renderAdminStats();

  adminSearch.addEventListener("input", renderAdminProducts);
  adminForm.addEventListener("submit", submitAdminProduct);
  document.getElementById("admin-clear-btn").addEventListener("click", resetAdminForm);
  document.getElementById("reset-data-btn").addEventListener("click", resetAdminCatalog);
}

window.editAdminProduct = editAdminProduct;
window.deleteAdminProduct = deleteAdminProduct;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPanel);
} else {
  initAdminPanel();
}
