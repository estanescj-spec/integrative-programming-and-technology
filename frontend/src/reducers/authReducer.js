import { LOAD_USER_SUCCESS, LOAD_USER_FAIL, LOGIN_SUCCESS, LOGOUT_SUCCESS, SET_USER, } from "../constants/authConstants";

export const authReducer = (state = { user: null, loading: true }, action) => {
  switch (action.type) {
    case LOAD_USER_SUCCESS: return { user: action.payload, loading: false };
    case LOAD_USER_FAIL: return { user: null, loading: false };
    case LOGIN_SUCCESS:
    case SET_USER: return { ...state, user: action.payload };
    case LOGOUT_SUCCESS: return { ...state, user: null };
    default: return state;
  }
};
