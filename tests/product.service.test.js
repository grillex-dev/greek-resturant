import { createProduct, updateProduct, getProductById } from '../modules/products/product.service.js';
import prisma from '../config/prisma.js';

jest.mock('../config/prisma.js');

describe('Product Service - Size Variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product with sizes', async () => {
      const mockProduct = {
        id: '1',
        name: 'Pizza',
        basePrice: 10.00,
        sizes: [
          { id: 's1', size: 'SMALL', priceModifier: 0 },
          { id: 's2', size: 'LARGE', priceModifier: 2.00 }
        ]
      };
      prisma.product.create.mockResolvedValue(mockProduct);
      prisma.category.findFirst.mockResolvedValue({ id: 'cat1' });

      const data = {
        name: 'Pizza',
        basePrice: '10.00',
        categoryId: 'cat1',
        restaurantId: 'rest1',
        sizes: [
          { size: 'SMALL', priceModifier: '0' },
          { size: 'LARGE', priceModifier: '2.00' }
        ]
      };

      const result = await createProduct(data);
      expect(result).toEqual(mockProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sizes: {
            create: [
              { size: 'SMALL', priceModifier: 0 },
              { size: 'LARGE', priceModifier: 2.00 }
            ]
          }
        }),
        include: expect.any(Object)
      });
    });

    it('should throw error for invalid size', async () => {
      prisma.category.findFirst.mockResolvedValue({ id: 'cat1' });

      const data = {
        name: 'Pizza',
        basePrice: '10.00',
        categoryId: 'cat1',
        restaurantId: 'rest1',
        sizes: [{ size: 'INVALID', priceModifier: '0' }]
      };

      await expect(createProduct(data)).rejects.toThrow('Invalid size: INVALID');
    });
  });

  describe('updateProduct', () => {
    it('should update product sizes', async () => {
      const mockProduct = {
        id: '1',
        name: 'Pizza',
        sizes: [{ id: 's1', size: 'MEDIUM', priceModifier: 1.00 }]
      };
      prisma.product.findUnique.mockResolvedValue({ id: '1' });
      prisma.product.update.mockResolvedValue(mockProduct);

      const data = {
        sizes: [{ size: 'MEDIUM', priceModifier: '1.00' }]
      };

      const result = await updateProduct('1', data);
      expect(result).toEqual(mockProduct);
      expect(prisma.productSize.deleteMany).toHaveBeenCalledWith({ where: { productId: '1' } });
      expect(prisma.productSize.createMany).toHaveBeenCalledWith({
        data: [{ productId: '1', size: 'MEDIUM', priceModifier: 1.00 }]
      });
    });
  });

  describe('getProductById', () => {
    it('should return product with sizes', async () => {
      const mockProduct = {
        id: '1',
        name: 'Pizza',
        sizes: [{ id: 's1', size: 'SMALL', priceModifier: 0 }]
      };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await getProductById('1');
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.objectContaining({ sizes: expect.any(Object) })
      });
    });
  });
});