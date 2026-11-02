import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks";

export default function AccountLayout() {
  const { user } = useAuth();
  const link = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
      isActive ? "bg-brand-500 text-white" : "text-black hover:bg-cream"
    }`;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8">
      <aside className="md:w-64 shrink-0">
        <div className="flex flex-col items-center text-center mb-6">
          {user?.profilePhoto?.url ? (
            <img
              src={user.profilePhoto.url}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-500 text-white text-3xl font-bold flex items-center justify-center">
              {(user?.name || "?")[0].toUpperCase()}
            </div>
          )}
          <p className="mt-3 font-fredoka text-lg font-semibold text-black">
            {user?.name}
          </p>
        </div>

        <nav className="space-y-1">
          <NavLink to="/profile" end className={link}>
            My Account
          </NavLink>
          {user?.role === "customer" && (
            <NavLink to="/orders" className={link}>
              My Orders
            </NavLink>
          )}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
