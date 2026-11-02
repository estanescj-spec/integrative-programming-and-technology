import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import { lowestPrice, peso } from "../../utils";
import {
  Avatar,
  Button,
  Checkbox,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";

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
    load().catch((err) => toast.error(err.message));
  }, []);

  const val = (p) =>
    sort.key === "categories"
      ? (p.categories || []).join(", ")
      : sort.key === "price"
        ? lowestPrice(p)
        : sort.key === "stock"
          ? p.variants.reduce((s, v) => s + v.stock, 0)
          : p[sort.key];
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * sort.dir;
    });
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
      <div className="flex justify-end mb-5">
        <Button component={Link} to="/admin/products/new">
          + Add product
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <TextField
            fullWidth={false}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search"
            sx={{ width: 260 }}
          />
          <Button
            color="error"
            onClick={bulk}
            disabled={!selected.length}
          >
            Delete selected ({selected.length})
          </Button>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={!!allOn}
                    indeterminate={!allOn && selected.length > 0}
                    onChange={() => setSelected(allOn ? [] : allIds)}
                  />
                </TableCell>
                {[
                  ["name", "Product"],
                  ["categories", "Categories"],
                  ["price", "Price"],
                  ["stock", "Stock"],
                  ["ratings", "Rating"],
                ].map(([k, l]) => (
                  <TableCell key={k}>
                    <TableSortLabel
                      active={sort.key === k}
                      direction={sort.dir === 1 ? "asc" : "desc"}
                      onClick={() => sortBy(k)}
                    >
                      {l}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.includes(p._id)}
                      onChange={() => toggle(p._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-bold text-black">
                      <Avatar
                        variant="rounded"
                        src={p.photos?.[0]?.url}
                        sx={{ width: 40, height: 40 }}
                      />
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell>{(p.categories || []).join(", ")}</TableCell>
                  <TableCell>{peso(lowestPrice(p))}</TableCell>
                  <TableCell>
                    {p.variants.reduce((s, v) => s + v.stock, 0)}
                  </TableCell>
                  <TableCell>{p.ratings}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Button
                      component={Link}
                      to={`/admin/products/${p._id}`}
                      size="small"
                      variant="outlined"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => remove(p._id)}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="flex justify-end mt-3">
          <Pagination
            count={pages}
            page={safePage}
            onChange={(_, n) => setPage(n)}
          />
        </div>
      </div>
    </div>
  );
}
