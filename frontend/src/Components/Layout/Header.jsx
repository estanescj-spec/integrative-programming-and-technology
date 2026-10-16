import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, LogOut, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const linkCls = ({ isActive }) =>
  `hover:text-red-600 transition-colors ${isActive ? "text-red-600" : "text-gray-800"}`;

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-black uppercase"
          style={{ fontFamily: "'Fredoka','Nunito',sans-serif" }}
        >
          Toy Haven
        </Link>

        <nav
          className="hidden md:flex items-center space-x-10 text-[12px] font-extrabold tracking-widest uppercase"
          style={{ fontFamily: "'Nunito',sans-serif" }}
        >
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <NavLink to="/shop" className={linkCls}>
            Our Collection
          </NavLink>
          {user?.role === "customer" && (
            <NavLink to="/orders" className={linkCls}>
              Orders
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkCls}>
              Admin
            </NavLink>
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
            className="hover:text-red-600 transition-colors p-1"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>

          {user?.role !== "admin" && (
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative hover:text-red-600 transition-colors p-1"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          )}

          <Link
            to={user ? "/profile" : "/login"}
            aria-label="Account"
            className="hover:text-red-600 transition-colors p-1"
          >
            <User className="w-5 h-5 stroke-[2.2]" />
          </Link>

          {user && (
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="hover:text-red-600 transition-colors p-1"
            >
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
