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
    <div className="text-gray-900 bg-white h-screen w-screen overflow-hidden font-body">
      <div className="w-full h-full bg-white flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-64 bg-white text-gray-700 flex flex-col flex-shrink-0 justify-between p-5 border-r-2 border-gray-200 h-auto md:h-full z-20">
          <div>
            <div className="px-3 py-2 mb-6">
              <h1 className="font-fredoka text-2xl font-bold uppercase tracking-tight text-black">
                Toy Haven
              </h1>
              <div className="flex mt-2 h-1.5 w-16 rounded-full overflow-hidden">
                <div className="flex-1 bg-[#1D4ED8]" />
                <div className="flex-1 bg-[#E3000B]" />
              </div>
            </div>
            <nav className="space-y-1.5">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-full font-bold text-sm transition-all ${
                      isActive
                        ? "text-white bg-[#E3000B] shadow-md"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`
                  }
                >
                  <i
                    className={`fa-solid ${item.icon} text-base w-5 text-center`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="pt-3 border-t-2 border-gray-100 mt-auto space-y-1.5">
            <NavLink
              to="/"
              className="flex items-center gap-3.5 px-4 py-3 rounded-full font-bold text-sm text-gray-600 hover:text-black hover:bg-gray-100 transition-all"
            >
              <i className="fa-solid fa-store text-base w-5 text-center" />
              <span>View store</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-full font-bold text-sm text-[#E3000B] hover:bg-red-50 transition-all"
            >
              <i className="fa-solid fa-right-from-bracket text-base w-5 text-center" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
