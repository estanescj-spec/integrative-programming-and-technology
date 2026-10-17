import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

const input =
  "border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#E3000B] focus:ring-1 focus:ring-[#E3000B]";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get("/admin/categories");
    setCategories(data.categories);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/category", form);
      toast.success("Category added");
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const save = async () => {
    try {
      await api.put(`/admin/category/${editing._id}`, {
        name: editing.name,
        description: editing.description,
      });
      toast.success("Category updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    if (
      !window.confirm(
        `Delete "${c.name}"? Existing products keep this category.`,
      )
    )
      return;
    try {
      await api.delete(`/admin/category/${c._id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="font-fredoka text-3xl font-semibold text-black tracking-tight mb-1">
        Categories
      </h2>
      <div className="flex mb-5 h-1.5 w-24 rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1D4ED8]" />
        <div className="flex-1 bg-[#E3000B]" />
      </div>

      <form
        onSubmit={add}
        className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-4 mb-5 max-w-3xl flex flex-wrap gap-3"
      >
        <input
          required
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${input} flex-1 min-w-40`}
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${input} flex-[2] min-w-48`}
        />
        <button className="bg-[#E3000B] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md">
          Add category
        </button>
      </form>

      <div className="space-y-3 max-w-3xl">
        {categories.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-4"
          >
            {editing?._id === c._id ? (
              <div className="space-y-2">
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className={`${input} w-full`}
                />
                <textarea
                  rows={2}
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E3000B]"
                />
                <div className="space-x-4 text-sm font-bold">
                  <button onClick={save} className="text-[#1D4ED8]">
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-extrabold text-black">
                    {c.name}{" "}
                    <span className="text-xs font-semibold text-gray-500">
                      ({c.productCount} products)
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {c.description || "No description"}
                  </p>
                </div>
                <div className="space-x-4 text-sm font-bold shrink-0">
                  <button
                    onClick={() => setEditing({ ...c })}
                    className="text-[#1D4ED8]"
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(c)} className="text-[#E3000B]">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!categories.length && (
          <p className="text-gray-500">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
