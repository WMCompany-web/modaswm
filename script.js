/* Modas WM — catálogo, busca, detalhes e carrinho */
const WHATSAPP_NUMBER = "5546984006226";
const PRODUCT_IMAGE = "assets/look-masculino.png";
const categories = [
  { id: "masculino", label: "Masculino" },
  { id: "feminino", label: "Feminino" },
  { id: "infantil", label: "Infantil" },
  { id: "tendencias", label: "Tendências" }
];

const products = [
  {id:1,name:"Conjunto casual masculino com camisa e calça",price:99.99,category:"masculino",image:PRODUCT_IMAGE,description:"Conjunto casual para trabalho e ocasiões especiais, com visual moderno e confortável."},
  {id:2,name:"Conjunto elegante para o dia a dia",price:99.99,category:"masculino",image:PRODUCT_IMAGE,description:"Uma combinação versátil para montar um look elegante e confortável."},
  {id:3,name:"Look moderno casual premium",price:99.99,category:"masculino",image:PRODUCT_IMAGE,description:"Peças versáteis que combinam com diferentes momentos."},
  {id:4,name:"Conjunto casual moderno",price:99.99,category:"masculino",image:PRODUCT_IMAGE,description:"Estilo contemporâneo e praticidade em um só conjunto."},
  {id:5,name:"Conjunto feminino elegante",price:99.99,category:"feminino",image:PRODUCT_IMAGE,description:"Um visual atual para quem procura conforto e estilo."},
  {id:6,name:"Moda feminina para todos os momentos",price:99.99,category:"feminino",image:PRODUCT_IMAGE,description:"Uma opção versátil para renovar seu guarda-roupa."},
  {id:7,name:"Look infantil confortável",price:99.99,category:"infantil",image:PRODUCT_IMAGE,description:"Conforto e estilo para acompanhar a rotina das crianças."},
  {id:8,name:"Tendência da estação",price:99.99,category:"tendencias",image:PRODUCT_IMAGE,description:"Inspire-se nas tendências e encontre seu próximo look."}
];

let cart = [];
try { cart = JSON.parse(localStorage.getItem("modas-wm-cart") || "[]"); } catch (_) { cart = []; }
let activeProduct = products[0];
let selectedSize = "M";
let selectedColor = "Azul";
let activeCategory = "todos";
let toastTimer;

const $ = (selector, parent=document) => parent.querySelector(selector);
const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];
const formatPrice = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

function productCard(product) {
  return `<article class="product-card" tabindex="0" data-product-id="${product.id}" aria-label="Ver ${escapeHTML(product.name)}">
    <div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy">
      <button class="quick-view" type="button" data-open-product="${product.id}">Ver detalhes</button></div>
    <p class="product-name">${escapeHTML(product.name)}</p>
    <div class="product-bottom"><span class="product-price">${formatPrice(product.price)}</span>
      <button class="mini-add" type="button" data-quick-add="${product.id}" aria-label="Adicionar ${escapeHTML(product.name)} ao carrinho" title="Adicionar ao carrinho">🛒</button></div>
  </article>`;
}

function renderProducts() {
  const query = $("#searchInput").value.trim().toLocaleLowerCase("pt-BR");
  const filtered = products.filter(p => (activeCategory === "todos" || p.category === activeCategory) &&
    (!query || p.name.toLocaleLowerCase("pt-BR").includes(query) || p.description.toLocaleLowerCase("pt-BR").includes(query)));
  $("#productGrid").innerHTML = filtered.map(productCard).join("");
  $("#moreProductGrid").innerHTML = products.slice(0,4).map(productCard).join("");
  $("#noResults").classList.toggle("hidden", filtered.length !== 0);
  $("#productsHeading").textContent = activeCategory === "todos" ? "Produtos em destaque" : `Moda ${categories.find(c=>c.id===activeCategory)?.label || ""}`;
}

