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

  if (!product) return <p className="p-10 text-center text-slate-400">Loading...</p>;

  const v = product.variants.find((x) => x.label === variant);

  const add = async () => {
    if (!user) return toast.info("Sign in to add to cart");
    try {
      await api.post("/cart", { productId: product._id, variant, quantity: qty });
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-hidden aspect-square">
            {product.photos?.[photo]?.url ? (
              <img src={product.photos[photo].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <i className="fa-solid fa-cubes text-6xl" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {(product.photos || []).map((p, i) => (
              <button
                key={p.public_id || i}
                onClick={() => setPhoto(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border ${
                  i === photo ? "border-electric-600" : "border-slate-200"
                }`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-electric-600">
            {product.category}
          </p>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight mt-1">{product.name}</h1>
          <p className="text-amber-500 mt-2">
            {stars(product.ratings)}{" "}
            <span className="text-slate-400 text-sm">{product.ratings} · {product.numOfReviews} reviews</span>
          </p>
          <p className="text-slate-600 mt-4 whitespace-pre-wrap">{product.description}</p>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Variant</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setVariant(opt.label)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                    variant === opt.label
                      ? "bg-electric-600 text-white border-electric-600"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {opt.label} · {peso(discountedPrice(opt))}
                </button>
              ))}
            </div>
          </div>
          <p className="text-3xl font-black text-navy-900 mt-5">{peso(discountedPrice(v))}</p>
          <p className="text-sm text-slate-500">{v?.stock} in stock</p>
          <div className="flex items-center gap-3 mt-5">
            <input
              type="number"
              min={1}
              max={v?.stock || 1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 border border-slate-200 rounded-xl px-3 py-2"
            />
            <button
              onClick={add}
              className="bg-electric-600 hover:bg-electric-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-electric-600/25"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <section className="mt-12 bg-white rounded-2xl border border-slate-200/70 card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-navy-900">Reviews</h2>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}+ stars
              </option>
            ))}
          </select>
        </div>
        {canReview && (
          <form onSubmit={form.handleSubmit(saveReview)} className="mb-6 border-b border-slate-100 pb-6">
            <p className="text-sm font-bold mb-2">{mine ? "Update your review" : "Write a review"}</p>
            <select
              {...form.register("rating")}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm mb-2"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
            <textarea
              {...form.register("comment")}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              placeholder="How was the toy?"
            />
            {form.formState.errors.comment && (
              <p className="text-red-500 text-xs">{form.formState.errors.comment.message}</p>
            )}
            <button className="mt-2 bg-navy-900 text-white font-bold px-4 py-2 rounded-xl text-sm">
              {mine ? "Save changes" : "Post review"}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-slate-100 pb-3">
              <p className="font-bold text-navy-900">{r.user?.name}</p>
              <p className="text-amber-500 text-sm">{stars(r.rating)}</p>
              <p className="text-slate-600 text-sm mt-1">{r.comment}</p>
            </div>
          ))}
          {!reviews.length && <p className="text-slate-400 text-sm">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
