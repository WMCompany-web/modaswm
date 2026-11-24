/* Modas WM — página independente do carrinho */
const WHATSAPP_NUMBER = "5546984006226";
const $ = selector => document.querySelector(selector);
const formatPrice = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let cart = [];
let toastTimer;
try { cart = JSON.parse(localStorage.getItem("modas-wm-cart") || "[]"); } catch (_) { cart = []; }
function saveCart() { try { localStorage.setItem("modas-wm-cart", JSON.stringify(cart)); } catch (_) {} }
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = formatPrice(total);
  const panel = $("#cartPanel");
  if (!cart.length) {
    panel.innerHTML = `<div class="empty-cart"><img src="assets/carrinho-vazio.png" alt="Carrinho vazio"><h3>Seu carrinho está vazio</h3><p>Escolha seus produtos favoritos para vê-los aqui.</p><a class="button button-dark cart-empty-return" href="index.html#produtos">Voltar para comprar</a></div>`;
    $("#checkoutButton").disabled = true;
    return;
  }
  $("#checkoutButton").disabled = false;
  panel.innerHTML = `<div class="cart-items">${cart.map(item => `<article class="cart-item">
    <img src="${escapeHTML(item.image || 'assets/look-masculino.png')}" alt="${escapeHTML(item.name)}">
    <div class="cart-item-info"><h3>${escapeHTML(item.name)}</h3><p>${formatPrice(Number(item.price))} <span class="cart-item-meta">cada</span></p>
    <div class="cart-item-meta">Tamanho: ${escapeHTML(item.size || 'Único')} · Cor: ${escapeHTML(item.color || 'Padrão')}</div>
    <div class="quantity-controls"><button type="button" data-qty="-1" data-key="${escapeHTML(item.key)}" aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button type="button" data-qty="1" data-key="${escapeHTML(item.key)}" aria-label="Aumentar quantidade">+</button></div></div>
    <button class="remove-item" type="button" data-remove="${escapeHTML(item.key)}">Remover</button>
  </article>`).join("")}</div>`;
}
function checkout() {
  if (!cart.length) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const lines = cart.map(item => `• ${item.name}\n  Quantidade: ${item.quantity} | Tamanho: ${item.size || 'Único'} | Cor: ${item.color || 'Padrão'}\n  Subtotal: ${formatPrice(item.price * item.quantity)}`).join("\n\n");
  const message = `Olá, Modas WM! Gostaria de fazer este pedido:\n\n${lines}\n\nTOTAL: ${formatPrice(total)}\n\nComo podemos combinar o pagamento e a entrega?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}
document.addEventListener("click", event => {
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (qtyButton) {
    const item = cart.find(product => product.key === qtyButton.dataset.key);
    if (item) { item.quantity += Number(qtyButton.dataset.qty); if (item.quantity <= 0) cart = cart.filter(product => product.key !== item.key); saveCart(); renderCart(); }
  }
  if (removeButton) { cart = cart.filter(item => item.key !== removeButton.dataset.remove); saveCart(); renderCart(); showToast("Produto removido do carrinho."); }
});
$("#checkoutButton").addEventListener("click", checkout);
$("#themeToggle").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  $("#themeToggle").textContent = dark ? "☀" : "◐";
  $("#themeToggle").setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  try { localStorage.setItem("modas-wm-theme", dark ? "dark" : "light"); } catch (_) {}
});
try { if (localStorage.getItem("modas-wm-theme") === "dark") { document.body.classList.add("dark"); $("#themeToggle").textContent = "☀"; $("#themeToggle").setAttribute("aria-label", "Ativar modo claro"); } } catch (_) {}
$("#year").textContent = new Date().getFullYear();
renderCart();