function openProduct(id) {
  activeProduct = products.find(p => p.id === Number(id)) || products[0];
  selectedSize = "M";
  selectedColor = "Azul";
  $("#dialogImage").src = activeProduct.image;
  $("#dialogImage").alt = activeProduct.name;
  $("#dialogName").textContent = activeProduct.name;
  $("#dialogPrice").textContent = formatPrice(activeProduct.price);
  $("#quantityInput").value = 1;
  $$("#sizeOptions button").forEach(btn => btn.classList.toggle("chosen",btn.dataset.size===selectedSize));
  $$("#colorOptions button").forEach(btn => btn.classList.toggle("chosen",btn.dataset.color===selectedColor));
  $("#productDialog").showModal();
}

function addToCart(product, size, color, quantity=1) {
  const qty = Math.max(1, Math.min(20, Number(quantity)||1));
  const key = `${product.id}-${size}-${color}`;
  const existing = cart.find(item=>item.key===key);
  if(existing) existing.quantity += qty;
  else cart.push({key,productId:product.id,name:product.name,price:product.price,image:product.image,size,color,quantity:qty});
  saveCart();
  renderCart();
  showToast("Produto adicionado ao carrinho!");
}

function saveCart() {
  try { localStorage.setItem("modas-wm-cart", JSON.stringify(cart)); } catch (_) {}
}

function renderCart() {
  const panel = $("#cartPanel");
  const count = cart.reduce((sum,item)=>sum+item.quantity,0);
  const total = cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const countBadge = $("#cartCount");
  if (countBadge) countBadge.textContent = count;
  const totalElement = $("#cartTotal");
  if (totalElement) totalElement.textContent = formatPrice(total);
  if (!panel) return;
  if(!cart.length) {
    panel.innerHTML = `<div class="empty-cart"><img src="assets/carrinho-vazio.png" alt=""><h3>Seu carrinho está vazio</h3><button class="button button-dark cart-empty-return" id="returnShopping">Voltar para comprar</button></div>`;
    return;
  }
  panel.innerHTML = `<div class="cart-items">${cart.map(item=>`<article class="cart-item">
    <img src="${item.image}" alt="${escapeHTML(item.name)}">
    <div><h3>${escapeHTML(item.name)}</h3><p>${formatPrice(item.price)} <span class="cart-item-meta">cada</span></p>
      <div class="cart-item-meta">Tamanho: ${escapeHTML(item.size)} · Cor: ${escapeHTML(item.color)}</div>
      <div class="quantity-controls"><button type="button" data-qty="-1" data-key="${item.key}" aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button type="button" data-qty="1" data-key="${item.key}" aria-label="Aumentar quantidade">+</button></div>
    </div><button class="remove-item" type="button" data-remove="${item.key}">Remover</button>
  </article>`).join("")}</div>`;
}

