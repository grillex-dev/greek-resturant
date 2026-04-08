import { createOrder } from '../modules/orders/order.service.js';
import prisma from '../config/prisma.js';

jest.mock('../config/prisma.js');

describe('Order Service - Size Variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with size snapshots', async () => {
      const mockOrder = {
        id: 'o1',
        items: [
          { id: 'i1', sizeSnapshot: 'LARGE' }
        ]
      };
      prisma.order.create.mockResolvedValue(mockOrder);

      const data = {
        restaurantId: 'r1',
        fulfillmentType: 'DELIVERY',
        cartItems: [
          {
            productId: 'p1',
            quantity: 1,
            size: 'LARGE',
            basePriceSnapshot: 10.00,
            finalPriceSnapshot: 12.00
          }
        ],
        totalAmount: '12.00',
        fulfillmentDetails: { street: '123 Main St', phoneNumber: '123-456-7890' }
      };

      const result = await createOrder(data);
      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          items: {
            create: expect.arrayContaining([
              expect.objectContaining({ sizeSnapshot: 'LARGE' })
            ])
          }
        }),
        include: expect.any(Object)
      });
    });
  });
});