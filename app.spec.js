const {
    createShopifyClient,
    fetchProductsByKeyword,
    displayProducts,
  } = require('./app.js'); // Replace with the actual path to your refactored code
  
  // Mock the Shopify API client
  jest.mock('@shopify/shopify-api', () => ({
    shopifyApi: jest.fn(() => ({
      clients: {
        Storefront: jest.fn(() => ({
          query: jest.fn(),
        })),
      },
    })),
  }));
  
  describe('Unit tests for Shopify API', () => {
    describe('createShopifyClient', () => {
      it('should create and return a Shopify client', async () => {
        const client = await createShopifyClient();
        expect(client).toBeDefined();
      });
    });
  
    describe('fetchProductsByKeyword', () => {
      it('should fetch products by keyword and return formatted data', async () => {
        // Mocked data
        const mockProductsData = {
          body: {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'Product 1',
                      variants: {
                        edges: [
                          {
                            node: {
                              title: 'Variant 1',
                              price: {
                                amount: '10.00',
                                currencyCode: 'USD',
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        };
  
        const mockClient = {
          query: jest.fn().mockResolvedValue(mockProductsData),
        };
  
        const products = await fetchProductsByKeyword('keyword', mockClient);
        expect(mockClient.query).toBeCalledWith({
          data: expect.stringContaining('keyword'),
        });
  
        expect(products).toEqual([
          {
            title: 'Product 1',
            variants: [
              {
                title: 'Variant 1',
                price: '10.00',
                currencyCode: 'USD',
              },
            ],
          },
        ]);
      });
  
      it('should handle errors and return an empty array on error', async () => {
        const mockClient = {
          query: jest.fn().mockRejectedValue(new Error('Error fetching products')),
        };
  
        const products = await fetchProductsByKeyword('keyword', mockClient);
        expect(mockClient.query).toBeCalledWith({
          data: expect.stringContaining('keyword'),
        });
  
        expect(products).toEqual([]);
      });
    });
  
    describe('displayProducts', () => {
      it('should display products and variants', () => {
        // Capture console.log output
        const consoleSpy = jest.spyOn(console, 'log');
  
        const products = [
          {
            title: 'Product 1',
            variants: [
              {
                title: 'Variant 1',
                price: '10.00',
              },
            ],
          },
        ];
  
        displayProducts(products);
  
        expect(consoleSpy).toHaveBeenCalledWith('Product 1 - Variant 1 - price $10.00');
        expect(consoleSpy).toHaveBeenCalledWith('-------------------------------');
  
        // Restore console.log
        consoleSpy.mockRestore();
      });
    });
  });
  