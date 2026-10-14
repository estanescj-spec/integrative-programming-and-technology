import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import { discountedPrice } from "../utils";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const refresh = async () => {
    if (!user || user.role === "admin") {
      setCart({ items: [] });
      return;
    }
    const { data } = await api.get("/cart");
    setCart(data.cart);
  };

  useEffect(() => {
    refresh().catch(() => setCart({ items: [] }));
  }, [user]);

  const count = useMemo(
    () => (cart.items || []).reduce((s, i) => s + i.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () =>
      (cart.items || []).reduce((s, i) => {
        const v = i.product?.variants?.find((x) => x.label === i.variant);
        return s + discountedPrice(v) * i.quantity;
      }, 0),
    [cart],
  );

  return (
    <CartContext.Provider value={{ cart, setCart, refresh, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
