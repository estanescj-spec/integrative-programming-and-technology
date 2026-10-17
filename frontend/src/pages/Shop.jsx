import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../Components/ProductCard";

const empty = {
  keyword: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  hasReviews: false,
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...empty,
    category: params.get("category") || "",
    keyword: params.get("keyword") || "",
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const kw = params.get("keyword") || "";
  useEffect(() => {
    setFilters((f) => (f.keyword === kw ? f : { ...f, keyword: kw }));
    setPage(1);
  }, [kw]);
  const cat = params.get("category") || "";
  useEffect(() => {
    setFilters((f) => (f.category === cat ? f : { ...f, category: cat }));
    setPage(1);
  }, [cat]);

  const deals = params.get("deals") === "true";

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch((err) => console.error("Categories load failed:", err.message));
  }, []);

  useEffect(() => {
    const q = {
      page,
      limit: 9,
      keyword: filters.keyword || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      hasReviews: filters.hasReviews ? true : undefined,
      deals: deals ? true : undefined,
    };
    api
      .get("/products", { params: q })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((err) => console.error("Shop load failed:", err.message));
  }, [filters, page, deals]);

  const set = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "category" || key === "keyword") {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      setParams(next, { replace: true });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5 h-fit">
        <h2 className="font-fredoka text-xl font-semibold text-black mb-4">
          Filters
        </h2>
        <label className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase">
          Search
        </label>
        <input
          value={filters.keyword}
          onChange={(e) => set("keyword", e.target.value)}
          className="w-full mt-1 mb-3 border border-gray-300 rounded-full px-3 py-2 text-sm"
          placeholder="Toy name"
        />
        <label className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full mt-1 mb-3 border border-gray-300 rounded-full px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase">
          Price
        </label>
        <div className="flex gap-2 mt-1 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-full px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="w-full border border-gray-300 rounded-full px-2 py-2 text-sm"
          />
        </div>
        <label className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase">
          Min rating
        </label>
        <select
          value={filters.minRating}
          onChange={(e) => set("minRating", e.target.value)}
          className="w-full mt-1 mb-3 border border-gray-300 rounded-full px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ stars
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={filters.hasReviews}
            onChange={(e) => set("hasReviews", e.target.checked)}
          />
          Has reviews
        </label>
        <button
          onClick={() => {
            setFilters(empty);
            setPage(1);
            setParams({});
          }}
          className="mt-4 text-xs font-bold text-[#E3000B]"
        >
          Reset filters
        </button>
      </aside>
      <div>
        <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black mb-1">
          {deals ? "Deals" : "Our Collection"}{" "}
          <span className="text-[#E3000B]">({total})</span>
        </h1>
        <div className="flex mb-5 h-1.5 w-24 rounded-full overflow-hidden">
          <div className="flex-1 bg-[#1D4ED8]" />
          <div className="flex-1 bg-[#E3000B]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        {!products.length && (
          <p className="text-gray-500 mt-10 text-center">
            No toys match those filters.
          </p>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-full text-sm font-bold ${
                  n === page
                    ? "bg-[#E3000B] hover:bg-red-700 text-white"
                    : "bg-white border border-gray-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
