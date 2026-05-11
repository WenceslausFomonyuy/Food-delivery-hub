import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type AppliedCoupon = {
  code: string;
  discount_type: "percent" | "amount";
  discount_value: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  subtotal: number;
  discount: number;
  total: number;
  count: number;
  coupon: AppliedCoupon | null;
  setCoupon: (c: AppliedCoupon | null) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "whitepie.cart.v1";
const COUPON_KEY = "whitepie.coupon.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCouponState] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const c = localStorage.getItem(COUPON_KEY);
      if (c) setCouponState(JSON.parse(c));
    } catch {/* ignore */}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {/* ignore */}
  }, [items]);

  const setCoupon = (c: AppliedCoupon | null) => {
    setCouponState(c);
    try {
      if (c) localStorage.setItem(COUPON_KEY, JSON.stringify(c));
      else localStorage.removeItem(COUPON_KEY);
    } catch {/* ignore */}
  };

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const f = prev.find((p) => p.id === item.id);
      if (f) return prev.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { ...item, quantity: qty }];
    });
  };
  const setQty: CartCtx["setQty"] = (id, qty) => {
    if (qty <= 0) return setItems((prev) => prev.filter((p) => p.id !== id));
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, quantity: qty } : p));
  };
  const remove: CartCtx["remove"] = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => { setItems([]); setCoupon(null); };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = coupon
    ? coupon.discount_type === "percent"
      ? Math.min(subtotal, +(subtotal * (coupon.discount_value / 100)).toFixed(2))
      : Math.min(subtotal, coupon.discount_value)
    : 0;
  const total = Math.max(0, +(subtotal - discount).toFixed(2));
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, add, setQty, remove, clear, subtotal, discount, total, count, coupon, setCoupon }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
