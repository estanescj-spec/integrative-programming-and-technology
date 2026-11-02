import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { useAuth, useCart } from "../../hooks";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const q = new URLSearchParams(search);
  const onShop = pathname === "/shop";
  const isDeals = onShop && q.get("deals") === "true";
  const isCategories = onShop && !!q.get("categories");
  const isProducts = onShop && !isDeals && !isCategories;

  const underline = (active) =>
    `px-3 py-2 border-b-2 transition-colors ${
      active
        ? "text-brand-500 border-brand-500"
        : "text-black border-transparent hover:text-brand-500"
    }`;

  const [cats, setCats] = useState([]);
  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCats(data.categories))
      .catch(() => {});
  }, []);

  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  const toggleSearch = () => {
    if (!expanded) setTimeout(() => inputRef.current?.focus(), 300);
    else setOpen(false);
    setExpanded(!expanded);
  };

  const onSearch = (e) => {
    e.preventDefault();
    setOpen(false);
    const q = term.trim();
    navigate(q ? `/shop?keyword=${encodeURIComponent(q)}` : "/shop");
  };

  useEffect(() => {
    setTerm(new URLSearchParams(search).get("keyword") || "");
  }, [search]);

  useEffect(() => {
    const k = term.trim();
    if (k.length < 1) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    const t = setTimeout(() => {
      api
        .get("/products", { params: { keyword: k, limit: 5 } })
        .then(({ data }) => {
          if (!ignore) setSuggestions(data.products);
        })
        .catch(() => {});
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [term]);

  useEffect(() => {
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm animate-slide-down">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-7 pb-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl font-bold tracking-[0.25em] text-black uppercase"
        >
          ToyHaven
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-[13px] font-bold tracking-wide uppercase">
          <Link to="/" className={underline(pathname === "/")}>
            Home
          </Link>
          <Link to="/shop" className={underline(isProducts)}>
            Products
          </Link>

          <div className="relative group">
            <button
              type="button"
              className={`${underline(isCategories)} flex items-center gap-1 uppercase`}
            >
              Categories <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            </button>
            <div className="absolute left-0 top-full pt-3 z-50 opacity-0 invisible -translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
              <ul className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-48 normal-case tracking-normal">
                {cats.map((c) => (
                  <li key={c}>
                    <Link
                      to={`/shop?categories=${encodeURIComponent(c)}`}
                      className="block px-4 py-2 text-sm font-semibold text-black hover:bg-cream"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link to="/shop?deals=true" className={underline(isDeals)}>
            Deals
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full shadow-md transition-transform hover:scale-105"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="relative flex items-center justify-end space-x-4 text-gray-800 md:w-[22rem] lg:w-[25rem]">
          <div ref={boxRef} className="relative flex items-center">
            <form
              onSubmit={onSearch}
              className={`flex items-center bg-cream border rounded-full overflow-hidden transition-all duration-300 ease-in-out ${
                expanded
                  ? "w-52 lg:w-64 px-4 py-2 mr-2 opacity-100 border-gray-300 focus-within:border-brand-500"
                  : "w-0 px-0 py-2 mr-0 opacity-0 border-transparent pointer-events-none"
              }`}
            >
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Search toys..."
                tabIndex={expanded ? 0 : -1}
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => {
                    setTerm("");
                    setSuggestions([]);
                  }}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label="Clear"
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={toggleSearch}
              aria-label="Search"
              className="hover:text-brand-500 transition-colors p-1"
            >
              <SearchIcon sx={{ fontSize: 26 }} />
            </button>

            {expanded && open && suggestions.length > 0 && (
              <ul className="absolute right-0 w-52 lg:w-64 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-50 overflow-hidden">
                {suggestions.map((p) => (
                  <li key={p._id}>
                    <Link
                      to={`/product/${p._id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-cream"
                    >
                      {p.photos?.[0]?.url && (
                        <img
                          src={p.photos[0].url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-cream"
                        />
                      )}
                      <span className="text-sm font-semibold text-black line-clamp-1">
                        {p.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user?.role !== "admin" && (
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative hover:text-brand-500 transition-colors p-1"
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 26 }} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="relative group">
            <Link
              to={user ? "/profile" : "/login"}
              aria-label="Account"
              className="block hover:text-brand-500 transition-colors p-1"
            >
              <AccountCircleOutlinedIcon sx={{ fontSize: 26 }} />
            </Link>
            {user && (
              <div className="absolute right-0 top-full pt-3 z-50 opacity-0 invisible -translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                <ul className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-40">
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm font-semibold text-black hover:bg-cream"
                    >
                      My Account
                    </Link>
                  </li>
                  {user.role === "customer" && (
                    <li>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm font-semibold text-black hover:bg-cream"
                      >
                        My Orders
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-black hover:bg-cream flex items-center gap-2"
                    >
                      <LogoutIcon sx={{ fontSize: 18 }} /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
