import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { orderTotal, peso } from "../../utils";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
} from "@mui/material";

const STATUS_COLOR = {
  pending: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
  returned: "default",
};

const NEXT = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
};
const TABS = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];
const PER = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const { data } = await api.get("/admin/orders");
    setOrders(data.orders);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const run = async (id, fn, okMsg) => {
    setBusy(id);
    try {
      await fn();
      toast.success(okMsg);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const setStatus = (o, status) => {
    if (
      status === "cancelled" &&
      !window.confirm("Cancel this order? Stock will be restored.")
    )
      return;
    run(
      o._id,
      () => api.put(`/admin/order/${o._id}`, { status }),
      "Status updated, customer emailed",
    );
  };

  const decide = (o, decision) => {
    if (
      !window.confirm(
        `${decision === "approved" ? "Approve" : "Reject"} this return?`,
      )
    )
      return;
    run(
      o._id,
      () => api.put(`/admin/order/${o._id}/return`, { decision }),
      `Return ${decision}, customer emailed`,
    );
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (tab === "all" || o.status === tab) &&
        (!term ||
          o._id.slice(-8).includes(term) ||
          o.user?.name?.toLowerCase().includes(term) ||
          o.user?.email?.toLowerCase().includes(term)),
    );
  }, [orders, tab, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PER, safePage * PER);
  const pendingReturns = orders.filter(
    (o) => o.returnRequest?.status === "requested",
  ).length;

  return (
    <div>
      {pendingReturns > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {pendingReturns} return request(s) waiting for a decision.
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto flex-1 min-w-[300px]">
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              setPage(1);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((t) => (
              <Tab
                key={t}
                value={t}
                label={t}
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Tabs>
        </div>
        <TextField
          fullWidth={false}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search order ID or customer"
          sx={{ width: 260 }}
        />
      </div>

      <TableContainer className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Return</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((o) => {
              const rr = o.returnRequest;
              return (
                <Fragment key={o._id}>
                  <TableRow sx={{ verticalAlign: "top" }}>
                    <TableCell>
                      <Button
                        variant="text"
                        size="small"
                        sx={{ fontFamily: "monospace", px: 1 }}
                        onClick={() => setOpen(open === o._id ? null : o._id)}
                      >
                        {open === o._id ? "▼" : "▶"} {o._id.slice(-8)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {o.user?.name}
                      <div className="text-xs text-gray-500">
                        {o.user?.email}
                      </div>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {peso(orderTotal(o))}
                    </TableCell>
                    <TableCell>{o.paymentMethod}</TableCell>
                    <TableCell>
                      <Chip
                        label={o.status}
                        size="small"
                        color={STATUS_COLOR[o.status]}
                        sx={{
                          textTransform: "uppercase",
                          fontSize: 11,
                          mb: 0.5,
                        }}
                      />
                      <br />
                      <Select
                        fullWidth={false}
                        value={o.status}
                        disabled={!NEXT[o.status].length || busy === o._id}
                        onChange={(e) => setStatus(o, e.target.value)}
                        sx={{ minWidth: 130, fontSize: 12 }}
                      >
                        {[o.status, ...NEXT[o.status]].map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {rr?.status === "requested" ? (
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            color="success"
                            disabled={busy === o._id}
                            onClick={() => decide(o, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            disabled={busy === o._id}
                            onClick={() => decide(o, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : rr?.status ? (
                        <span className="text-xs font-bold uppercase text-gray-600">
                          {rr.status}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {open === o._id && (
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell colSpan={7}>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[11px] font-extrabold tracking-widest uppercase text-gray-800 mb-1">
                              Items
                            </p>
                            {o.items.map((i, idx) => (
                              <p key={idx} className="text-gray-700">
                                {i.name} ({i.variant}) × {i.quantity} ·{" "}
                                {peso(i.unitPrice * i.quantity)}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold tracking-widest uppercase text-gray-800 mb-1">
                              Ship to
                            </p>
                            <p className="text-gray-700">
                              {o.shippingInfo?.address}
                            </p>
                            <p className="text-gray-700">
                              Phone: {o.shippingInfo?.phoneNo}
                            </p>
                            {rr?.reason && (
                              <p className="mt-2 text-red-500 font-semibold">
                                Return reason: {rr.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No orders found.
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
  );
}
