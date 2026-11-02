import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../api";
import { useAuth, useCart } from "../hooks";
import { Controller, useForm } from "react-hook-form";
import { discountedPrice, peso } from "../utils";
import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Rating,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";

const field = (register, name) => {
  const { ref, ...rest } = register(name);
  return { ...rest, inputRef: ref };
};

const reviewSchema = yup.object({
  comment: yup.string().min(3, "Say a bit more").required(),
});

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh, setDeselected, keyOf } = useCart();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [mine, setMine] = useState(null);
  const [photo, setPhoto] = useState(0);
  const [tab, setTab] = useState("description");
  const [starFilter, setStarFilter] = useState("");

  const form = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const loadReviews = async () => {
    const { data } = await api.get(`/reviews/${id}`);
    setReviews(data.reviews);
    if (user) {
      const own = data.reviews.find((r) => r.user?._id === user._id);
      setMine(own || null);
      if (own) form.reset({ rating: own.rating, comment: own.comment });
    }
  };

  useEffect(() => {
    api
      .get(`/product/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        setVariant(data.product.variants?.[0]?.label || "");
        setPhoto(0);
        setQty(1);
      })
      .catch(() => {
        toast.error("Product not found");
        navigate("/shop");
      });
  }, [id]);

  useEffect(() => {
    loadReviews().catch(() => {});
  }, [id, user]);

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
      <div className="w-full min-h-[60vh] flex items-center justify-center text-gray-400 gap-3">
        <CircularProgress size={24} />
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

  const buyNow = async () => {
    if (!user) return toast.info("Sign in to buy");
    try {
      const { data } = await api.post("/cart", {
        productId: product._id,
        variant,
        quantity: qty,
      });
      await refresh();
      const mine = `${product._id}|${variant}`;
      setDeselected(data.cart.items.map(keyOf).filter((k) => k !== mine));
      navigate("/checkout");
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
      await loadReviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeReview = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/review/${mine._id}`);
      form.reset({ rating: 5, comment: "" });
      const { data } = await api.get(`/product/${id}`);
      setProduct(data.product);
      await loadReviews();
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const counts = [5, 4, 3, 2, 1].map(
    (n) => reviews.filter((r) => r.rating === n).length,
  );
  const shownReviews = starFilter
    ? reviews.filter((r) => r.rating === Number(starFilter))
    : reviews;

  return (
    <div className="w-full min-h-screen bg-white text-black px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5 sm:p-8 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
          {/* Left: images */}
          <div>
            <div className="bg-cream rounded-xl border border-gray-200 overflow-hidden aspect-square w-full">
              {product.photos?.[photo]?.url ? (
                <img
                  src={product.photos[photo].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium">
                  No Image Available
                </div>
              )}
            </div>

            {product.photos?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.photos.map((p, i) => (
                  <button
                    key={p.public_id || i}
                    onClick={() => setPhoto(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 bg-cream transition-colors ${
                      i === photo
                        ? "border-brand-500"
                        : "border-gray-200 hover:border-gray-400"
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

          {/* Right: details */}
          <div className="min-w-0">
            <h1 className="font-fredoka text-2xl sm:text-3xl font-semibold text-black tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-black">{product.ratings}</span>
                <Rating
                  value={Number(product.ratings)}
                  precision={0.1}
                  readOnly
                  size="small"
                />
              </div>
              <span className="h-5 border-l border-gray-300" />
              <span className="text-gray-600">
                <span className="font-bold text-black underline underline-offset-2">
                  {product.numOfReviews || 0}
                </span>{" "}
                Ratings
              </span>
            </div>

            {/* Price bar */}
            <div className="mt-5 bg-cream rounded-xl px-5 py-4 flex items-baseline flex-wrap gap-3">
              <span className="font-fredoka text-3xl sm:text-4xl font-semibold text-brand-500">
                {peso(discountedPrice(v))}
              </span>
              {v?.discountPercent > 0 && (
                <>
                  <span className="text-base font-semibold text-gray-400 line-through">
                    {peso(v.price)}
                  </span>
                  <Chip
                    label={`-${v.discountPercent}%`}
                    size="small"
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.main",
                      fontWeight: 800,
                    }}
                  />
                </>
              )}
            </div>

            {/* Variants */}
            <div className="mt-6 sm:flex gap-6">
              <p className="sm:w-28 shrink-0 text-sm text-gray-500 sm:pt-2 mb-2 sm:mb-0">
                Variant
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((opt) => (
                  <Chip
                    key={opt.label}
                    label={`${opt.label} · ${peso(discountedPrice(opt))}`}
                    clickable
                    variant={variant === opt.label ? "filled" : "outlined"}
                    color={variant === opt.label ? "primary" : "default"}
                    onClick={() => {
                      setVariant(opt.label);
                      setQty(1);
                      if (opt.photoIndex != null) setPhoto(opt.photoIndex);
                    }}
                    sx={{
                      height: "auto",
                      "& .MuiChip-label": {
                        display: "block",
                        whiteSpace: "normal",
                        py: 0.75,
                      },
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6 sm:flex items-center gap-6">
              <p className="sm:w-28 shrink-0 text-sm text-gray-500 mb-2 sm:mb-0">
                Quantity
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <Button
                    variant="text"
                    onClick={() => setQty((p) => Math.max(1, p - 1))}
                    sx={{ minWidth: 36, px: 0, borderRadius: 0 }}
                  >
                    -
                  </Button>
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
                    className="w-12 text-center font-bold text-black bg-transparent outline-none text-sm"
                  />
                  <Button
                    variant="text"
                    onClick={() =>
                      setQty((p) => Math.min(v?.stock || 1, p + 1))
                    }
                    sx={{ minWidth: 36, px: 0, borderRadius: 0 }}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {v?.stock ?? 0} pieces available
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Button
                variant="outlined"
                size="large"
                onClick={add}
                disabled={!v?.stock || user?.role === "admin"}
                startIcon={
                  <svg
                    className="w-5 h-5"
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
                }
              >
                Add to cart
              </Button>
              <Button
                size="large"
                onClick={buyNow}
                disabled={!v?.stock || user?.role === "admin"}
              >
                Buy now
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden">
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab value="description" label="Description" />
            <Tab
              value="reviews"
              label={`Reviews (${product.numOfReviews || 0})`}
            />
          </Tabs>

          {tab === "description" && (
            <p className="p-6 sm:p-8 text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          )}

          {tab === "reviews" && (
            <section className="p-6 sm:p-8">
              <h2 className="font-fredoka text-2xl font-semibold text-black mb-4">
                Product Ratings
              </h2>
              <div className="bg-brand-50/40 border border-gray-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 sm:items-center">
                <div className="text-center sm:px-6">
                  <p className="text-brand-500">
                    <span className="font-fredoka text-4xl font-semibold">
                      {product.ratings}
                    </span>{" "}
                    <span className="text-lg">out of 5</span>
                  </p>
                  <p className="text-brand-500 text-xl mt-1">
                    <Rating
                      value={Number(product.ratings)}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["", `All (${reviews.length})`],
                    ...[5, 4, 3, 2, 1].map((n, i) => [
                      String(n),
                      `${n} Star (${counts[i]})`,
                    ]),
                  ].map(([k, l]) => (
                    <Chip
                      key={k}
                      label={l}
                      clickable
                      variant={starFilter === k ? "filled" : "outlined"}
                      color={starFilter === k ? "primary" : "default"}
                      onClick={() => setStarFilter(k)}
                    />
                  ))}
                </div>
              </div>

              {canReview && (
                <form
                  onSubmit={form.handleSubmit(saveReview)}
                  className="mb-8 bg-cream p-6 rounded-2xl border border-gray-200"
                >
                  <h3 className="text-base font-extrabold text-black mb-4">
                    {mine ? "Update your review" : "Write a review"}
                  </h3>

                  <div className="mb-4">
                    <label className="block text-[11px] font-extrabold tracking-widest text-gray-800 uppercase mb-2">
                      Rating
                    </label>
                    <Controller
                      name="rating"
                      control={form.control}
                      render={({ field: f }) => (
                        <Select {...f}>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <MenuItem key={n} value={n}>
                              {n} Stars
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-extrabold tracking-widest text-gray-800 uppercase mb-2">
                      Comment
                    </label>
                    <TextField
                      multiline
                      rows={3}
                      placeholder="How was the toy?"
                      {...field(form.register, "comment")}
                      error={!!form.formState.errors.comment}
                      helperText={form.formState.errors.comment?.message}
                    />
                  </div>

                  <Button type="submit">
                    {mine ? "Save changes" : "Post review"}
                  </Button>
                  {mine && (
                    <Button
                      variant="outlined"
                      onClick={removeReview}
                      sx={{ ml: 1.5 }}
                    >
                      Delete review
                    </Button>
                  )}
                </form>
              )}

              <div className="divide-y divide-gray-100">
                {shownReviews.map((r) => (
                  <div key={r._id} className="flex gap-4 py-5 first:pt-0">
                    <Avatar
                      src={r.user?.profilePhoto?.url}
                      sx={{ width: 48, height: 48 }}
                    >
                      {(r.user?.name || "?")[0].toUpperCase()}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-black">
                        {r.user?.name || "Verified Customer"}
                      </p>
                      <Rating value={r.rating} readOnly size="small" />
                      {r.createdAt && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      )}
                      <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                ))}

                {!shownReviews.length && (
                  <p className="text-gray-400 text-sm py-4 italic">
                    No reviews yet.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
