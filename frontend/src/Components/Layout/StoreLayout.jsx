import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const navCls = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive ? "text-electric-600" : "text-slate-500 hover:text-navy-900"
  }`;

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-navy-900 text-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-600 flex items-center justify-center font-black shadow-lg shadow-electric-600/30">
              TH
            </div>
            <span className="font-bold text-xl tracking-wide">Toy Haven</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navCls} end>
              Home
            </NavLink>
            <NavLink to="/shop" className={navCls}>
              Shop
            </NavLink>
            {user?.role === "customer" && (
              <>
                <NavLink to="/orders" className={navCls}>
                  Orders
                </NavLink>
                <NavLink to="/profile" className={navCls}>
                  Profile
                </NavLink>
              </>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navCls}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user?.role !== "admin" && (
              <Link
                to="/cart"
                className="relative w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center hover:bg-electric-600 transition-colors"
              >
                <i className="fa-solid fa-cart-shopping" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-electric-500 text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <button
                onClick={onLogout}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-electric-600 hover:bg-electric-700 text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-electric-600/25"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-3 text-sm">
          <span className="text-white font-bold">Toy Haven</span>
          <span>Play, collect, and discover toys you love.</span>
        </div>
      </footer>
    </div>
  );
}
