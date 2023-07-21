require('@shopify/shopify-api/adapters/node');
const shopify = require('@shopify/shopify-api');

async function createShopifyClient() {
  const shopDomain = "green-check-1183.myshopify.com";
  const apiSecretKey = "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";
  const storefrontAccessToken = "700c88fcf8f4e9329316e9c154258266";

  const shopifyClient = new shopify.shopifyApi({
    apiKey: storefrontAccessToken,
    apiSecretKey,
    scopes: ['read_products'],
    hostName: shopDomain,
    apiVersion: "2023-07",
    isEmbeddedApp: false,
  });

  const storefrontClient = new shopifyClient.clients.Storefront({
    domain: shopDomain,
    storefrontAccessToken,
  });

  return storefrontClient;
}

function getSearchQuery(keyword) {
  return `
  {
    search(query: "${keyword}", first: 5, types: PRODUCT, sortKey: PRICE, reverse: true) {
      edges {
        node {
          ... on Product {
            title
            variants(first: 5) {
              edges {
                node {
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
}
async function fetchProductsByKeyword(keyword, client) {
 
  const searchQuery = getSearchQuery(keyword);

  try {
    const productsData = await client.query({ data: searchQuery });
    return productsData.body.data.search.edges.map(({ node }) => ({
      title: node.title,
      variants: node.variants.edges.map(({ node: variant }) => ({
        title: variant.title,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
      })),
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

function displayProducts(products) {
  products.forEach(({ title, variants }) => {
    variants.forEach(({ title: variantTitle, price }) => {
      console.log(`${title} - ${variantTitle} - price $${price}`);
    });
    console.log('-------------------------------');
  });
}

async function readArgsAndFetch() {
  const args = process.argv.slice(2);
  const nameArgIndex = args.indexOf('--name');

  if (nameArgIndex !== -1 && nameArgIndex + 1 < args.length) {
    const name = args[nameArgIndex + 1];
    const client = await createShopifyClient();
    const products = await fetchProductsByKeyword(name, client);
    console.log(JSON.stringify(products));
    displayProducts(products);
  } else {
    console.error('Invalid input. Please provide a product name using --name flag.');
  }
}

readArgsAndFetch();

module.exports = {
  createShopifyClient,
  fetchProductsByKeyword,
  displayProducts
};
