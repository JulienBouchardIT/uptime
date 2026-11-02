// Catalogue de services Azure et de leurs SLA publiés par Microsoft.
// Valeurs indicatives (SLA contractuels officiels) — à vérifier sur
// https://azure.microsoft.com/support/legal/sla/ avant usage en production.
// "noSla: true" = Microsoft ne publie pas de SLA contractuel pour ce palier ;
// la valeur indiquée est une estimation prudente, pas un engagement.

const AZURE_PROVIDER = {
  id: "azure",
  name: "Azure",
  color: "#0078D4",
  categories: [
    {
      category: "Calcul",
      services: [
        {
          id: "vm",
          name: "Virtual Machine",
          icon: "🖥️",
          tiers: [
            { label: "Instance unique — disque Standard HDD", value: 0.95 },
            { label: "Instance unique — disque Premium SSD", value: 0.999 },
            { label: "Ensemble à disponibilité (2+ VM)", value: 0.9995 },
            { label: "Zones de disponibilité (2+ VM, 2+ zones)", value: 0.9999 },
          ],
        },
        {
          id: "app-service",
          name: "App Service",
          icon: "🌐",
          tiers: [
            { label: "Free / Shared / Basic — pas de SLA", value: 0.95, noSla: true },
            { label: "Standard / Premium / Isolated", value: 0.9995 },
          ],
        },
        {
          id: "aks",
          name: "Azure Kubernetes Service",
          icon: "☸️",
          tiers: [
            { label: "Free tier — pas de SLA", value: 0.95, noSla: true },
            { label: "Standard / Premium (Uptime SLA)", value: 0.9995 },
          ],
        },
        {
          id: "functions",
          name: "Azure Functions",
          icon: "⚡",
          tiers: [
            { label: "Plan Consommation — pas de SLA", value: 0.95, noSla: true },
            { label: "Plan Premium / App Service dédié", value: 0.9995 },
          ],
        },
      ],
    },
    {
      category: "Réseau",
      services: [
        {
          id: "load-balancer",
          name: "Load Balancer",
          icon: "🧭",
          tiers: [{ label: "Standard SKU", value: 0.9999 }],
        },
        {
          id: "app-gateway",
          name: "Application Gateway",
          icon: "🚪",
          tiers: [{ label: "v2 zone-redondant", value: 0.9995 }],
        },
        {
          id: "vpn-gateway",
          name: "VPN Gateway",
          icon: "🔒",
          tiers: [
            { label: "SKU standard (non zone-redondant)", value: 0.999 },
            { label: "SKU zone-redondant", value: 0.9995 },
          ],
        },
        {
          id: "expressroute",
          name: "ExpressRoute",
          icon: "🛣️",
          tiers: [{ label: "Circuit unique", value: 0.9995 }],
        },
        {
          id: "front-door",
          name: "Front Door",
          icon: "🚦",
          tiers: [{ label: "Standard / Premium", value: 0.9999 }],
        },
        {
          id: "cdn",
          name: "Azure CDN",
          icon: "📡",
          tiers: [{ label: "Standard", value: 0.999 }],
        },
        {
          id: "traffic-manager",
          name: "Traffic Manager",
          icon: "🧮",
          tiers: [{ label: "Standard", value: 0.9999 }],
        },
        {
          id: "dns",
          name: "Azure DNS",
          icon: "🧭",
          tiers: [{ label: "Zone publique", value: 1 }],
        },
      ],
    },
    {
      category: "Données",
      services: [
        {
          id: "sql-db",
          name: "SQL Database",
          icon: "🗄️",
          tiers: [
            { label: "General Purpose / Standard / Basic", value: 0.9999 },
            { label: "Business Critical zone-redondant", value: 0.99995 },
            { label: "Hyperscale", value: 0.9999 },
          ],
        },
        {
          id: "cosmos-db",
          name: "Cosmos DB",
          icon: "🌍",
          tiers: [
            { label: "Mono-région", value: 0.9999 },
            { label: "Multi-région (lecture secondaire)", value: 0.99999 },
            { label: "Multi-région multi-écriture", value: 0.99999 },
          ],
        },
        {
          id: "storage",
          name: "Storage Account",
          icon: "📦",
          tiers: [
            { label: "LRS / ZRS (écriture)", value: 0.999 },
            { label: "GRS / GZRS (écriture)", value: 0.999 },
            { label: "RA-GRS / RA-GZRS (lecture secondaire)", value: 0.9999 },
          ],
        },
        {
          id: "redis",
          name: "Azure Cache for Redis",
          icon: "🧰",
          tiers: [
            { label: "Basic — pas de SLA", value: 0.95, noSla: true },
            { label: "Standard (répliqué)", value: 0.999 },
            { label: "Premium zone-redondant", value: 0.9999 },
          ],
        },
      ],
    },
    {
      category: "Intégration",
      services: [
        {
          id: "service-bus",
          name: "Service Bus",
          icon: "📨",
          tiers: [
            { label: "Basic / Standard", value: 0.999 },
            { label: "Premium zone-redondant", value: 0.9999 },
          ],
        },
        {
          id: "apim",
          name: "API Management",
          icon: "🔌",
          tiers: [
            { label: "Developer — pas de SLA", value: 0.95, noSla: true },
            { label: "Standard", value: 0.9995 },
            { label: "Premium multi-région", value: 0.9999 },
          ],
        },
      ],
    },
    {
      category: "Sécurité",
      services: [
        {
          id: "key-vault",
          name: "Key Vault",
          icon: "🔑",
          tiers: [{ label: "Standard / Premium", value: 0.9999 }],
        },
      ],
    },
  ],
};
