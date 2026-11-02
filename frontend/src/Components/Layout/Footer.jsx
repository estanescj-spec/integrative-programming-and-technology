import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const hover = "hover:text-brand-500 transition-colors";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <span className="text-2xl font-bold tracking-tight text-black uppercase">
            ToyHaven
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
                  to={`/shop?categories=${encodeURIComponent(c)}`}
                  className={hover}
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
              <Link to="/login" className={hover}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={hover}>
                Sign up
              </Link>
            </li>
            <li>
              <Link to="/orders" className={hover}>
                My orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className={hover}>
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
        © 2026 ToyHaven. All rights reserved.
      </div>
    </footer>
  );
}
