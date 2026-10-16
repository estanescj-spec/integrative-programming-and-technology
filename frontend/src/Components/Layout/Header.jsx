import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const { pathname, search } = useLocation();
  const q = new URLSearchParams(search);
  const onShop = pathname === "/shop";
  const isDeals = onShop && q.get("deals") === "true";
  const isCategory = onShop && !!q.get("category");
  const isProducts = onShop && !isDeals && !isCategory;

  const underline = (active) =>
    `text-black pb-1 border-b-2 transition-colors ${
      active ? "border-black" : "border-transparent hover:border-black"
    }`;

  const [cats, setCats] = useState([]);
  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCats(data.categories))
      .catch(() => {});
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?keyword=${encodeURIComponent(q)}` : "/shop");
    setSearchOpen(false);
    setTerm("");
  };

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white ">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-7 pb-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-3xl font-bold tracking-tight text-black uppercase"
          style={{ fontFamily: "'Fredoka','Nunito',sans-serif" }}
        >
          T o y H a v e n
        </Link>

        <nav
          className="hidden md:flex items-center space-x-8 text-[12px] font-extrabold tracking-widest uppercase"
          style={{ fontFamily: "'Nunito',sans-serif" }}
        >
          <Link to="/" className={underline(pathname === "/")}>
            Home
          </Link>
          <Link to="/shop" className={underline(isProducts)}>
            Products
          </Link>

          <div className="relative group">
            <button
              type="button"
              className={`${underline(isCategory)} flex items-center gap-1 uppercase`}
            >
              Categories <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block group-focus-within:block z-50">
              <ul className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-48 normal-case tracking-normal">
                {cats.map((c) => (
                  <li key={c}>
                    <Link
                      to={`/shop?category=${encodeURIComponent(c)}`}
                      className="block px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
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

          {user?.role === "customer" && (
            <Link
              to="/orders"
              className={underline(pathname.startsWith("/orders"))}
            >
              Orders
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={underline(false)}>
              Admin
            </Link>
          )}
        </nav>

        <div className="relative flex items-center space-x-4 text-gray-800">
          <form
            onSubmit={onSearch}
            className={`absolute right-full top-1/2 -translate-y-1/2 mr-4 flex items-center bg-gray-50 border border-gray-300 rounded-full transition-all duration-300 ease-in-out overflow-hidden ${
              searchOpen
                ? "w-56 md:w-64 px-4 py-2 opacity-100 shadow-sm"
                : "w-0 px-0 py-2 opacity-0 border-transparent pointer-events-none"
            }`}
          >
            <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Search toys & figures..."
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {term && (
              <button
                type="button"
                onClick={() => setTerm("")}
                className="text-gray-400 hover:text-gray-700 p-0.5 ml-1"
                aria-label="Clear text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((o) => !o)}
            className="hover:text-blue-700 transition-colors p-1"
          >
            <Search className="w-6 h-6 stroke-[2.2]" />
          </button>

          {user?.role !== "admin" && (
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative hover:text-blue-700 transition-colors p-1"
            >
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          )}

          <Link
            to={user ? "/profile" : "/login"}
            aria-label="Account"
            className="hover:text-blue-700 transition-colors p-1"
          >
            <User className="w-6 h-6 stroke-[2.2]" />
          </Link>

          {user && (
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="hover:text-blue-700 transition-colors p-1"
            >
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
