import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { Button, TextField } from "@mui/material";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get("/admin/categories");
    setCategories(data.categories);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
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
      <form
        onSubmit={add}
        className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-4 mb-5 max-w-3xl flex flex-wrap gap-3"
      >
        <TextField
          required
          fullWidth={false}
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          sx={{ flex: 1, minWidth: 160 }}
        />
        <TextField
          fullWidth={false}
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          sx={{ flex: 2, minWidth: 192 }}
        />
        <Button type="submit">Add category</Button>
      </form>

      <div className="space-y-3 max-w-3xl">
        {categories.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-4"
          >
            {editing?._id === c._id ? (
              <div className="space-y-2">
                <TextField
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <TextField
                  multiline
                  rows={2}
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                />
                <div className="flex gap-2">
                  <Button size="small" onClick={save}>
                    Save
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
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
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="small"
                    variant="text"
                    sx={{ px: 1.5 }}
                    onClick={() => setEditing({ ...c })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    sx={{ px: 1.5 }}
                    onClick={() => remove(c)}
                  >
                    Delete
                  </Button>
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
