import { SET_CART, TOGGLE_ITEM, SET_DESELECTED, } from "../constants/cartConstants";

export const cartReducer = (state = { cart: { items: [] }, deselected: [] }, action, ) => {
  switch (action.type) {
    case SET_CART: return { ...state, cart: action.payload || { items: [] } };
    case TOGGLE_ITEM:
      return {
        ...state,
        deselected: state.deselected.includes(action.payload)
          ? state.deselected.filter((k) => k !== action.payload)
          : [...state.deselected, action.payload],
      };
    case SET_DESELECTED: return { ...state, deselected: action.payload };
    default: return state;
  }
};
