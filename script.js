const WHATSAPP_NUMBER = "5546984006226"; // Número do vendedor: (46) 98400-6226
const money = value => value.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
const products = [
  {id:1,name:"Conjunto de terno casual masculino",category:"masculino",price:99.99,tag:"Destaque",image:"assets/look-masculino.png",description:"Conjunto casual com jaqueta de manga longa e calça, ideal para um visual elegante e moderno.",colors:["Verde oliva","Preto","Bege"],sizes:["P","M","G","GG","EG"]},
  {id:2,name:"Camisa casual premium",category:"masculino",price:79.99,tag:"Versátil",image:"assets/loja-hero.png",description:"Camisa versátil para compor looks casuais com conforto.",colors:["Preto","Branco","Verde oliva"],sizes:["P","M","G","GG","EG"]},
  {id:3,name:"Conjunto moderno feminino",category:"feminino",price:99.99,tag:"Novidade",image:"assets/loja-hero.png",description:"Conjunto moderno para o dia a dia e ocasiões especiais.",colors:["Preto","Bege","Off-white"],sizes:["P","M","G","GG"]},
  {id:4,name:"Look urbano essencial",category:"tendencias",price:89.99,tag:"Tendência",image:"assets/look-masculino.png",description:"Peças essenciais para um visual atual, confortável e fácil de combinar.",colors:["Verde oliva","Preto","Bege"],sizes:["P","M","G","GG","EG"]},
  {id:5,name:"Camiseta básica premium",category:"masculino",price:49.99,tag:"Essencial",image:"assets/loja-hero.png",description:"Camiseta básica para combinar com diferentes estilos.",colors:["Preto","Branco","Cinza"],sizes:["P","M","G","GG","EG"]},
  {id:6,name:"Conjunto feminino casual",category:"feminino",price:109.99,tag:"Conforto",image:"assets/look-masculino.png",description:"Uma opção casual para montar combinações leves e modernas.",colors:["Bege","Preto","Verde oliva"],sizes:["P","M","G","GG"]},
  {id:7,name:"Conjunto infantil confortável",category:"infantil",price:69.99,tag:"Conforto",image:"assets/loja-hero.png",description:"Conjunto confortável para acompanhar a rotina das crianças.",colors:["Azul","Preto","Bege"],sizes:["2","4","6","8","10"]},
  {id:8,name:"Peça urbana da estação",category:"tendencias",price:89.99,tag:"Seleção WM",image:"assets/look-masculino.png",description:"Uma escolha atual para renovar o guarda-roupa.",colors:["Preto","Branco","Verde oliva"],sizes:["P","M","G","GG","EG"]}
];
const categoryNames = {masculino:"Masculino",feminino:"Feminino",infantil:"Infantil",tendencias:"Tendências"};
let cart = [];
let activeFilter = "todos";
let toastTimer;
let selectedDetailProduct = null;
let selectedDetailSize = "";
let selectedDetailColor = "";

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartFooter = document.getElementById("cartFooter");
const toast = document.getElementById("toast");

