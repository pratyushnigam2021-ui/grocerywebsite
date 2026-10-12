const PRODUCTS = [
  { id: 1,  name: "Red Apples",     cat: "Fruits",     unit: "1 kg",    price: 180, emoji: "🍎" },
  { id: 2,  name: "Bananas",        cat: "Fruits",     unit: "12 pcs",  price: 60,  emoji: "🍌" },
  { id: 3,  name: "Mangoes",        cat: "Fruits",     unit: "1 kg",    price: 140, emoji: "🥭" },
  { id: 4,  name: "Tomatoes",       cat: "Vegetables", unit: "1 kg",    price: 40,  emoji: "🍅" },
  { id: 5,  name: "Carrots",        cat: "Vegetables", unit: "500 g",   price: 35,  emoji: "🥕" },
  { id: 6,  name: "Broccoli",       cat: "Vegetables", unit: "1 head",  price: 55,  emoji: "🥦" },
  { id: 7,  name: "Potatoes",       cat: "Vegetables", unit: "1 kg",    price: 30,  emoji: "🥔" },
  { id: 8,  name: "Full Cream Milk",cat: "Dairy",      unit: "1 L",     price: 66,  emoji: "🥛" },
  { id: 9,  name: "Cheese Slices",  cat: "Dairy",      unit: "200 g",   price: 120, emoji: "🧀" },
  { id: 10, name: "Farm Eggs",      cat: "Dairy",      unit: "12 pcs",  price: 84,  emoji: "🥚" },
  { id: 11, name: "Whole Wheat Bread", cat: "Bakery",  unit: "400 g",   price: 50,  emoji: "🍞" },
  { id: 12, name: "Butter Croissants", cat: "Bakery",  unit: "4 pcs",   price: 99,  emoji: "🥐" },
  { id: 13, name: "Basmati Rice",   cat: "Pantry",     unit: "5 kg",    price: 520, emoji: "🍚" },
  { id: 14, name: "Peanut Butter",  cat: "Pantry",     unit: "340 g",   price: 210, emoji: "🥜" },
  { id: 15, name: "Orange Juice",   cat: "Drinks",     unit: "1 L",     price: 110, emoji: "🧃" },
  { id: 16, name: "Green Tea",      cat: "Drinks",     unit: "25 bags", price: 150, emoji: "🍵" }
];

const $ = id => document.getElementById(id);
const grid = $("grid"), filters = $("filters"), search = $("search");
let category = "All";
let cart = {}; // { productId: quantity }

const money = n => "₹" + n.toLocaleString("en-IN");

/* ---------- Products ---------- */
function renderFilters() {
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
  filters.innerHTML = cats
    .map(c => `<button class="${c === category ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  const q = search.value.trim().toLowerCase();
  const list = PRODUCTS.filter(p =>
    (category === "All" || p.cat === category) && p.name.toLowerCase().includes(q)
  );
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="thumb" aria-hidden="true">${p.emoji}</div>
      <h3>${p.name}</h3>
      <small>${p.unit}</small>
      <div class="row">
        <span class="price">${money(p.price)}</span>
        <button class="add" data-add="${p.id}">Add</button>
      </div>
    </article>`).join("");
  $("empty").hidden = list.length > 0;
}

/* ---------- Cart ---------- */
function renderCart() {
  const items = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id == id), qty }));
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  $("cartCount").textContent = count;
  $("total").textContent = money(total);
  $("checkout").disabled = count === 0;

  $("cartList").innerHTML = items.length
    ? items.map(i => `
      <li>
        <span class="e">${i.emoji}</span>
        <div>
          <strong>${i.name}</strong>
          <div class="qty">
            <button data-dec="${i.id}" aria-label="Remove one ${i.name}">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}" aria-label="Add one ${i.name}">+</button>
          </div>
        </div>
        <strong>${money(i.qty * i.price)}</strong>
      </li>`).join("")
    : `<li class="cart-empty">Your cart is empty. Add something fresh.</li>`;
}

function change(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function toggleDrawer(open) {
  $("drawer").classList.toggle("open", open);
  $("overlay").classList.toggle("show", open);
}

/* ---------- Events ---------- */
filters.addEventListener("click", e => {
  const c = e.target.dataset.cat;
  if (!c) return;
  category = c;
  renderFilters();
  renderProducts();
});

search.addEventListener("input", renderProducts);

grid.addEventListener("click", e => {
  const id = e.target.dataset.add;
  if (!id) return;
  change(id, 1);
  const btn = $("cartBtn");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
  toast(`${PRODUCTS.find(p => p.id == id).name} added to cart`);
});

$("cartList").addEventListener("click", e => {
  if (e.target.dataset.inc) change(e.target.dataset.inc, 1);
  if (e.target.dataset.dec) change(e.target.dataset.dec, -1);
});

$("cartBtn").addEventListener("click", () => toggleDrawer(true));
$("closeCart").addEventListener("click", () => toggleDrawer(false));
$("overlay").addEventListener("click", () => toggleDrawer(false));
document.addEventListener("keydown", e => e.key === "Escape" && toggleDrawer(false));

$("checkout").addEventListener("click", () => {
  cart = {};
  renderCart();
  toggleDrawer(false);
  toast("Order placed. Arriving this evening!");
});

/* ---------- Init ---------- */
renderFilters();
renderProducts();
renderCart();