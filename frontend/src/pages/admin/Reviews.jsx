import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { stars } from "../../utils";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/reviews");
    setReviews(data.reviews);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await api.delete(`/admin/review/${id}`);
    toast.success("Review deleted");
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-5">Reviews</h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold text-navy-900">{r.product?.name}</p>
                <p className="text-sm text-slate-500">
                  {r.user?.name} · {stars(r.rating)}
                </p>
                <p className="text-sm mt-1">{r.comment}</p>
              </div>
              <button onClick={() => remove(r._id)} className="text-red-500 font-bold text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="text-slate-400">No reviews.</p>}
      </div>
    </div>
  );
}
