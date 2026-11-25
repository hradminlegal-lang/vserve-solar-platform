/** Odoo: VServe's own listings, stock and orders. Real implementation arrives in phase 4. */
export interface StockLevel {
  sku: string;
  quantity: number;
}

export interface OdooClient {
  stockLevels(skus: string[]): Promise<StockLevel[]>;
  createSaleOrder(
    reference: string,
    lines: { sku: string; quantity: number; unitPriceCentavos: number }[],
  ): Promise<{ orderId: number }>;
}

export class FakeOdoo implements OdooClient {
  async stockLevels(skus: string[]): Promise<StockLevel[]> {
    return skus.map((sku) => ({ sku, quantity: 10 }));
  }
  async createSaleOrder(): Promise<{ orderId: number }> {
    return { orderId: 1 };
  }
}