function renderProducts(){
  const query = document.getElementById("searchInput").value.trim().toLocaleLowerCase("pt-BR");
  const filtered = products.filter(p => (activeFilter === "todos" || p.category === activeFilter) &&
    (p.name.toLocaleLowerCase("pt-BR").includes(query) || p.description.toLocaleLowerCase("pt-BR").includes(query) || categoryNames[p.category].toLocaleLowerCase("pt-BR").includes(query)));
  productGrid.innerHTML = filtered.map(p => `
    <article class="product-card" data-details="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${p.name}">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span>
        <button class="quick-add" data-add="${p.id}">Adicionar ao carrinho +</button></div>
      <div class="product-info"><div class="product-category">${categoryNames[p.category]}</div><h3>${p.name}</h3>
        <div class="product-bottom"><div><span class="price">${money(p.price)}</span></div><button class="details-button" data-details="${p.id}" aria-label="Ver detalhes de ${p.name}">↗</button></div>
      </div>
    </article>`).join("");
  document.getElementById("emptyState").hidden = filtered.length !== 0;
}
function setFilter(filter){
  activeFilter = filter;
  document.querySelectorAll("[data-filter].filter-chip").forEach(b => b.classList.toggle("active", b.dataset.filter === filter));
  renderProducts();
}
function notify(message){
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function addToCart(id, size = "A combinar", color = "A combinar"){
  const p = products.find(item => item.id === Number(id));
  if(!p) return;
  // Each product is added with default options; seller can confirm the exact variant on WhatsApp.
  const key = `${p.id}|${size}|${color}`;
  const found = cart.find(item => item.key === key);
  if(found) found.qty++;
  else cart.push({key,id:p.id,name:p.name,price:p.price,image:p.image,category:p.category,color,size,qty:1});
  renderCart(); notify("Produto adicionado ao carrinho!");
}
function changeQty(key,delta){
  const item = cart.find(i => i.key === key); if(!item) return;
  item.qty += delta; if(item.qty <= 0) cart = cart.filter(i => i.key !== key);
  renderCart();
}
function removeItem(key){cart = cart.filter(i => i.key !== key);renderCart();}
function renderCart(){
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  const total = cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  document.getElementById("cartSubtotal").textContent = money(total);
  document.getElementById("cartTotal").textContent = money(total);
  cartEmpty.hidden = cart.length !== 0;
  cartFooter.hidden = cart.length === 0;
  cartItems.innerHTML = cart.map(item=>`
    <article class="cart-line">
      <img src="${item.image}" alt="">
      <div><h4>${item.name}</h4><div class="line-meta">Tamanho: ${item.size} · Cor: ${item.color}</div><div class="line-price">${money(item.price*item.qty)}</div>
        <div class="qty-controls"><button data-qty="-1" data-key="${item.key}" aria-label="Diminuir quantidade">−</button><span>${item.qty}</span><button data-qty="1" data-key="${item.key}" aria-label="Aumentar quantidade">+</button></div>
      </div>
      <button class="remove-item" data-remove="${item.key}">Remover</button>
    </article>`).join("");
}
function openCart(){cartDrawer.classList.add("open");cartBackdrop.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){cartDrawer.classList.remove("open");cartBackdrop.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");document.body.style.overflow="";}
function communicateSeller(){
  if(!cart.length){notify("Adicione um produto ao carrinho primeiro.");return;}
  const total = cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  const lines = cart.map(item=>`• ${item.name}\n  Quantidade: ${item.qty} | Tamanho: ${item.size} | Cor: ${item.color}\n  Valor: ${money(item.price*item.qty)}`).join("\n\n");
  const message = `Olá! Gostaria de consultar meu pedido na WM Modas:\n\n${lines}\n\nTOTAL DOS PRODUTOS: ${money(total)}\n\nPode confirmar disponibilidade, cores/tamanhos e valor do frete?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
}
function openProductDetails(id){
  const p = products.find(item => item.id === Number(id)); if(!p) return;
  selectedDetailProduct = p; selectedDetailSize = p.sizes[0] || "Padrão"; selectedDetailColor = p.colors[0] || "A combinar";
  const backdrop = document.getElementById("productDetailBackdrop");
  backdrop.innerHTML = `<section class="product-detail" role="dialog" aria-modal="true" aria-label="Detalhes do produto">
    <button class="detail-close" type="button" aria-label="Fechar detalhes">×</button>
    <img class="detail-photo" src="${p.image}" alt="${p.name}">
    <div class="detail-info"><div class="product-category">${categoryNames[p.category]}</div><h2>${p.name}</h2>
      <div class="detail-price">R$ ${Math.floor(p.price)}<small>,${String(Math.round((p.price%1)*100)).padStart(2,"0")}</small></div>
      <p class="detail-description">${p.description}</p>
      <p class="detail-label">Tamanho:</p><div class="detail-options" data-detail-sizes>${p.sizes.map((size,i)=>`<button type="button" class="detail-option ${i===0?"selected":""}" data-size="${size}">${size}</button>`).join("")}</div>
      <p class="detail-label">Cor: <span id="selectedColorLabel" style="font-weight:400">${selectedDetailColor}</span></p>
      <div class="detail-colors">${p.colors.map((color,i)=>`<button type="button" class="detail-color ${i===0?"selected":""}" data-color="${color}" title="${color}" aria-label="Cor ${color}" style="background:${({"Verde oliva":"#77715f","Preto":"#171717","Bege":"#d8c9bd","Off-white":"#f6f3ec","Branco":"#fff","Cinza":"#85838a","Azul":"#303c9a"})[color]||"#aaa"}"></button>`).join("")}</div>
      <button class="detail-add" type="button">Adicionar no carrinho</button></div></section>`;
  backdrop.classList.add("open"); backdrop.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}
function closeProductDetails(){const b=document.getElementById("productDetailBackdrop");b.classList.remove("open");b.setAttribute("aria-hidden","true");document.body.style.overflow="";}
productGrid.addEventListener("click",e=>{const add=e.target.closest("[data-add]");if(add){e.stopPropagation();addToCart(add.dataset.add);return;}const detail=e.target.closest("[data-details]");if(detail)openProductDetails(detail.dataset.details);});
productGrid.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-details]")){e.preventDefault();openProductDetails(e.target.dataset.details);}});
const detailBackdrop=document.getElementById("productDetailBackdrop");
detailBackdrop.addEventListener("click",e=>{
  if(e.target===detailBackdrop||e.target.closest(".detail-close")){closeProductDetails();return;}
  const size=e.target.closest("[data-size]"); if(size){selectedDetailSize=size.dataset.size;detailBackdrop.querySelectorAll("[data-size]").forEach(b=>b.classList.toggle("selected",b===size));}
  const color=e.target.closest("[data-color]");if(color){selectedDetailColor=color.dataset.color;detailBackdrop.querySelectorAll("[data-color]").forEach(b=>b.classList.toggle("selected",b===color));const label=document.getElementById("selectedColorLabel");if(label)label.textContent=selectedDetailColor;}
  if(e.target.closest(".detail-add")&&selectedDetailProduct){addToCart(selectedDetailProduct.id,selectedDetailSize,selectedDetailColor);closeProductDetails();openCart();}
});
cartItems.addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]"); const remove=e.target.closest("[data-remove]");
  if(qty)changeQty(qty.dataset.key,Number(qty.dataset.qty));
  if(remove)removeItem(remove.dataset.remove);
});
document.querySelectorAll(".filter-chip").forEach(b=>b.addEventListener("click",()=>setFilter(b.dataset.filter)));
document.querySelectorAll(".category-card").forEach(b=>b.addEventListener("click",()=>{setFilter(b.dataset.filter);document.getElementById("produtos").scrollIntoView({behavior:"smooth"});}));
document.querySelectorAll("[data-category-link]").forEach(a=>a.addEventListener("click",()=>setFilter(a.dataset.categoryLink)));
document.getElementById("showAll").addEventListener("click",()=>setFilter("todos"));
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("continueShopping").addEventListener("click",()=>{closeCart();document.getElementById("produtos").scrollIntoView({behavior:"smooth"});});
cartBackdrop.addEventListener("click",closeCart);
document.getElementById("checkoutWhatsApp").addEventListener("click",communicateSeller);
document.getElementById("clearCart").addEventListener("click",()=>{cart=[];renderCart();notify("Carrinho esvaziado.");});
document.getElementById("menuToggle").addEventListener("click",()=>{const nav=document.getElementById("nav");const open=nav.classList.toggle("open");document.getElementById("menuToggle").setAttribute("aria-expanded",String(open));});
document.getElementById("year").textContent = new Date().getFullYear();
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeProductDetails();}});
renderProducts();renderCart();
