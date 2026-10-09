const STORAGE_KEY = "supplyiq-demo-v1";
const seedData = {
  products: [
    { id: "p1", name: "Industrial Fasteners", sku: "SKU-104", stock: 82, reorder: 100, cost: 45.5 },
    { id: "p2", name: "Packaging Cartons", sku: "SKU-218", stock: 340, reorder: 150, cost: 18 },
    { id: "p3", name: "Motor Assemblies", sku: "SKU-302", stock: 24, reorder: 30, cost: 1850 },
    { id: "p4", name: "Safety Gloves", sku: "SKU-411", stock: 210, reorder: 80, cost: 72 },
    { id: "p5", name: "Electrical Connectors", sku: "SKU-527", stock: 46, reorder: 60, cost: 125 },
    { id: "p6", name: "Pallet Wrap Rolls", sku: "SKU-633", stock: 95, reorder: 50, cost: 260 }
  ],
  shipments: [
    { id: "SH-2401", name: "Factory replenishment", origin: "Chennai", destination: "Coimbatore", distance: 500, cost: 12800, eta: 10, status: "In transit" },
    { id: "SH-2402", name: "Packaging supplies", origin: "Salem", destination: "Chennai", distance: 340, cost: 8900, eta: 8, status: "Planned" },
    { id: "SH-2403", name: "Motor components", origin: "Hosur", destination: "Coimbatore", distance: 230, cost: 7100, eta: 6, status: "Delayed" },
    { id: "SH-2404", name: "Safety equipment", origin: "Chennai", destination: "Salem", distance: 340, cost: 7600, eta: 7, status: "Delivered" }
  ],
  demandHistory: [120, 135, 128, 142, 150, 146],
  nextShipmentNumber: 2405,
  nextProductNumber: 700
};
let state = loadState();
let toastTimer;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.products) && Array.isArray(parsed.shipments)) return parsed;
    }
  } catch (error) {
    console.warn("Could not read demo data from Local Storage.", error);
  }
  return clone(seedData);
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { showToast("Could not save data in this browser."); console.error(error); }
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
function number(value) { return new Intl.NumberFormat("en-IN").format(value); }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function productStatus(product) {
  if (Number(product.stock) <= Number(product.reorder)) return "risk";
  if (Number(product.stock) <= Number(product.reorder) * 1.25) return "watch";
  return "healthy";
}
function productStatusLabel(product) {
  return ({ risk: "Needs restock", watch: "Monitor", healthy: "Healthy" })[productStatus(product)];
}
function shipmentStatusClass(status) {
  return ({ "Planned": "planned", "In transit": "transit", "Delivered": "delivered", "Delayed": "delayed" })[status] || "planned";
}
function getAlerts() {
  const stockAlerts = state.products.filter(p => productStatus(p) === "risk").map(p => ({
    type: "stock", severity: "high", title: `Low stock: ${p.name}`,
    message: `${p.stock} units available against a reorder point of ${p.reorder}. Consider replenishment.`,
    detail: `SKU ${p.sku}`
  }));
  const shipmentAlerts = state.shipments.filter(s => s.status === "Delayed").map(s => ({
    type: "shipment", severity: "high", title: `Shipment delayed: ${s.id}`,
    message: `${s.origin} → ${s.destination}. Review the estimated delivery plan and contact the carrier.`,
    detail: s.name
  }));
  return [...stockAlerts, ...shipmentAlerts];
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2700);
}
function statusPill(label, className) {
  return `<span class="status ${className}">${escapeHTML(label)}</span>`;
}
function productCell(product) {
  const icon = ({ "Industrial Fasteners": "⚙", "Packaging Cartons": "▣", "Motor Assemblies": "⌘", "Safety Gloves": "♧", "Electrical Connectors": "⌁", "Pallet Wrap Rolls": "▤" })[product.name] || "▤";
  return `<div class="product-cell"><span class="product-icon">${icon}</span><span>${escapeHTML(product.name)}</span></div>`;
}
function renderOverview() {
  document.getElementById("kpiSkus").textContent = number(state.products.length);
  const inventoryValue = state.products.reduce((sum, p) => sum + Number(p.stock) * Number(p.cost), 0);
  document.getElementById("kpiValue").textContent = money(inventoryValue);
  document.getElementById("kpiShipments").textContent = number(state.shipments.filter(s => s.status !== "Delivered").length);
  const stockRisks = state.products.filter(p => productStatus(p) === "risk").length;
  document.getElementById("kpiRisks").textContent = number(stockRisks);
  const alerts = getAlerts();
  document.getElementById("navAlertCount").textContent = alerts.length;
  const topProducts = [...state.products].sort((a, b) => (a.stock - a.reorder) - (b.stock - b.reorder)).slice(0, 5);
  document.getElementById("overviewInventory").innerHTML = topProducts.map(p => `<tr><td>${productCell(p)}</td><td>${escapeHTML(p.sku)}</td><td>${number(p.stock)}</td><td>${number(p.reorder)}</td><td>${statusPill(productStatusLabel(p), productStatus(p))}</td></tr>`).join("");
  const attention = alerts.slice(0, 4);
  document.getElementById("attentionList").innerHTML = attention.length ? attention.map(a => `
    <div class="attention-item"><span class="attention-icon ${a.type === "stock" ? "red" : "orange"}">${a.type === "stock" ? "▤" : "⇢"}</span>
      <div><strong>${escapeHTML(a.title)}</strong><p>${escapeHTML(a.message)}</p></div><span class="severity ${a.severity}">${a.severity.toUpperCase()}</span></div>`).join("") :
    `<div class="empty-state">No current risks detected from this demo data.</div>`;
  drawDemandChart();
}
function renderInventory() {
  const query = (document.getElementById("inventorySearch").value || "").toLowerCase().trim();
  const filter = document.getElementById("inventoryFilter").value;
  const products = state.products.filter(p => {
    const matchesQuery = `${p.name} ${p.sku}`.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || (filter === "risk" && productStatus(p) === "risk") || (filter === "healthy" && productStatus(p) === "healthy");
    return matchesQuery && matchesFilter;
  });
  document.getElementById("inventoryTable").innerHTML = products.map(p => `<tr>
    <td>${productCell(p)}</td><td>${escapeHTML(p.sku)}</td><td>${number(p.stock)}</td><td>${number(p.reorder)}</td><td>${money(p.cost)}</td>
    <td>${statusPill(productStatusLabel(p), productStatus(p))}</td>
    <td><div class="row-actions"><button class="small-action" data-edit-product="${escapeHTML(p.id)}">Edit</button><button class="small-action" data-adjust-stock="${escapeHTML(p.id)}">−5 stock</button><button class="small-action" data-delete-product="${escapeHTML(p.id)}">Delete</button></div></td></tr>`).join("");
  document.getElementById("inventoryEmpty").classList.toggle("hidden", products.length > 0);
}
function renderShipments() {
  const filter = document.getElementById("shipmentFilter").value;
  const shipments = state.shipments.filter(s => filter === "all" || s.status === filter);
  document.getElementById("shipmentTable").innerHTML = shipments.map(s => `<tr>
    <td><strong>${escapeHTML(s.id)}</strong><br><span style="font-size:10px;color:#929aab;font-weight:400">${escapeHTML(s.name)}</span></td>
    <td>${escapeHTML(s.origin)} → ${escapeHTML(s.destination)}</td><td>${number(s.distance)} km</td><td>${money(s.cost)}</td><td>${number(s.eta)} hrs</td>
    <td>${statusPill(s.status, shipmentStatusClass(s.status))}</td>
    <td><div class="row-actions"><button class="small-action" data-cycle-shipment="${escapeHTML(s.id)}">Update status</button></div></td></tr>`).join("");
  document.getElementById("shipmentEmpty").classList.toggle("hidden", shipments.length > 0);
  const routes = [...state.shipments].slice(0, 3);
  document.getElementById("routeCards").innerHTML = routes.map(s => `<article class="route-card"><h3>${escapeHTML(s.id)} · Route summary</h3><div class="route-line"><span style="color:#4f63e8">●</span>${escapeHTML(s.origin)} <span>→</span> ${escapeHTML(s.destination)}</div><div class="route-metrics"><div>Distance<strong>${number(s.distance)} km</strong></div><div>Est. cost<strong>${money(s.cost)}</strong></div><div>ETA<strong>${number(s.eta)} hrs</strong></div></div></article>`).join("");
}
function renderAlerts() {
  const alerts = getAlerts();
  const stock = alerts.filter(a => a.type === "stock").length;
  const shipment = alerts.filter(a => a.type === "shipment").length;
  document.getElementById("alertOpenCount").textContent = alerts.length;
  document.getElementById("alertStockCount").textContent = stock;
  document.getElementById("alertShipmentCount").textContent = shipment;
  document.getElementById("navAlertCount").textContent = alerts.length;
  document.getElementById("alertList").innerHTML = alerts.length ? alerts.map(a => `<div class="alert-row">
    <span class="attention-icon ${a.type === "stock" ? "red" : "orange"}">${a.type === "stock" ? "▤" : "⇢"}</span>
    <div class="alert-body"><strong>${escapeHTML(a.title)}</strong><p>${escapeHTML(a.message)}</p><small>${escapeHTML(a.detail)} · Generated from current demo data</small></div>
    ${statusPill(a.severity.toUpperCase(), a.severity === "high" ? "delayed" : "watch")}
    </div>`).join("") : `<div class="empty-state">No alerts right now. All current demo rules look clear.</div>`;
}
function updateForecastProductOptions() {
  const select = document.getElementById("forecastProduct");
  const previous = select.value;
  select.innerHTML = state.products.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join("");
  if (state.products.some(p => p.id === previous)) select.value = previous;
}
function renderAll() {
  renderOverview();
  renderInventory();
  renderShipments();
  renderAlerts();
  updateForecastProductOptions();
}
function drawDemandChart() {
  const canvas = document.getElementById("demandChart");
  if (!canvas || !canvas.getContext) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const w = rect.width, h = rect.height;
  const values = state.demandHistory.length ? state.demandHistory : [0, 0, 0, 0, 0, 0];
  const max = Math.max(...values, 1) * 1.18;
  const left = 30, right = 10, top = 12, bottom = 25;
  const plotW = w - left - right, plotH = h - top - bottom;
  ctx.clearRect(0, 0, w, h);
  ctx.font = "10px DM Sans, sans-serif";
  ctx.fillStyle = "#a1a8b7";
  ctx.strokeStyle = "#eef0f6";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = top + plotH * i / 3;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(w - right, y); ctx.stroke();
    ctx.fillText(String(Math.round(max - max * i / 3)), 0, y + 3);
  }
  const forecast = values.map((_, i) => values[Math.max(0, i - 2)] === undefined ? values[i] : (values.slice(Math.max(0, i - 2), i + 1).reduce((a, b) => a + b, 0) / values.slice(Math.max(0, i - 2), i + 1).length));
  const drawLine = (arr, color, dash = []) => {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash(dash);
    arr.forEach((v, i) => { const x = left + plotW * i / Math.max(1, arr.length - 1); const y = top + plotH * (1 - v / max); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke(); ctx.setLineDash([]);
    arr.forEach((v, i) => { const x = left + plotW * i / Math.max(1, arr.length - 1); const y = top + plotH * (1 - v / max); ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); });
  };
  drawLine(values, "#6374ed");
  drawLine(forecast, "#20b88a", [5, 4]);
  ["P1", "P2", "P3", "P4", "P5", "P6"].slice(0, values.length).forEach((label, i) => { ctx.fillStyle = "#a1a8b7"; ctx.fillText(label, left + plotW * i / Math.max(1, values.length - 1) - 6, h - 6); });
}
function navigate(view) {
  const target = document.getElementById(`view-${view}`);
  if (!target) return;
  document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
  target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  const title = ({ overview: "Overview", inventory: "Inventory", forecast: "Demand Forecast", shipments: "Shipments & Routes", alerts: "Risk Alerts" })[view] || "Overview";
  document.getElementById("breadcrumbCurrent").textContent = title;
  document.getElementById("sidebar").classList.remove("open");
  if (view === "overview") drawDemandChart();
}
function openProductDialog(product = null) {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = product?.id || "";
  document.getElementById("productDialogTitle").textContent = product ? "Edit product" : "Add product";
  document.getElementById("productName").value = product?.name || "";
  document.getElementById("productSku").value = product?.sku || "";
  document.getElementById("productStock").value = product?.stock ?? 0;
  document.getElementById("productReorder").value = product?.reorder ?? 0;
  document.getElementById("productCost").value = product?.cost ?? 0;
  document.getElementById("productDialog").showModal();
}
function openShipmentDialog() {
  document.getElementById("shipmentForm").reset();
  document.getElementById("shipmentDialog").showModal();
}
function handleProductSave(event) {
  event.preventDefault();
  const id = document.getElementById("productId").value;
  const product = {
    id: id || `p${Date.now()}`,
    name: document.getElementById("productName").value.trim(),
    sku: document.getElementById("productSku").value.trim().toUpperCase(),
    stock: Number(document.getElementById("productStock").value),
    reorder: Number(document.getElementById("productReorder").value),
    cost: Number(document.getElementById("productCost").value)
  };
  if (!product.name || !product.sku || !Number.isFinite(product.stock) || product.stock < 0 || product.reorder < 0 || product.cost < 0) {
    showToast("Check the product details and try again."); return;
  }
  const duplicate = state.products.some(p => p.sku.toLowerCase() === product.sku.toLowerCase() && p.id !== id);
  if (duplicate) { showToast("That SKU already exists. Use a unique SKU."); return; }
  if (id) state.products = state.products.map(p => p.id === id ? product : p);
  else state.products.push(product);
  saveState(); renderAll(); document.getElementById("productDialog").close();
  showToast(id ? "Product updated." : "Product added.");
}
function handleShipmentSave(event) {
  event.preventDefault();
  const shipment = {
    id: `SH-${state.nextShipmentNumber++}`,
    name: document.getElementById("shipmentName").value.trim(),
    origin: document.getElementById("shipmentOrigin").value.trim(),
    destination: document.getElementById("shipmentDestination").value.trim(),
    distance: Number(document.getElementById("shipmentDistance").value),
    cost: Number(document.getElementById("shipmentCost").value),
    eta: Number(document.getElementById("shipmentEta").value),
    status: document.getElementById("shipmentStatus").value
  };
  if (!shipment.name || !shipment.origin || !shipment.destination || shipment.distance <= 0 || shipment.cost < 0 || shipment.eta <= 0) {
    showToast("Enter valid shipment details."); return;
  }
  state.shipments.unshift(shipment);
  saveState(); renderAll(); document.getElementById("shipmentDialog").close();
  navigate("shipments"); showToast("Shipment created.");
}
function runForecast(event) {
  event.preventDefault();
  const raw = document.getElementById("demandInput").value.split(/[,;\s]+/).map(v => v.trim()).filter(Boolean);
  const values = raw.map(Number);
  if (values.length < 3 || values.some(v => !Number.isFinite(v) || v < 0)) {
    showToast("Enter at least 3 valid non-negative demand values."); return;
  }
  const periods = Number(document.getElementById("forecastPeriods").value);
  const recent = values.slice(-3);
  const average = recent.reduce((sum, v) => sum + v, 0) / recent.length;
  const product = state.products.find(p => p.id === document.getElementById("forecastProduct").value);
  const rounded = Math.round(average);
  document.getElementById("forecastSubtitle").textContent = `${product ? product.name : "Selected product"} · ${values.length} historical values`;
  document.getElementById("forecastResult").className = "forecast-result";
  document.getElementById("forecastResult").innerHTML = `
    <span class="mini-tag">3-PERIOD MOVING AVERAGE</span>
    <div class="forecast-number">${number(rounded)} <span style="font-size:13px;color:#8992a5;font-weight:600">units / period</span></div>
    <p class="forecast-meta">Baseline estimate from the latest 3 values: ${recent.map(number).join(", ")}</p>
    <div class="forecast-bars">${Array.from({ length: periods }, (_, i) => `<div class="forecast-bar-row"><span>Period ${i + 1}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, rounded / Math.max(rounded, ...values, 1) * 100)}%"></div></div><strong>${number(rounded)}</strong></div>`).join("")}</div>
    <div class="forecast-disclaimer"><strong>Interpretation:</strong> This simple baseline repeats the recent average. It does not account for seasonality, promotions, supply disruptions or external factors. No ML model is running.</div>`;
  showToast("Baseline forecast calculated.");
}
function cycleShipment(id) {
  const statuses = ["Planned", "In transit", "Delivered", "Delayed"];
  const shipment = state.shipments.find(s => s.id === id);
  if (!shipment) return;
  const current = statuses.indexOf(shipment.status);
  shipment.status = statuses[(current + 1) % statuses.length];
  saveState(); renderAll(); showToast(`${id} status changed to ${shipment.status}.`);
}
function bindEvents() {
  document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
  document.querySelectorAll("[data-open-view]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.openView)));
  document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("addProductBtn").addEventListener("click", () => openProductDialog());
  document.getElementById("addShipmentBtn").addEventListener("click", openShipmentDialog);
  document.getElementById("inventorySearch").addEventListener("input", renderInventory);
  document.getElementById("inventoryFilter").addEventListener("change", renderInventory);
  document.getElementById("shipmentFilter").addEventListener("change", renderShipments);
  document.getElementById("productForm").addEventListener("submit", handleProductSave);
  document.getElementById("shipmentForm").addEventListener("submit", handleShipmentSave);
  document.getElementById("forecastForm").addEventListener("submit", runForecast);
  document.getElementById("refreshAlerts").addEventListener("click", () => { renderAlerts(); showToast("Alerts refreshed from current demo data."); });
  document.getElementById("dismissNotice").addEventListener("click", () => document.getElementById("dismissNotice").closest(".notice").remove());
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.close).close()));
  document.getElementById("resetDemo").addEventListener("click", () => {
    if (!confirm("Reset all demo changes and restore the original sample data?")) return;
    state = clone(seedData); saveState(); renderAll(); showToast("Demo data reset.");
  });
  document.body.addEventListener("click", event => {
    const edit = event.target.closest("[data-edit-product]");
    const adjust = event.target.closest("[data-adjust-stock]");
    const remove = event.target.closest("[data-delete-product]");
    const cycle = event.target.closest("[data-cycle-shipment]");
    if (edit) {
      const product = state.products.find(p => p.id === edit.dataset.editProduct);
      if (product) openProductDialog(product);
    }
    if (adjust) {
      const product = state.products.find(p => p.id === adjust.dataset.adjustStock);
      if (product) { product.stock = Math.max(0, Number(product.stock) - 5); saveState(); renderAll(); showToast(`${product.name}: stock reduced by 5 units.`); }
    }
    if (remove) {
      const product = state.products.find(p => p.id === remove.dataset.deleteProduct);
      if (product && confirm(`Delete ${product.name}?`)) { state.products = state.products.filter(p => p.id !== product.id); saveState(); renderAll(); showToast("Product deleted."); }
    }
    if (cycle) cycleShipment(cycle.dataset.cycleShipment);
  });
  window.addEventListener("resize", () => { if (document.getElementById("view-overview").classList.contains("active")) drawDemandChart(); });
}
bindEvents();
renderAll();
