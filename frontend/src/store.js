import { legacy_createStore as createStore, combineReducers, applyMiddleware, } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./reducers/authReducer";
import { cartReducer } from "./reducers/cartReducer";

const reducer = combineReducers({ auth: authReducer, cart: cartReducer });

export const store = createStore(reducer, applyMiddleware(thunk));