function showToast(message) {
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

function checkout() {
  if(!cart.length) { showToast("Seu carrinho está vazio."); return; }
  const total = cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const lines = cart.map(item=>`• ${item.name}\n  Quantidade: ${item.quantity} | Tamanho: ${item.size} | Cor: ${item.color}\n  Subtotal: ${formatPrice(item.price*item.quantity)}`).join("\n\n");
  const message = `Olá, Modas WM! Gostaria de fazer este pedido:\n\n${lines}\n\nTOTAL: ${formatPrice(total)}\n\nComo podemos combinar o pagamento e a entrega?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
}

document.addEventListener("click", event => {
  const openBtn=event.target.closest("[data-open-product]");
  const quickAdd=event.target.closest("[data-quick-add]");
  const card=event.target.closest(".product-card");
  if(openBtn) { event.stopPropagation(); openProduct(openBtn.dataset.openProduct); return; }
  if(quickAdd) { event.stopPropagation(); openProduct(quickAdd.dataset.quickAdd); return; }
  if(card && !event.target.closest("button")) { openProduct(card.dataset.productId); return; }
  const category=event.target.closest("[data-category]");
  if(category) {
    activeCategory=category.dataset.category;
    $$(".category-card").forEach(btn=>btn.classList.toggle("selected",btn===category));
    renderProducts(); $("#produtos").scrollIntoView({behavior:"smooth"}); return;
  }
  const categoryLink=event.target.closest("[data-category-link]");
  if(categoryLink) {
    activeCategory=categoryLink.dataset.categoryLink;
    $$(".category-card").forEach(btn=>btn.classList.toggle("selected",btn.dataset.category===activeCategory));
    renderProducts();
  }
  const sizeBtn=event.target.closest("[data-size]");
  if(sizeBtn) { selectedSize=sizeBtn.dataset.size; $$("#sizeOptions button").forEach(btn=>btn.classList.toggle("chosen",btn===sizeBtn)); }
  const colorBtn=event.target.closest("[data-color]");
  if(colorBtn) { selectedColor=colorBtn.dataset.color; $$("#colorOptions button").forEach(btn=>btn.classList.toggle("chosen",btn===colorBtn)); }
  const qtyBtn=event.target.closest("[data-qty]");
  if(qtyBtn) { const item=cart.find(i=>i.key===qtyBtn.dataset.key); if(item){item.quantity+=Number(qtyBtn.dataset.qty);if(item.quantity<=0)cart=cart.filter(i=>i.key!==item.key);saveCart();renderCart();} }
  const removeBtn=event.target.closest("[data-remove]");
  if(removeBtn) { cart=cart.filter(i=>i.key!==removeBtn.dataset.remove);saveCart();renderCart();showToast("Produto removido."); }
  if(event.target.id==="returnShopping") window.location.href="index.html#produtos";
});

$("#addDialogButton").addEventListener("click",()=>{
  addToCart(activeProduct,selectedSize,selectedColor,$("#quantityInput").value);
  $("#productDialog").close();
  window.location.href = "carrinho.html";
});
$("#dialogClose").addEventListener("click",()=>$("#productDialog").close());
$("#productDialog").addEventListener("click",event=>{if(event.target===$("#productDialog"))$("#productDialog").close();});
const checkoutButton = $("#checkoutButton");
if (checkoutButton) checkoutButton.addEventListener("click",checkout);
if ($("#searchInput")) $("#searchInput").addEventListener("input",renderProducts);
if ($("#searchButton")) $("#searchButton").addEventListener("click",()=>{$("#produtos").scrollIntoView({behavior:"smooth"});$("#searchInput").focus();});
if ($("#themeToggle")) $("#themeToggle").addEventListener("click",()=>{
  const dark=document.body.classList.toggle("dark");
  $("#themeToggle").textContent=dark?"☀":"◐";
  $("#themeToggle").setAttribute("aria-label",dark?"Ativar modo claro":"Ativar modo escuro");
  try{localStorage.setItem("modas-wm-theme",dark?"dark":"light");}catch(_){}
});
try{if(localStorage.getItem("modas-wm-theme")==="dark"){document.body.classList.add("dark");if($("#themeToggle")){ $("#themeToggle").textContent="☀";$("#themeToggle").setAttribute("aria-label","Ativar modo claro");}}}catch(_){}
if ($("#menuToggle")) $("#menuToggle").addEventListener("click",()=>{
  const open=$("#mainNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded",String(open));
  $("#menuToggle").textContent=open?"×":"☰";
});
$$(".main-nav a").forEach(link=>link.addEventListener("click",()=>{if($("#mainNav")) $("#mainNav").classList.remove("open");if($("#menuToggle")){ $("#menuToggle").setAttribute("aria-expanded","false");$("#menuToggle").textContent="☰";}}));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&$("#productDialog").open)$("#productDialog").close();});
if ($("#year")) $("#year").textContent=new Date().getFullYear();
if ($("#productGrid")) renderProducts();
renderCart();
