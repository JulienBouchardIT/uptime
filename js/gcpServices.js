// Catalogue de services Google Cloud et de leurs SLA publiés par Google.
// Valeurs indicatives (SLA contractuels officiels) — à vérifier sur
// https://cloud.google.com/terms/sla avant usage en production.
// "noSla: true" = Google ne publie pas de SLA contractuel pour ce palier ;
// la valeur indiquée est une estimation prudente, pas un engagement.

const GCP_PROVIDER = {
  id: "gcp",
  name: "Google Cloud",
  color: "#4285F4",
  categories: [
    {
      category: "Calcul",
      services: [
        {
          id: "compute-engine",
          name: "Compute Engine",
          icon: "🖥️",
          tiers: [
            { label: "Instance unique", value: 0.995 },
            { label: "Groupe multi-zone (2+ zones)", value: 0.9999 },
          ],
        },
        {
          id: "cloud-run",
          name: "Cloud Run",
          icon: "🏃",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
        {
          id: "gke",
          name: "Google Kubernetes Engine",
          icon: "☸️",
          tiers: [
            { label: "Cluster zonal", value: 0.995 },
            { label: "Cluster régional (multi-zone)", value: 0.9995 },
          ],
        },
        {
          id: "cloud-functions",
          name: "Cloud Functions",
          icon: "⚡",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
      ],
    },
    {
      category: "Réseau",
      services: [
        {
          id: "cloud-load-balancing",
          name: "Cloud Load Balancing",
          icon: "🧭",
          tiers: [{ label: "Standard", value: 0.9999 }],
        },
        {
          id: "cloud-cdn",
          name: "Cloud CDN",
          icon: "📡",
          tiers: [{ label: "Standard", value: 0.999 }],
        },
        {
          id: "cloud-dns",
          name: "Cloud DNS",
          icon: "🌐",
          tiers: [{ label: "Zone publique", value: 1 }],
        },
        {
          id: "cloud-vpn",
          name: "Cloud VPN",
          icon: "🔒",
          tiers: [
            { label: "Classic VPN", value: 0.999 },
            { label: "HA VPN", value: 0.9999 },
          ],
        },
        {
          id: "cloud-interconnect",
          name: "Cloud Interconnect",
          icon: "🛣️",
          tiers: [
            { label: "Connexion unique", value: 0.999 },
            { label: "Paire redondante", value: 0.9999 },
          ],
        },
        {
          id: "apigee",
          name: "Apigee / API Gateway",
          icon: "🔌",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
      ],
    },
    {
      category: "Données",
      services: [
        {
          id: "cloud-sql",
          name: "Cloud SQL",
          icon: "🗄️",
          tiers: [
            { label: "Instance zonale (sans HA) — pas de SLA formel", value: 0.95, noSla: true },
            { label: "Configuration HA régionale", value: 0.9995 },
          ],
        },
        {
          id: "cloud-spanner",
          name: "Cloud Spanner",
          icon: "🌀",
          tiers: [
            { label: "Configuration régionale", value: 0.9999 },
            { label: "Configuration multi-région", value: 0.99999 },
          ],
        },
        {
          id: "firestore",
          name: "Firestore",
          icon: "🔥",
          tiers: [
            { label: "Régional", value: 0.9999 },
            { label: "Multi-région", value: 0.99999 },
          ],
        },
        {
          id: "cloud-storage",
          name: "Cloud Storage",
          icon: "📦",
          tiers: [
            { label: "Régional", value: 0.999 },
            { label: "Multi-région / bi-région", value: 0.9995 },
          ],
        },
        {
          id: "memorystore-redis",
          name: "Memorystore pour Redis",
          icon: "🧰",
          tiers: [
            { label: "Basic — pas de SLA", value: 0.95, noSla: true },
            { label: "Standard (HA, répliqué)", value: 0.999 },
          ],
        },
      ],
    },
    {
      category: "Intégration",
      services: [
        {
          id: "pubsub",
          name: "Pub/Sub",
          icon: "📨",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
      ],
    },
    {
      category: "Sécurité",
      services: [
        {
          id: "cloud-kms",
          name: "Cloud KMS",
          icon: "🔑",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
      ],
    },
  ],
};
