// Agrège les catalogues par fournisseur (Azure, AWS, GCP) en une seule table
// de lookup, et expose un provider pour l'UI. Un schéma peut librement
// mélanger des blocs de plusieurs fournisseurs (cas multi-cloud réaliste).

const PROVIDERS = [AZURE_PROVIDER, AWS_PROVIDER, GCP_PROVIDER];

// id de service -> { service, providerId, providerName, providerColor }
const SERVICE_INDEX = {};
PROVIDERS.forEach((provider) => {
  provider.categories.forEach((cat) => {
    cat.services.forEach((svc) => {
      SERVICE_INDEX[svc.id] = {
        service: svc,
        providerId: provider.id,
        providerName: provider.name,
        providerColor: provider.color,
      };
    });
  });
});

function getServiceEntry(serviceId) {
  return SERVICE_INDEX[serviceId] || null;
}
