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
      setProducts((prev) => (append ? [...prev, ...data.products] : data.products));
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
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
    load(1, false);
  }, []);

  useEffect(() => {
    if (mode !== "infinite") return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && page < pages) load(page + 1, true);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [mode, loading, page, pages]);

  const switchMode = (next) => {
    setMode(next);
    load(1, false);
  };

  return (
    <div>
      <section className="bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-electric-500 text-xs font-bold uppercase tracking-widest">
              New arrivals
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-2">
              Toys that spark bigger imaginations.
            </h1>
            <p className="text-slate-400 mt-4 max-w-md">
              Building sets, racers, plush friends, and puzzles — all in one happy haven.
            </p>
            <Link
              to="/shop"
              className="inline-flex mt-6 bg-electric-600 hover:bg-electric-700 font-bold px-6 py-3 rounded-xl shadow-lg shadow-electric-600/25"
            >
              Shop the catalog
            </Link>
          </div>
          <div className="bg-navy-800 rounded-2xl p-8 border border-navy-800">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/shop?category=${encodeURIComponent(c)}`}
                  className="bg-navy-900/60 hover:bg-electric-600 transition-colors rounded-xl p-4 text-sm font-bold"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Featured toys
            </h2>
            <p className="text-slate-500 text-sm">{total} products in the shop</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {["pagination", "infinite"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg capitalize ${
                  mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        {mode === "pagination" && pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => load(n, false)}
                className={`w-10 h-10 rounded-xl text-sm font-bold ${
                  n === page
                    ? "bg-electric-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        {mode === "infinite" && <div ref={sentinel} className="h-10" />}
        {loading && <p className="text-center text-slate-400 mt-4 text-sm">Loading...</p>}
      </section>
    </div>
  );
}
