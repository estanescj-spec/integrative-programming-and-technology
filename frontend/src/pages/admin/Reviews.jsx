import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import {
  Button,
  MenuItem,
  Pagination,
  Rating,
  Select,
  TextField,
} from "@mui/material";

const PER = 10;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const { data } = await api.get("/admin/reviews");
    setReviews(data.reviews);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.user?.name || "this"}'s review?`)) return;
    setBusy(r._id);
    try {
      await api.delete(`/admin/review/${r._id}`);
      toast.success("Review deleted");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        (!rating || r.rating === Number(rating)) &&
        (!term ||
          r.product?.name?.toLowerCase().includes(term) ||
          r.user?.name?.toLowerCase().includes(term) ||
          r.comment?.toLowerCase().includes(term)),
    );
  }, [reviews, q, rating]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PER, safePage * PER);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <TextField
          fullWidth={false}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search product, customer, or comment"
          sx={{ width: 300 }}
        />
        <Select
          displayEmpty
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All ratings</MenuItem>
          {[5, 4, 3, 2, 1].map((n) => (
            <MenuItem key={n} value={String(n)}>
              {n} stars
            </MenuItem>
          ))}
        </Select>
        <span className="text-sm text-gray-600 font-semibold">
          {filtered.length} review(s)
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r._id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <p className="font-fredoka text-lg font-semibold text-black">
                  {r.product?.name || "Deleted product"}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                  <span>
                    {r.user?.name || "Unknown"}{" "}
                    <span className="text-gray-400">({r.user?.email})</span>
                  </span>
                  <Rating value={r.rating} readOnly size="small" />
                  <span>· {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-800 mt-2 break-words">
                  {r.comment}
                </p>
              </div>
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={() => remove(r)}
                disabled={busy === r._id}
                sx={{ alignSelf: "flex-start", flexShrink: 0 }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {!rows.length && (
          <p className="text-gray-500 text-center py-8">No reviews found.</p>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <Pagination
          count={pages}
          page={safePage}
          onChange={(_, n) => setPage(n)}
        />
      </div>
    </div>
  );
}
