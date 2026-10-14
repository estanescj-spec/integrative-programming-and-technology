import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import { lowestPrice, peso } from "../../utils";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await api.get("/admin/products");
    setProducts(data.products);
    setSelected([]);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const allIds = filtered.map((p) => p._id);
  const allOn = allIds.length && allIds.every((id) => selected.includes(id));

  const remove = async (id) => {
    await api.delete(`/admin/product/${id}`);
    toast.success("Deleted");
    load();
  };

  const bulk = async () => {
    if (!selected.length) return;
    await api.post("/admin/products/bulk-delete", { ids: selected });
    toast.success("Deleted selected");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Products</h2>
          <p className="text-sm text-slate-500">CRUD datatable with bulk delete</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-electric-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
        >
          Add product
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={bulk}
            disabled={!selected.length}
            className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-40"
          >
            Delete selected ({selected.length})
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={!!allOn}
                    onChange={() => setSelected(allOn ? [] : allIds)}
                  />
                </th>
                <th className="p-2">Product</th>
                <th className="p-2">Category</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Rating</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={() => toggle(p._id)}
                    />
                  </td>
                  <td className="p-2 font-bold text-navy-900 flex items-center gap-2">
                    {p.photos?.[0]?.url && (
                      <img src={p.photos[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    {p.name}
                  </td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{peso(lowestPrice(p))}</td>
                  <td className="p-2">{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
                  <td className="p-2">{p.ratings}</td>
                  <td className="p-2 text-right space-x-2">
                    <Link to={`/admin/products/${p._id}`} className="text-electric-600 font-bold">
                      Edit
                    </Link>
                    <button onClick={() => remove(p._id)} className="text-red-500 font-bold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
