// Application : éditeur de schéma d'infrastructure multi-cloud (Azure, AWS,
// GCP) en drag & drop + liens, et calcul en direct de la disponibilité
// composite.

const STORAGE_KEY = "azure-uptime-diagram-v1"; // nom historique, conservé pour compatibilité
const NODE_W = 180;
const NODE_H = 60;

const state = {
  nodes: [], // {id, serviceId, tierIndex, x, y}
  edges: [], // {id, from, to}
  selectedNodeId: null,
  activeProviderId: PROVIDERS[0].id,
};

const canvasEl = document.getElementById("canvas");
const svgEl = document.getElementById("edges-svg");
const panelContentEl = document.getElementById("panel-content");
const serviceListEl = document.getElementById("service-list");
const providerTabsEl = document.getElementById("provider-tabs");

function genId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Sidebar : onglets fournisseur + liste de services draggable
// ---------------------------------------------------------------------------
function renderSidebar() {
  renderProviderTabs();
  renderServiceList();
}

function renderProviderTabs() {
  providerTabsEl.innerHTML = "";
  PROVIDERS.forEach((provider) => {
    const tab = document.createElement("div");
    tab.className = "provider-tab" + (provider.id === state.activeProviderId ? " active" : "");
    tab.style.setProperty("--provider-color", provider.color);
    tab.textContent = provider.name;
    tab.addEventListener("click", () => {
      state.activeProviderId = provider.id;
      renderSidebar();
    });
    providerTabsEl.appendChild(tab);
  });
}

function renderServiceList() {
  serviceListEl.innerHTML = "";
  const provider = PROVIDERS.find((p) => p.id === state.activeProviderId) || PROVIDERS[0];

  provider.categories.forEach((cat) => {
    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = cat.category;
    serviceListEl.appendChild(title);

    cat.services.forEach((svc) => {
      const item = document.createElement("div");
      item.className = "service-item";
      item.style.setProperty("--provider-color", provider.color);
      item.style.borderLeft = "3px solid var(--provider-color)";
      item.draggable = true;
      item.dataset.serviceId = svc.id;
      item.innerHTML = `<span class="icon">${svc.icon}</span><span>${svc.name}</span>`;
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", svc.id);
      });
      serviceListEl.appendChild(item);
    });
  });
}

// ---------------------------------------------------------------------------
// Canvas : drop de nouveaux blocs
// ---------------------------------------------------------------------------
canvasEl.addEventListener("dragover", (e) => e.preventDefault());
canvasEl.addEventListener("drop", (e) => {
  e.preventDefault();
  const serviceId = e.dataTransfer.getData("text/plain");
  if (!getServiceEntry(serviceId)) return;
  const rect = canvasEl.getBoundingClientRect();
  const x = Math.max(0, e.clientX - rect.left - NODE_W / 2);
  const y = Math.max(0, e.clientY - rect.top - NODE_H / 2);
  addNode(serviceId, x, y);
});

function addNode(serviceId, x, y) {
  state.nodes.push({
    id: genId("node"),
    serviceId,
    tierIndex: 0,
    x,
    y,
  });
  renderAll();
}

function deleteNode(nodeId) {
  state.nodes = state.nodes.filter((n) => n.id !== nodeId);
  state.edges = state.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
  if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
  renderAll();
}

function addEdge(fromId, toId) {
  if (fromId === toId) return;
  const exists = state.edges.some((e) => e.from === fromId && e.to === toId);
  if (exists) return;
  state.edges.push({ id: genId("edge"), from: fromId, to: toId });
  renderAll();
}

function deleteEdge(edgeId) {
  state.edges = state.edges.filter((e) => e.id !== edgeId);
  renderAll();
}

