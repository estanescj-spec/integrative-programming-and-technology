import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, login, logout, setUser } from "./actions/authActions";
import { fetchCart, setCart, setDeselected, toggleItem, } from "./actions/cartActions";
import { discountedPrice, variantOf } from "./utils";

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);
  return children;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  return {
    user,
    loading,
    login: (email, password) => dispatch(login(email, password)),
    logout: () => dispatch(logout()),
    setUser: (u) => dispatch(setUser(u)),
    refresh: () => dispatch(loadUser()),
  };
};

const keyOf = (i) => `${i.product?._id}|${i.variant}`;

export function CartProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  useEffect(() => {
    dispatch(fetchCart());
    if (!user) dispatch(setDeselected([]));
  }, [user, dispatch]);
  return children;
}

export const useCart = () => {
  const dispatch = useDispatch();
  const { cart, deselected } = useSelector((s) => s.cart);

  const count = useMemo(
    () => (cart.items || []).reduce((s, i) => s + i.quantity, 0),
    [cart],
  );
  const selectedItems = useMemo(
    () =>
      (cart.items || []).filter((i) => variantOf(i) && !deselected.includes(keyOf(i)),),
    [cart, deselected],
  );
  const selectedSubtotal = useMemo(
    () =>
      selectedItems.reduce((s, i) => s + discountedPrice(variantOf(i)) * i.quantity, 0,),
    [selectedItems],
  );

  return {
    cart,
    setCart: (c) => dispatch(setCart(c)),
    refresh: () => dispatch(fetchCart()),
    count,
    keyOf,
    toggle: (k) => dispatch(toggleItem(k)),
    deselected,
    setDeselected: (d) => dispatch(setDeselected(d)),
    selectedItems,
    selectedSubtotal,
  };
};
