import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/categories");
    setCategories(data.categories);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (cat) => {
    try {
      await api.put("/admin/category", { name: cat.name, description: cat.description });
      toast.success("Category saved");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-5">Categories</h2>
      <div className="space-y-3 max-w-3xl">
        {categories.map((c, i) => (
          <div key={c.name} className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-4">
            <p className="font-extrabold text-navy-900">{c.name}</p>
            <textarea
              value={c.description || ""}
              onChange={(e) => {
                const next = [...categories];
                next[i] = { ...c, description: e.target.value };
                setCategories(next);
              }}
              className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              rows={2}
            />
            <button
              onClick={() => save(categories[i])}
              className="mt-2 text-sm font-bold text-electric-600"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