// ---------------------------------------------------------------------------
// Rendu des nœuds
// ---------------------------------------------------------------------------
function renderNodesDOM() {
  canvasEl.querySelectorAll(".node").forEach((el) => el.remove());

  state.nodes.forEach((node) => {
    const entry = getServiceEntry(node.serviceId);
    if (!entry) return;
    const { service: svc, providerName, providerColor } = entry;
    const tier = getNodeTier(node);
    const el = document.createElement("div");
    el.className = "node" + (state.selectedNodeId === node.id ? " selected" : "");
    el.style.left = node.x + "px";
    el.style.top = node.y + "px";
    el.style.setProperty("--provider-color", providerColor);
    el.dataset.nodeId = node.id;
    el.innerHTML = `
      <div class="node-provider">${providerName}</div>
      <div class="node-title"><span>${svc.icon}</span><span>${svc.name}</span></div>
      <div class="node-tier${tier.noSla ? " no-sla" : ""}">${tier.label} — ${formatPct(tier.value)}${tier.noSla ? " ⚠" : ""}</div>
      <div class="port port-in" data-node-id="${node.id}" data-side="in"></div>
      <div class="port port-out" data-node-id="${node.id}" data-side="out"></div>
    `;
    canvasEl.appendChild(el);
    attachNodeDrag(el, node);
  });

  canvasEl.querySelectorAll(".port-out").forEach((port) => attachLinkDrag(port));
}

