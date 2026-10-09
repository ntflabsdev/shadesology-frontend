export interface QuoteBasketItem {
  productId?: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  notes?: string;
}

const BASKET_KEY = "quote_basket";

export function loadQuoteBasket(): QuoteBasketItem[] {
  try {
    const raw = localStorage.getItem(BASKET_KEY);
    return raw ? JSON.parse(raw) as QuoteBasketItem[] : [];
  } catch {
    return [];
  }
}

export function saveQuoteBasket(items: QuoteBasketItem[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
}

export function clearQuoteBasket() {
  localStorage.removeItem(BASKET_KEY);
}

export function addToQuoteBasket(
  item: Omit<QuoteBasketItem, "quantity"> & { quantity?: number },
) {
  const basket = loadQuoteBasket();
  const existing = basket.findIndex(
    (entry) =>
      entry.productId === item.productId &&
      entry.variantId === item.variantId &&
      JSON.stringify(entry.selectedOptions) === JSON.stringify(item.selectedOptions),
  );
  if (existing >= 0) {
    basket[existing].quantity += item.quantity ?? 1;
  } else {
    basket.push({ ...item, quantity: item.quantity ?? 1 });
  }
  saveQuoteBasket(basket);
  window.dispatchEvent(new CustomEvent("quoteBasketUpdated", { detail: basket }));
}
