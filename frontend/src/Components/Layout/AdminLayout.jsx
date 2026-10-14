import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const items = [
  { to: "/admin", icon: "fa-house", label: "Dashboard", end: true },
  { to: "/admin/users", icon: "fa-users", label: "Users" },
  { to: "/admin/products", icon: "fa-boxes-stacked", label: "Products" },
  { to: "/admin/categories", icon: "fa-layer-group", label: "Categories" },
  { to: "/admin/orders", icon: "fa-cart-shopping", label: "Orders" },
  { to: "/admin/reviews", icon: "fa-star", label: "Reviews" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="text-slate-800 bg-slate-100 h-screen w-screen overflow-hidden">
      <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-64 bg-navy-900 text-slate-300 flex flex-col flex-shrink-0 justify-between p-5 border-r border-navy-800 h-auto md:h-full z-20">
          <div>
            <div className="flex items-center gap-3 px-3 py-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-electric-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-electric-600/30">
                <i className="fa-solid font-black text-lg">TH</i>
              </div>
              <h1 className="text-white font-bold text-xl leading-tight tracking-wide">
                Toy Haven
              </h1>
            </div>
            <nav className="space-y-1.5">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "text-white bg-electric-600 shadow-lg shadow-electric-600/25"
                        : "text-slate-400 hover:text-white hover:bg-navy-800"
                    }`
                  }
                >
                  <i className={`fa-solid ${item.icon} text-base w-5 text-center`} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="px-3 py-3 border-t border-navy-800/60 mt-auto hidden md:block space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Online
              </span>
              <span className="text-slate-400 font-mono text-[11px]">v2.4.0</span>
            </div>
            <button
              onClick={logout}
              className="w-full text-left text-xs font-semibold text-slate-400 hover:text-white"
            >
              Sign out · {user?.name}
            </button>
            <NavLink to="/" className="block text-xs text-electric-500 hover:text-white">
              View store
            </NavLink>
          </div>
        </aside>
        <main className="flex-1 flex flex-col bg-slate-50 min-w-0 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
