import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import { lowestPrice, peso } from "../../utils";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const PER = 10;
  const sortBy = (key) =>
    setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const load = async () => {
    const { data } = await api.get("/admin/products");
    setProducts(data.products);
    setSelected([]);
  };

  useEffect(() => {
    load();
  }, []);

  const val = (p) =>
    sort.key === "price"
      ? lowestPrice(p)
      : sort.key === "stock"
        ? p.variants.reduce((s, v) => s + v.stock, 0)
        : p[sort.key];
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (val(a) > val(b) ? 1 : -1) * sort.dir);
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PER, safePage * PER);

  const toggle = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const allIds = rows.map((p) => p._id);
  const allOn = allIds.length && allIds.every((id) => selected.includes(id));

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/product/${id}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const bulk = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} product(s)?`)) return;
    try {
      await api.post("/admin/products/bulk-delete", { ids: selected });
      toast.success("Deleted selected");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-fredoka text-3xl font-semibold text-black">
            Products
          </h2>
          <p className="text-sm text-gray-600">
            CRUD datatable with bulk delete
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-[#E3000B] hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md transition-colors"
        >
          + Add product
        </Link>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search"
            className="border border-gray-300 rounded-full px-3 py-2 text-sm"
          />
          <button
            onClick={bulk}
            disabled={!selected.length}
            className="border-2 border-[#E3000B] text-[#E3000B] hover:bg-[#E3000B] hover:text-white font-bold px-5 py-2 rounded-full text-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#E3000B]"
          >
            Delete selected ({selected.length})
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs uppercase text-gray-500">
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={!!allOn}
                    onChange={() => setSelected(allOn ? [] : allIds)}
                  />
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortBy("name")}
                >
                  Product
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortBy("category")}
                >
                  Category
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortBy("price")}
                >
                  Price
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortBy("stock")}
                >
                  Stock
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortBy("ratings")}
                >
                  Rating
                </th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={() => toggle(p._id)}
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2 font-bold text-black">
                      {p.photos?.[0]?.url && (
                        <img
                          src={p.photos[0].url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      {p.name}
                    </div>
                  </td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{peso(lowestPrice(p))}</td>
                  <td className="p-2">
                    {p.variants.reduce((s, v) => s + v.stock, 0)}
                  </td>
                  <td className="p-2">{p.ratings}</td>
                  <td className="p-2 text-right whitespace-nowrap space-x-2">
                    <Link
                      to={`/admin/products/${p._id}`}
                      className="inline-block border-2 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white font-bold px-4 py-1 rounded-full text-xs transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(p._id)}
                      className="border-2 border-[#E3000B] text-[#E3000B] hover:bg-[#E3000B] hover:text-white font-bold px-4 py-1 rounded-full text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end items-center gap-3 mt-3 text-sm">
            <button
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="px-4 py-1.5 rounded-full border-2 border-gray-300 hover:border-black font-bold text-xs transition-colors disabled:opacity-40 disabled:hover:border-gray-300"
            >
              Prev
            </button>
            <span>
              {safePage} / {pages}
            </span>
            <button
              disabled={safePage === pages}
              onClick={() => setPage(safePage + 1)}
              className="px-4 py-1.5 rounded-full border-2 border-gray-300 hover:border-black font-bold text-xs transition-colors disabled:opacity-40 disabled:hover:border-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
