import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../Components/ProductCard";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const empty = {
  keyword: "",
  categories: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  hasReviews: false,
  sort: "",
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...empty,
    categories: params.get("categories") || "",
    keyword: params.get("keyword") || "",
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef(null);
  const busyRef = useRef(false);

  const kw = params.get("keyword") || "";
  useEffect(() => {
    setFilters((f) => (f.keyword === kw ? f : { ...f, keyword: kw }));
    setPage(1);
  }, [kw]);
  const cat = params.get("categories") || "";
  useEffect(() => {
    setFilters((f) => (f.categories === cat ? f : { ...f, categories: cat }));
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
    let ignore = false;
    busyRef.current = true;
    setLoading(true);
    const q = {
      page,
      limit: 12,
      keyword: filters.keyword || undefined,
      categories: filters.categories || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      hasReviews: filters.hasReviews ? true : undefined,
      deals: deals ? true : undefined,
      sort: filters.sort || undefined,
    };
    api
      .get("/products", { params: q })
      .then(({ data }) => {
        if (ignore) return;
        setProducts((prev) => {
          if (page === 1) return data.products;
          const seen = new Set(prev.map((p) => p._id));
          return [...prev, ...data.products.filter((p) => !seen.has(p._id))];
        });
        setPages(data.pages);
        setTotal(data.total);
        busyRef.current = false;
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Shop load failed:", err.message);
        if (page === 1) setProducts([]);
        setPages(1);
        setTotal(0);
        busyRef.current = false;
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filters, page, deals]);

  useEffect(() => {
    setPage(1);
  }, [deals]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !busyRef.current && page < pages) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, page, pages]);

  const set = (key, value) => {
    window.scrollTo({ top: 0 });
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "categories" || key === "keyword") {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      setParams(next, { replace: true });
    }
  };

  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const selectedCats = filters.categories ? filters.categories.split(",") : [];

  const toggleCat = (c) => {
    const next = selectedCats.includes(c)
      ? selectedCats.filter((x) => x !== c)
      : [...selectedCats, c];
    set("categories", next.join(","));
  };

  const applyPrice = () => {
    window.scrollTo({ top: 0 });
    setPage(1);
    setFilters((f) => ({
      ...f,
      minPrice: priceDraft.min,
      maxPrice: priceDraft.max,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5 h-fit lg:sticky lg:top-24">
        <h2 className="font-fredoka text-xl font-semibold text-black mb-4">
          Filters
        </h2>

        <p className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase mb-2">
          Price
        </p>
        <div className="flex gap-2 mb-2">
          <TextField
            type="number"
            placeholder="Min"
            value={priceDraft.min}
            onChange={(e) =>
              setPriceDraft({ ...priceDraft, min: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
          />
          <TextField
            type="number"
            placeholder="Max"
            value={priceDraft.max}
            onChange={(e) =>
              setPriceDraft({ ...priceDraft, max: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
          />
        </div>
        <Button fullWidth onClick={applyPrice} sx={{ mb: 2 }}>
          Apply
        </Button>

        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase mb-1">
            Category
          </p>
          <div className="mb-4 max-h-48 overflow-y-auto flex flex-col">
            {categories.map((c) => (
              <FormControlLabel
                key={c}
                label={c}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCats.includes(c)}
                    onChange={() => toggleCat(c)}
                  />
                }
              />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase mb-2">
            Min rating
          </p>
          <Select
            fullWidth
            displayEmpty
            value={filters.minRating}
            onChange={(e) => set("minRating", e.target.value)}
            sx={{ mb: 1 }}
          >
            <MenuItem value="">Any</MenuItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}+ stars
              </MenuItem>
            ))}
          </Select>

          <FormControlLabel
            label="Has reviews"
            control={
              <Checkbox
                size="small"
                checked={filters.hasReviews}
                onChange={(e) => set("hasReviews", e.target.checked)}
              />
            }
          />
        </div>

        <Button
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => {
            window.scrollTo({ top: 0 });
            setFilters(empty);
            setPriceDraft({ min: "", max: "" });
            setPage(1);
            setParams(deals ? { deals: "true" } : {});
          }}
        >
          Reset filters
        </Button>
      </aside>

      <div>
        <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
          <div>
            <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black mb-1">
              {filters.keyword ? (
                <>
                  Search result for{" "}
                  <span className="text-brand-500">"{filters.keyword}"</span>
                </>
              ) : deals ? (
                "Deals"
              ) : (
                "Products"
              )}{" "}
              <span className="text-gray-500 text-2xl">({total})</span>
            </h1>
          </div>
          <Select
            displayEmpty
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">Sort by</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {!products.length && !loading && (
          <p className="text-gray-500 mt-10 text-center">
            {filters.keyword
              ? `No toys found for "${filters.keyword}".`
              : "No toys match those filters."}
          </p>
        )}

        <div ref={sentinelRef} className="h-px" />

        {loading && (
          <div className="flex justify-center py-8">
            <CircularProgress size={28} />
          </div>
        )}

        {!loading && products.length > 0 && page >= pages && (
          <p className="text-center text-sm text-gray-400 py-8">
            You've reached the end.
          </p>
        )}
      </div>
    </div>
  );
}
