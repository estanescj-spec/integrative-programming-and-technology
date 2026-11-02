import api from "../api";
import { SET_CART, TOGGLE_ITEM, SET_DESELECTED, } from "../constants/cartConstants";

const EMPTY = { items: [] };

export const fetchCart = () => async (dispatch, getState) => {
  const user = getState().auth.user;
  if (!user || user.role === "admin") {
    return dispatch({ type: SET_CART, payload: EMPTY });
  }

  try {
    const { data } = await api.get("/cart");
    dispatch({ type: SET_CART, payload: data.cart || EMPTY });
  } catch {
    dispatch({ type: SET_CART, payload: EMPTY });
  }
};

export const setCart = (cart) => ({ type: SET_CART,  payload: cart });
export const toggleItem = (key) => ({ type: TOGGLE_ITEM,  payload: key });
export const setDeselected = (keys) => ({ type: SET_DESELECTED, payload: keys, });
