// Moteur de calcul de disponibilité composite d'un schéma d'infrastructure.
//
// Modèle : chaque bloc (nœud) est "up" ou "down" indépendamment, avec une
// probabilité égale à son SLA configuré. Les liens entre blocs sont supposés
// toujours fonctionnels (seuls les services peuvent être en panne). Le
// système global est disponible si, au moment considéré, il existe un chemin
// reliant au moins un bloc "source" (sans lien entrant) à au moins un bloc
// "puits" (sans lien sortant) en ne passant que par des blocs "up".
//
// Pour un nombre de blocs raisonnable (<= EXACT_LIMIT), le résultat est EXACT :
// on énumère tous les états up/down possibles (2^n) et on pondère chacun par
// sa probabilité. Au-delà, un calcul de panne combinée devient trop rare pour
// qu'une simulation Monte-Carlo soit fiable à cette échelle avec un temps de
// calcul raisonnable ; on bascule donc sur une simulation à grand nombre
// d'essais, clairement signalée comme une approximation.

const EXACT_NODE_LIMIT = 20;
const MONTE_CARLO_TRIALS = 500000;
const MINUTES_PER_MONTH = 43830; // moyenne (365.25 / 12 jours) * 24 * 60
const MINUTES_PER_YEAR = 525960;

function getNodeAvailability(node) {
  const entry = getServiceEntry(node.serviceId);
  if (!entry) return 1;
  const tier = entry.service.tiers[node.tierIndex] || entry.service.tiers[0];
  return tier.value;
}

function getNodeTier(node) {
  const entry = getServiceEntry(node.serviceId);
  if (!entry) return null;
  return entry.service.tiers[node.tierIndex] || entry.service.tiers[0];
}

function computeAvailability(nodes, edges) {
  const n = nodes.length;
  if (n === 0) return null;

  const ids = nodes.map((nd) => nd.id);
  const avail = {};
  nodes.forEach((nd) => {
    avail[nd.id] = getNodeAvailability(nd);
  });

  const incoming = new Set(edges.map((e) => e.to));
  const outgoing = new Set(edges.map((e) => e.from));
  const sources = ids.filter((id) => !incoming.has(id));
  const sinks = ids.filter((id) => !outgoing.has(id));

  const adj = {};
  ids.forEach((id) => (adj[id] = []));
  edges.forEach((e) => {
    if (adj[e.from]) adj[e.from].push(e.to);
  });

  function reachable(upSet) {
    const visited = new Set();
    const queue = [];
    sources.forEach((s) => {
      if (upSet.has(s)) {
        visited.add(s);
        queue.push(s);
      }
    });
    while (queue.length) {
      const cur = queue.shift();
      for (const nxt of adj[cur]) {
        if (upSet.has(nxt) && !visited.has(nxt)) {
          visited.add(nxt);
          queue.push(nxt);
        }
      }
    }
    return sinks.some((s) => visited.has(s));
  }

  let probability;
  let exact;

  if (n <= EXACT_NODE_LIMIT) {
    exact = true;
    let total = 0;
    const totalStates = 1 << n;
    for (let mask = 0; mask < totalStates; mask++) {
      let p = 1;
      const upSet = new Set();
      for (let i = 0; i < n; i++) {
        const id = ids[i];
        if ((mask >> i) & 1) {
          p *= avail[id];
          upSet.add(id);
        } else {
          p *= 1 - avail[id];
        }
      }
      if (p === 0) continue;
      if (reachable(upSet)) total += p;
    }
    probability = total;
  } else {
    exact = false;
    let success = 0;
    for (let t = 0; t < MONTE_CARLO_TRIALS; t++) {
      const upSet = new Set();
      for (const id of ids) {
        if (Math.random() < avail[id]) upSet.add(id);
      }
      if (reachable(upSet)) success++;
    }
    probability = success / MONTE_CARLO_TRIALS;
  }

  return { probability, exact, sources, sinks, nodeCount: n };
}

function formatPct(p) {
  let s = (p * 100).toFixed(5);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s + " %";
}

function formatDowntime(p) {
  const downMinutesMonth = (1 - p) * MINUTES_PER_MONTH;
  const downMinutesYear = (1 - p) * MINUTES_PER_YEAR;
  return {
    perMonth: formatMinutes(downMinutesMonth),
    perYear: formatMinutes(downMinutesYear),
  };
}

function formatMinutes(minutes) {
  if (minutes < 1) return (minutes * 60).toFixed(1) + " s";
  if (minutes < 90) return minutes.toFixed(1) + " min";
  const hours = minutes / 60;
  if (hours < 48) return hours.toFixed(1) + " h";
  return (hours / 24).toFixed(1) + " j";
}
