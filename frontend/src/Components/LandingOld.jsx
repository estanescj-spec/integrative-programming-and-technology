import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 8;

export default function Landing() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("pagination");
  const [loading, setLoading] = useState(false);
  const sentinel = useRef(null);

  const load = async (nextPage, append) => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { page: nextPage, limit: PAGE_SIZE },
      });
      setProducts((prev) =>
        append ? [...prev, ...data.products] : data.products,
      );
      setPages(data.pages);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setProducts((prev) => (append ? prev : []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories));
    load(1, false);
  }, []);

  useEffect(() => {
    if (mode !== "infinite") return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && page < pages)
        load(page + 1, true);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [mode, loading, page, pages]);

  const switchMode = (next) => {
    setMode(next);
    load(1, false);
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      {/* Hero Section — Spans End to End */}
      <section className="w-full bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.04),transparent_50%)]"></div>
        <div className="w-full px-6 sm:px-10 lg:px-16 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              New Arrivals
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Toys that spark bigger imaginations.
            </h1>
            <p className="text-slate-600 mt-5 text-lg lg:text-xl max-w-2xl leading-relaxed">
              Explore building sets, high-speed racers, plush friends, and
              challenging puzzles — all in one happy haven.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 text-base rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Shop the catalog
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Categories Quick Links Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xl shadow-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Popular Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/shop?category=${encodeURIComponent(c)}`}
                  className="group bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200/60 hover:border-indigo-200 transition-all duration-200 rounded-2xl p-4 text-sm font-semibold flex items-center justify-between text-slate-700 hover:text-indigo-600"
                >
                  <span className="truncate">{c}</span>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section — Full Width End to End */}
      <section className="w-full px-6 sm:px-10 lg:px-16 py-12">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Toys
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Showing{" "}
              <span className="font-semibold text-slate-800">{total}</span>{" "}
              handpicked products in the shop
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner self-start sm:self-auto">
            {["pagination", "infinite"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg capitalize transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {m === "pagination" ? "Pages" : "Infinite Scroll"}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid — Responsive full-width layout scaling from 1 to 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Pagination Controls */}
        {mode === "pagination" && pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => load(n, false)}
                className={`w-11 h-11 rounded-xl text-sm font-bold transition-all duration-200 ${
                  n === page
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {mode === "infinite" && <div ref={sentinel} className="h-12" />}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm font-medium">
            <svg
              className="animate-spin h-5 w-5 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading more toys...
          </div>
        )}
      </section>
    </div>
  );
}
