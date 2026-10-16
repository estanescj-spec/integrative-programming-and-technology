import { Link } from "react-router-dom";

const categories = [
  "Lego Sets",
  "RC Cars",
  "Hot Wheels",
  "Nerf Blasters",
  "Puzzles",
  "Plush Toys",
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <span
            className="text-2xl font-bold tracking-tight text-black uppercase"
            style={{ fontFamily: "'Fredoka','Nunito',sans-serif" }}
          >
            Toy Haven
          </span>
          <p className="mt-3 text-sm text-gray-600 max-w-xs">
            Play, collect, and discover toys you love.
          </p>
        </div>

        <div>
          <h4 className="text-[12px] font-extrabold tracking-widest uppercase text-gray-900 mb-3">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {categories.map((c) => (
              <li key={c}>
                <Link
                  to={`/shop?category=${encodeURIComponent(c)}`}
                  className="hover:text-red-600 transition-colors"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-extrabold tracking-widest uppercase text-gray-900 mb-3">
            Account
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link
                to="/login"
                className="hover:text-red-600 transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-red-600 transition-colors"
              >
                Sign up
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="hover:text-red-600 transition-colors"
              >
                My orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-red-600 transition-colors">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-extrabold tracking-widest uppercase text-gray-900 mb-3">
            About
          </h4>
          <p className="text-sm text-gray-600">
            A school project built with the MERN stack for Integrative
            Programming and Technology I.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 py-5 text-center text-xs text-gray-500">
        © 2026 Toy Haven. All rights reserved.
      </div>
    </footer>
  );
}
