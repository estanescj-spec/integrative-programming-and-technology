import api from "../api";
import { LOAD_USER_SUCCESS, LOAD_USER_FAIL, LOGIN_SUCCESS, LOGOUT_SUCCESS, SET_USER, } from "../constants/authConstants";

export const loadUser = () => async (dispatch) => {
  try {
    const { data } = await api.get("/me");
    dispatch({ type: LOAD_USER_SUCCESS, payload: data.user });
  } catch {
    dispatch({ type: LOAD_USER_FAIL });
  }
};

export const login = (email, password) => async (dispatch) => {
  const { data } = await api.post("/login", { email, password });
  dispatch({ type: LOGIN_SUCCESS, payload: data.user });
  return data.user;
};

export const logout = () => async (dispatch) => {
  await api.get("/logout");
  dispatch({ type: LOGOUT_SUCCESS });
};

export const setUser = (user) => ({ type: SET_USER, payload: user });
