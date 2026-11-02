import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { orderTotal, peso } from "../utils";
import {
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const STATUS_COLOR = {
  pending: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
  returned: "default",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

const matchTab = (o, tab) => tab === "all" || o.status === tab;

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const shown = orders
    ?.filter((o) => matchTab(o, tab))
    .filter((o) => {
      const s = q.trim().toLowerCase();
      return (
        !s ||
        o._id.toLowerCase().includes(s) ||
        o.items.some((it) => (it.name || "").toLowerCase().includes(s))
      );
    });

  useEffect(() => {
    api
      .get("/orders/me")
      .then(({ data }) => setOrders(data.orders))
      .catch((err) => {
        toast.error(err.message);
        setOrders([]);
      });
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-x-auto">
        <div className="min-w-[640px]">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": { minHeight: 56, minWidth: 0, fontSize: 15 },
            }}
          >
            {TABS.map((t) => (
              <Tab key={t.key} value={t.key} label={t.label} />
            ))}
          </Tabs>
        </div>
      </div>

      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by Order ID or Product name"
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {orders === null && <CircularProgress size={24} />}

      <div className="space-y-4">
        {shown?.map((o) => (
          <div
            key={o._id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
              <div>
                <p className="font-fredoka text-lg font-semibold text-black">
                  #{o._id.slice(-8)}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Chip
                  label={o.status}
                  size="small"
                  color={STATUS_COLOR[o.status]}
                  sx={{ textTransform: "uppercase", fontSize: 11 }}
                />
                {o.returnRequest?.status === "requested" && (
                  <p className="text-[11px] font-bold text-red-500 mt-1">
                    Return requested
                  </p>
                )}
              </div>
            </div>

            {o.items.map((it, i) => {
              const p = it.product || null;
              const v = p?.variants?.find((x) => x.label === it.variant);
              const img =
                p?.photos?.[v?.photoIndex ?? 0]?.url || p?.photos?.[0]?.url;
              return (
                <Link
                  key={i}
                  to={`/orders/${o._id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-cream transition-colors"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover bg-cream border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black line-clamp-1">
                      {it.name}
                    </p>
                    {it.variant && (
                      <p className="text-xs text-gray-600">{it.variant}</p>
                    )}
                    <p className="text-xs text-gray-600">x{it.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-black">
                    {peso(it.unitPrice)}
                  </p>
                </Link>
              );
            })}

            <div className="flex items-center justify-end px-5 py-4 bg-cream border-t border-gray-100">
              <p className="text-sm text-gray-700">
                Order Total:{" "}
                <span className="font-fredoka text-2xl font-semibold text-brand-500 ml-1">
                  {peso(orderTotal(o))}
                </span>
              </p>
            </div>
          </div>
        ))}

        {shown && !shown.length && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-10 text-center">
            <p className="text-gray-600 font-semibold">No orders found.</p>
            <Button component={Link} to="/shop" sx={{ mt: 2 }}>
              Browse toys
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
