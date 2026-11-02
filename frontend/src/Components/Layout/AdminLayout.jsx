import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks";

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
  const { pathname } = useLocation();
  const current = items.find((i) =>
    i.end ? pathname === i.to : pathname.startsWith(i.to),
  );

  return (
    <div className="text-black bg-white h-screen w-screen overflow-hidden">
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 justify-between p-5 h-auto md:h-full z-20">
          <div>
            <div className="px-3 py-2 mb-6">
              <h1 className="text-xl font-bold tracking-tight text-black">
                ToyHaven
              </h1>
            </div>

            <p className="px-3 mb-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Menu
            </p>
            <nav className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      isActive
                        ? "bg-brand-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                    }`
                  }
                >
                  <i className={`fa-solid ${item.icon} w-5 text-center`} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="pt-3 border-t border-gray-100 mt-auto space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-store w-5 text-center" />
              <span>View store</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm text-red-500 hover:bg-brand-50 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket w-5 text-center" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-black">
                {current?.label || "Admin"}
              </h2>
              <p className="text-sm text-gray-500">Manage your store</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-black">{user?.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              {user?.profilePhoto?.url ? (
                <img
                  src={user.profilePhoto.url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
                  {(user?.name || "?")[0].toUpperCase()}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