function attachNodeDrag(el, node) {
  el.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("port")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = node.x;
    const origY = node.y;
    let moved = false;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      node.x = Math.max(0, origX + dx);
      node.y = Math.max(0, origY + dy);
      el.style.left = node.x + "px";
      el.style.top = node.y + "px";
      redrawEdges();
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (!moved) {
        state.selectedNodeId = node.id;
        renderAll();
      } else {
        saveState();
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// ---------------------------------------------------------------------------
// Liens entre blocs (drag depuis un port de sortie vers un port d'entrée)
// ---------------------------------------------------------------------------
function attachLinkDrag(portEl) {
  portEl.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fromId = portEl.dataset.nodeId;
    const canvasRect = canvasEl.getBoundingClientRect();

    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("class", "edge-temp");
    svgEl.appendChild(tempPath);

    function pos(e2) {
      return { x: e2.clientX - canvasRect.left, y: e2.clientY - canvasRect.top };
    }

    function onMove(ev) {
      const start = getPortPos(fromId, "out");
      const cur = pos(ev);
      tempPath.setAttribute("d", bezier(start, cur));
    }

    function onUp(ev) {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      tempPath.remove();
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      if (target && target.classList.contains("port-in")) {
        addEdge(fromId, target.dataset.nodeId);
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function getPortPos(nodeId, side) {
  const node = state.nodes.find((n) => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };

  const portEl = canvasEl.querySelector(`.port-${side}[data-node-id="${nodeId}"]`);
  if (portEl) {
    const portRect = portEl.getBoundingClientRect();
    const canvasRect = canvasEl.getBoundingClientRect();
    return {
      x: portRect.left + portRect.width / 2 - canvasRect.left,
      y: portRect.top + portRect.height / 2 - canvasRect.top,
    };
  }

  // repli si le port n'est pas encore dans le DOM
  return {
    x: side === "out" ? node.x + NODE_W : node.x,
    y: node.y + NODE_H / 2,
  };
}

function bezier(p1, p2) {
  const midX = (p1.x + p2.x) / 2;
  return `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
}

function redrawEdges() {
  svgEl.querySelectorAll("g.edge").forEach((el) => el.remove());
  state.edges.forEach((edge) => {
    const p1 = getPortPos(edge.from, "out");
    const p2 = getPortPos(edge.to, "in");
    const d = bezier(p1, p2);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "edge");

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("class", "edge-hit");
    hit.setAttribute("d", d);
    hit.setAttribute("stroke", "transparent");
    hit.setAttribute("stroke-width", "14");
    hit.setAttribute("fill", "none");
    hit.addEventListener("click", () => {
      if (confirm("Supprimer ce lien ?")) deleteEdge(edge.id);
    });

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("class", "edge-line");
    line.setAttribute("d", d);

    g.appendChild(hit);
    g.appendChild(line);
    svgEl.appendChild(g);
  });
}

// ---------------------------------------------------------------------------
// Panneau latéral : config du bloc sélectionné + résultat global
// ---------------------------------------------------------------------------
function renderPanel() {
  let html = "";

  const selected = state.nodes.find((n) => n.id === state.selectedNodeId);
  html += `<h2>Bloc sélectionné</h2>`;
  if (selected) {
    const entry = getServiceEntry(selected.serviceId);
    const svc = entry.service;
    html += `<div class="panel-card">
      <div class="node-provider">${entry.providerName}</div>
      <div class="node-title"><span>${svc.icon}</span><strong>${svc.name}</strong></div>
      <label class="hint" style="margin-top:8px;display:block;">Niveau de redondance / SKU</label>
      <select id="tier-select">
        ${svc.tiers
          .map(
            (t, i) =>
              `<option value="${i}" ${i === selected.tierIndex ? "selected" : ""}>${t.label} — ${formatPct(t.value)}${t.noSla ? " (pas de SLA)" : ""}</option>`
          )
          .join("")}
      </select>
      <button class="delete-btn" id="delete-node-btn">Supprimer ce bloc</button>
    </div>`;
  } else {
    html += `<div class="panel-card"><p class="hint" style="margin:0;">Cliquez sur un bloc du schéma pour configurer son niveau de redondance.</p></div>`;
  }

  html += `<h2>Résultat global</h2>`;
  html += `<div class="panel-card">${renderResult()}</div>`;

  panelContentEl.innerHTML = html;

  const tierSelect = document.getElementById("tier-select");
  if (tierSelect) {
    tierSelect.addEventListener("change", (e) => {
      selected.tierIndex = parseInt(e.target.value, 10);
      renderAll();
    });
  }
  const deleteBtn = document.getElementById("delete-node-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => deleteNode(selected.id));
  }
}

function renderResult() {
  if (state.nodes.length === 0) {
    return `<p class="hint" style="margin:0;">Ajoutez des blocs au schéma pour estimer la disponibilité globale.</p>`;
  }

  const res = computeAvailability(state.nodes, state.edges);
  const downtime = formatDowntime(res.probability);

  const noSlaNodes = state.nodes.filter((n) => {
    const t = getNodeTier(n);
    return t && t.noSla;
  });

  const breakdown = state.nodes
    .map((n) => {
      const entry = getServiceEntry(n.serviceId);
      const t = getNodeTier(n);
      return { name: entry.service.name, provider: entry.providerName, value: t.value, noSla: t.noSla };
    })
    .sort((a, b) => a.value - b.value);

  let html = `
    <div class="result-big">${formatPct(res.probability)}</div>
    <div class="result-sub">Disponibilité composite estimée</div>
    ${!res.exact ? `<div class="badge-approx">Approximation (schéma &gt; ${EXACT_NODE_LIMIT} blocs)</div>` : ""}
    <div class="result-line"><span>Interruption / mois</span><strong>${downtime.perMonth}</strong></div>
    <div class="result-line"><span>Interruption / an</span><strong>${downtime.perYear}</strong></div>
    <table class="breakdown">
      <thead><tr><th>Bloc</th><th>SLA</th></tr></thead>
      <tbody>
        ${breakdown
          .map(
            (b, i) =>
              `<tr class="${i === 0 ? "weak" : ""}"><td>${b.name} <span class="hint" style="display:inline">(${b.provider})</span>${b.noSla ? " ⚠" : ""}</td><td>${formatPct(b.value)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  if (noSlaNodes.length > 0) {
    html += `<div class="warning-box">⚠ ${noSlaNodes.length} bloc(s) utilisent un palier sans SLA contractuel publié par le fournisseur (estimation indicative uniquement).</div>`;
  }

  return html;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------
function renderAll() {
  renderNodesDOM();
  redrawEdges();
  renderPanel();
  saveState();
}

document.getElementById("btn-compute").addEventListener("click", renderAll);
document.getElementById("btn-clear").addEventListener("click", () => {
  if (state.nodes.length === 0) return;
  if (!confirm("Effacer tout le schéma ?")) return;
  state.nodes = [];
  state.edges = [];
  state.selectedNodeId = null;
  renderAll();
});

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nodes: state.nodes, edges: state.edges })
    );
  } catch (err) {
    // stockage indisponible (navigation privée, etc.) : on ignore silencieusement
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.nodes)) state.nodes = data.nodes;
    if (Array.isArray(data.edges)) state.edges = data.edges;
  } catch (err) {
    // données corrompues : on repart d'un schéma vide
  }
}

renderSidebar();
loadState();
renderAll();
