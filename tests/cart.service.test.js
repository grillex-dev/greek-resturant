import { addToCart, updateCartItemQuantity } from '../modules/cart/cart.service.js';
import prisma from '../config/prisma.js';

jest.mock('../config/prisma.js');

describe('Cart Service - Size Variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add item with size and calculate price', async () => {
      const mockProduct = {
        id: '1',
        name: 'Pizza',
        basePrice: 10.00,
        isActive: true,
        sizes: [
          { id: 's1', size: 'LARGE', priceModifier: 2.00 }
        ],
        components: [],
        extras: []
      };
      const mockCartItem = {
        id: 'c1',
        productId: '1',
        size: 'LARGE',
        finalPriceSnapshot: 12.00
      };
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.create.mockResolvedValue(mockCartItem);

      const data = {
        userId: 'u1',
        productId: '1',
        size: 'LARGE'
      };

      const result = await addToCart(data);
      expect(result).toEqual(mockCartItem);
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          size: 'LARGE',
          finalPriceSnapshot: 12.00
        }),
        include: expect.any(Object)
      });
    });

    it('should throw error for unavailable size', async () => {
      const mockProduct = {
        id: '1',
        basePrice: 10.00,
        isActive: true,
        sizes: [{ id: 's1', size: 'SMALL', priceModifier: 0 }],
        components: [],
        extras: []
      };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const data = {
        userId: 'u1',
        productId: '1',
        size: 'LARGE'
      };

      await expect(addToCart(data)).rejects.toThrow('Size not available for this product');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update cart item size', async () => {
      const mockCartItem = {
        id: 'c1',
        size: 'MEDIUM'
      };
      prisma.cartItem.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.cartItem.update.mockResolvedValue(mockCartItem);

      const updates = { size: 'MEDIUM' };
      const result = await updateCartItemQuantity('c1', { userId: 'u1' }, updates);
      expect(result).toEqual(mockCartItem);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: expect.objectContaining({ size: 'MEDIUM' }),
        include: expect.any(Object)
      });
    });
  });
});