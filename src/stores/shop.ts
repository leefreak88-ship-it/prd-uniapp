import { defineStore } from "pinia";
import type { Bill, Order } from "@/api/types";

interface ShopState {
  orders: Order[];
  bills: Bill[];
  activeCategoryId: string;
  initialized: boolean;
}

const STORAGE_KEY = "pd-shop-state";

export const useShopStore = defineStore("shop", {
  state: (): ShopState => ({
    orders: [],
    bills: [],
    activeCategoryId: "",
    initialized: false,
  }),

  getters: {
    paidOrders(state) {
      return state.orders.filter((item) => item.status === "paid");
    },
    getOrdersByUser: (state) => (userId: string) => {
      return state.orders.filter((item) => item.userId === userId);
    },
    getBillsByUser: (state) => (userId: string) => {
      return state.bills.filter((item) => item.userId === userId);
    },
    hasPurchased: (state) => {
      return (productId: string, userId: string) => {
        const paidOrderIds = new Set(
          state.bills.filter((item) => item.userId === userId).map((item) => item.orderId),
        );
        const paidProductIds = new Set(
          state.orders
            .filter((item) => item.userId === userId && paidOrderIds.has(item.id))
            .map((item) => item.productId),
        );
        return paidProductIds.has(productId);
      };
    },
  },

  actions: {
    saveState() {
      uni.setStorageSync(
        STORAGE_KEY,
        JSON.stringify({
          orders: this.orders,
          bills: this.bills,
          activeCategoryId: this.activeCategoryId,
          initialized: this.initialized,
        }),
      );
    },
    restoreState() {
      const raw = uni.getStorageSync(STORAGE_KEY);
      if (!raw) {
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        this.orders = parsed.orders ?? [];
        this.bills = parsed.bills ?? [];
        this.activeCategoryId = parsed.activeCategoryId ?? "";
        this.initialized = parsed.initialized ?? false;
      } catch {
        this.orders = [];
        this.bills = [];
        this.activeCategoryId = "";
        this.initialized = false;
      }
    },
    initShop() {
      if (this.initialized) {
        return;
      }
      this.restoreState();
      this.initialized = true;
      this.saveState();
    },
    setActiveCategory(categoryId: string) {
      this.activeCategoryId = categoryId;
      this.saveState();
    },
  },
});
