import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { discountedPrice, peso, stars } from "../utils";

const reviewSchema = yup.object({
  rating: yup.number().min(1).max(5).required(),
  comment: yup.string().min(3, "Say a bit more").required(),
});

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { refresh } = useCart();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [minRating, setMinRating] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [mine, setMine] = useState(null);
  const [photo, setPhoto] = useState(0);

  const form = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const loadReviews = async (ratingFilter) => {
    const { data } = await api.get(`/reviews/${id}`, {
      params: { minRating: ratingFilter || undefined },
    });
    setReviews(data.reviews);
    if (user) {
      const own = data.reviews.find((r) => r.user?._id === user._id);
      setMine(own || null);
      if (own) form.reset({ rating: own.rating, comment: own.comment });
    }
  };

  useEffect(() => {
    api.get(`/product/${id}`).then(({ data }) => {
      setProduct(data.product);
      setVariant(data.product.variants?.[0]?.label || "");
    });
  }, [id]);

  useEffect(() => {
    loadReviews(minRating);
  }, [id, minRating, user]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    api.get("/orders/me").then(({ data }) => {
      const bought = data.orders.some(
        (o) =>
          o.status === "delivered" &&
          o.items.some((i) => String(i.product?._id || i.product) === id),
      );
      setCanReview(bought);
    });
  }, [user, id]);

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-slate-400 gap-3">
        <svg
          className="animate-spin h-6 w-6 text-indigo-600"
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
        <span className="text-sm font-semibold">
          Loading product details...
        </span>
      </div>
    );
  }

  const v = product.variants.find((x) => x.label === variant);

  const add = async () => {
    if (!user) return toast.info("Sign in to add to cart");
    try {
      await api.post("/cart", {
        productId: product._id,
        variant,
        quantity: qty,
      });
      await refresh();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveReview = async (values) => {
    try {
      if (mine) {
        await api.put(`/review/${mine._id}`, values);
        toast.success("Review updated");
      } else {
        await api.post("/review", { productId: id, ...values });
        toast.success("Review posted");
      }
      const { data } = await api.get(`/product/${id}`);
      setProduct(data.product);
      await loadReviews(minRating);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 px-6 sm:px-10 lg:px-16 py-10 lg:py-14">
      {/* Product Display Section (Full Width End-to-End) */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Product Images */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 overflow-hidden aspect-square relative shadow-sm">
            {product.photos?.[photo]?.url ? (
              <img
                src={product.photos[photo].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                <svg
                  className="w-16 h-16 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.photos?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.photos.map((p, i) => (
                <button
                  key={p.public_id || i}
                  onClick={() => setPhoto(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-50 ${
                    i === photo
                      ? "border-indigo-600 scale-105 shadow-md"
                      : "border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={p.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="flex flex-col">
          {/* Category Badge */}
          <span className="inline-self-start text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100/60 w-fit">
            {product.category}
          </span>

          {/* Product Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-3">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm font-bold">
            <span>{stars(product.ratings)}</span>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">
              ({product.ratings} stars · {product.numOfReviews} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-slate-600 mt-6 text-base sm:text-lg leading-relaxed whitespace-pre-wrap border-t border-slate-100 pt-6">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Select Variant
            </p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setVariant(opt.label)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                    variant === opt.label
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  {opt.label} · {peso(discountedPrice(opt))}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Stock status */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-baseline gap-4">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {peso(discountedPrice(v))}
            </span>
            <span
              className={`text-sm font-bold ${v?.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}
            >
              {v?.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-xl transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={v?.stock || 1}
                value={qty}
                onChange={(e) =>
                  setQty(
                    Math.max(
                      1,
                      Math.min(v?.stock || 1, Number(e.target.value)),
                    ),
                  )
                }
                className="w-12 text-center font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setQty((prev) => Math.min(v?.stock || 1, prev + 1))
                }
                className="w-10 h-10 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-xl transition-colors"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={add}
              disabled={!v?.stock}
              className="flex-1 sm:flex-none inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Add to cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section (Full Width) */}
      <section className="mt-16 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              See what other buyers think of this toy
            </p>
          </div>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}+ stars
              </option>
            ))}
          </select>
        </div>

        {/* Review Form */}
        {canReview && (
          <form
            onSubmit={form.handleSubmit(saveReview)}
            className="mb-10 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60"
          >
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              {mine ? "Update your review" : "Write a review"}
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Rating
              </label>
              <select
                {...form.register("rating")}
                className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 bg-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                Comment
              </label>
              <textarea
                {...form.register("comment")}
                rows={3}
                className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="How was the toy?"
              />
              {form.formState.errors.comment && (
                <p className="text-rose-500 text-xs font-medium mt-1">
                  {form.formState.errors.comment.message}
                </p>
              )}
            </div>

            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              {mine ? "Save changes" : "Post review"}
            </button>
          </form>
        )}

        {/* Review Cards List */}
        <div className="divide-y divide-slate-100">
          {reviews.map((r) => (
            <div key={r._id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-base">
                  {r.user?.name || "Verified Customer"}
                </span>
                <span className="text-amber-400 text-xs font-bold">
                  {stars(r.rating)}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {r.comment}
              </p>
            </div>
          ))}

          {!reviews.length && (
            <p className="text-slate-400 text-sm py-4 italic">
              No reviews found matching criteria.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
