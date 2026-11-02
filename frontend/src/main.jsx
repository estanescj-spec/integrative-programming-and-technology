import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider, CartProvider } from "./hooks.jsx";
import { store } from "./store.js";
import { Provider } from "react-redux";
import "./index.css";
import { createTheme, ThemeProvider, StyledEngineProvider, } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

const css = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

const brand = css("--color-brand-500", "#0059ff");

const theme = createTheme({
  palette: {
    primary: {
      main: brand,
      dark: css("--color-brand-600", "#1e293b"),
      light: css("--color-brand-50", "#f1f5f9"),
      contrastText: "#fff",
    },
    background: {
      default: css("--color-white", "#fffffc"),
      paper: css("--color-white", "#fffffc"),
    },
  },
  typography: {
    fontFamily: css("--font-sans", "Archivo, sans-serif"),
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, variant: "contained" },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 28, paddingBlock: 9 },
        containedPrimary: {
          boxShadow: `0 4px 10px ${brand}40`,
          "&:hover": { boxShadow: `0 6px 14px ${brand}55` },
        },
        outlined: { borderWidth: 2, "&:hover": { borderWidth: 2 } },
        outlinedPrimary: {
          "&:hover": { backgroundColor: brand, color: "#fff" },
        },
        outlinedError: {
          color: brand,
          borderColor: brand,
          "&:hover": {
            backgroundColor: brand,
            color: "#fff",
            borderColor: brand,
          },
        },
        textError: {
          color: brand,
          "&:hover": { backgroundColor: `${brand}14` },
        },
        containedError: {
          backgroundColor: brand,
          color: "#fff",
          "&:hover": { backgroundColor: css("--color-brand-600", "#0047cc") },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          fontSize: 14,
          paddingInline: 6,
          "& fieldset": { borderColor: "#d1d5db" },
          "&:hover fieldset": { borderColor: "#9ca3af" },
          "&.Mui-focused fieldset": { borderColor: brand, borderWidth: 1 },
        },
        input: {
          "&::placeholder": { color: "#9ca3af", opacity: 1 },
        },
      },
    },
    MuiPagination: {
      defaultProps: { color: "primary", shape: "circular", size: "large" },
    },
    MuiPaginationItem: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: 14, fontWeight: 600 } },
    },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiCheckbox: { defaultProps: { color: "primary" } },
    MuiFormControlLabel: {
      styleOverrides: { label: { fontSize: 14, fontWeight: 600 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3 } } },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 700 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: css("--color-cream", "#f4f6fa"),
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <StyledEngineProvider enableCssLayer>
              <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
              </ThemeProvider>
            </StyledEngineProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
