// Catalogue de services AWS et de leurs SLA publiés par Amazon.
// Valeurs indicatives (SLA contractuels officiels) — à vérifier sur
// https://aws.amazon.com/legal/service-level-agreements/ avant usage en
// production. "noSla: true" = AWS ne publie pas de SLA contractuel pour ce
// palier ; la valeur indiquée est une estimation prudente, pas un engagement.

const AWS_PROVIDER = {
  id: "aws",
  name: "AWS",
  color: "#FF9900",
  categories: [
    {
      category: "Calcul",
      services: [
        {
          id: "ec2",
          name: "EC2",
          icon: "🖥️",
          tiers: [
            { label: "Instance unique (zone unique) — pas de SLA formel", value: 0.99, noSla: true },
            { label: "Multi-AZ (2+ zones)", value: 0.9999 },
          ],
        },
        {
          id: "lambda",
          name: "Lambda",
          icon: "⚡",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
        {
          id: "eks",
          name: "Elastic Kubernetes Service",
          icon: "☸️",
          tiers: [{ label: "Standard support", value: 0.9995 }],
        },
      ],
    },
    {
      category: "Réseau",
      services: [
        {
          id: "elb",
          name: "Elastic Load Balancing",
          icon: "🧭",
          tiers: [{ label: "Application / Network Load Balancer", value: 0.9999 }],
        },
        {
          id: "cloudfront",
          name: "CloudFront",
          icon: "📡",
          tiers: [{ label: "Standard", value: 0.999 }],
        },
        {
          id: "route53",
          name: "Route 53",
          icon: "🌐",
          tiers: [{ label: "Zone hébergée", value: 1 }],
        },
        {
          id: "direct-connect",
          name: "Direct Connect",
          icon: "🛣️",
          tiers: [
            { label: "Connexion unique", value: 0.999 },
            { label: "Connexions multiples, sites multiples", value: 0.9999 },
            { label: "Résilience maximale (4 connexions)", value: 0.99999 },
          ],
        },
        {
          id: "aws-vpn",
          name: "Site-to-Site VPN",
          icon: "🔒",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
        {
          id: "api-gateway",
          name: "API Gateway",
          icon: "🔌",
          tiers: [{ label: "Standard", value: 0.9995 }],
        },
      ],
    },
    {
      category: "Données",
      services: [
        {
          id: "rds",
          name: "RDS",
          icon: "🗄️",
          tiers: [
            { label: "Instance mono-AZ — pas de SLA formel", value: 0.99, noSla: true },
            { label: "Multi-AZ", value: 0.9995 },
          ],
        },
        {
          id: "aurora",
          name: "Aurora",
          icon: "🐘",
          tiers: [{ label: "Multi-AZ", value: 0.9999 }],
        },
        {
          id: "dynamodb",
          name: "DynamoDB",
          icon: "📊",
          tiers: [
            { label: "Table régionale", value: 0.9999 },
            { label: "Global Tables (multi-région)", value: 0.99999 },
          ],
        },
        {
          id: "s3",
          name: "S3",
          icon: "📦",
          tiers: [
            { label: "Standard", value: 0.999 },
            { label: "One Zone-IA", value: 0.995 },
          ],
        },
        {
          id: "elasticache",
          name: "ElastiCache",
          icon: "🧰",
          tiers: [{ label: "Pas de SLA publié", value: 0.99, noSla: true }],
        },
      ],
    },
    {
      category: "Intégration",
      services: [
        {
          id: "sqs",
          name: "SQS",
          icon: "📨",
          tiers: [{ label: "Standard", value: 0.999 }],
        },
        {
          id: "sns",
          name: "SNS",
          icon: "📣",
          tiers: [{ label: "Standard", value: 0.999 }],
        },
      ],
    },
    {
      category: "Sécurité",
      services: [
        {
          id: "kms",
          name: "KMS",
          icon: "🔑",
          tiers: [{ label: "Standard", value: 0.9999 }],
        },
        {
          id: "secrets-manager",
          name: "Secrets Manager",
          icon: "🗝️",
          tiers: [{ label: "Standard", value: 0.9999 }],
        },
      ],
    },
  ],
};
