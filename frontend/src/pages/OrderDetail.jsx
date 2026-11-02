import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { orderTotal, peso } from "../utils";
import {
  Alert,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from "@mui/material";

const STEPS = ["pending", "processing", "shipped", "delivered"];
const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";
const card = "bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState(false);
  const [ship, setShip] = useState({ address: "", phoneNo: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/order/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setFailed(true));
  }, [id]);

  if (failed)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600 font-semibold">Order not found.</p>
        <Button component={Link} to="/orders" variant="text">
          Back to orders
        </Button>
      </div>
    );
  if (!order)
    return (
      <div className="p-10 flex justify-center">
        <CircularProgress size={28} />
      </div>
    );

  const act = async (fn, msg) => {
    setBusy(true);
    try {
      const { data } = await fn();
      setOrder(data.order);
      toast.success(msg);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    if (!window.confirm("Cancel this order?")) return;
    act(() => api.put(`/order/${id}/cancel`), "Order cancelled");
  };

  const startEdit = () => {
    setShip({
      address: order.shippingInfo?.address || "",
      phoneNo: order.shippingInfo?.phoneNo || "",
    });
    setEditing(true);
  };

  const saveShip = async () => {
    if (
      await act(
        () => api.put(`/order/${id}/shipping`, ship),
        "Shipping updated",
      )
    )
      setEditing(false);
  };

  const requestReturn = () => {
    if (reason.trim().length < 5)
      return toast.error("Please explain the reason (at least 5 characters)");
    act(() => api.put(`/order/${id}/return`, { reason }), "Return requested");
  };

  const step = STEPS.indexOf(order.status);
  const rr = order.returnRequest;
  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <Button
          component={Link}
          to="/orders"
          variant="text"
          color="inherit"
          sx={{ px: 0 }}
        >
          ← Back to orders
        </Button>
        <h1 className="font-fredoka text-2xl font-semibold tracking-tight text-black">
          Order #{order._id.slice(-8)}
        </h1>
      </div>
      <p className="text-sm text-gray-600 mt-1 mb-5">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      {step >= 0 ? (
        <div className={`${card} mb-5`}>
          <Stepper
            alternativeLabel
            activeStep={step === STEPS.length - 1 ? STEPS.length : step}
          >
            {STEPS.map((s) => (
              <Step key={s}>
                <StepLabel sx={{ textTransform: "capitalize" }}>{s}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, textTransform: "capitalize" }}>
          This order is {order.status}.
        </Alert>
      )}

      <div className={`${card} space-y-3`}>
        <p className={label}>Items</p>
        {order.items.map((item, i) => {
          const p = item.product || null;
          const v = p?.variants?.find((x) => x.label === item.variant);
          const img =
            p?.photos?.[v?.photoIndex ?? 0]?.url || p?.photos?.[0]?.url;
          const linkable = p && !p.isDeleted;

          const row = (
            <>
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-cream border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white flex-shrink-0" />
              )}
              <span className="flex-1 text-sm">
                {item.name} ({item.variant}) × {item.quantity}
              </span>
              <span className="font-bold text-sm">
                {peso(item.unitPrice * item.quantity)}
              </span>
            </>
          );

          return linkable ? (
            <Link
              key={i}
              to={`/product/${p._id}`}
              className="flex items-center gap-3 rounded-xl p-1 -m-1 hover:bg-cream transition-colors"
            >
              {row}
            </Link>
          ) : (
            <div key={i} className="flex items-center gap-3">
              {row}
            </div>
          );
        })}
        <p className="text-right font-fredoka text-xl font-semibold border-t border-gray-100 pt-3">
          Total {peso(orderTotal(order))}
        </p>
      </div>

      <div className={`${card} mt-5`}>
        <div className="flex items-center justify-between mb-2">
          <p className={label}>Shipping</p>
          {order.status === "pending" && !editing && (
            <Button size="small" variant="text" onClick={startEdit}>
              Edit
            </Button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className={label}>Address</label>
              <TextField
                value={ship.address}
                onChange={(e) => setShip({ ...ship, address: e.target.value })}
                sx={{ mt: 0.5 }}
              />
            </div>
            <div>
              <label className={label}>Phone number</label>
              <TextField
                value={ship.phoneNo}
                onChange={(e) => setShip({ ...ship, phoneNo: e.target.value })}
                sx={{ mt: 0.5 }}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveShip} disabled={busy}>
                Save
              </Button>
              <Button variant="outlined" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            {order.shippingInfo?.address} · {order.shippingInfo?.phoneNo} ·{" "}
            {order.paymentMethod}
          </p>
        )}
      </div>

      {canCancel && (
        <Button
          variant="outlined"
          onClick={cancel}
          disabled={busy}
          sx={{ mt: 2.5 }}
        >
          Cancel order
        </Button>
      )}

      {order.status === "delivered" && !rr?.status && (
        <div className={`${card} mt-5`}>
          <p className={label}>Request a return</p>
          <TextField
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you want to return this order?"
            sx={{ mt: 1 }}
          />
          <Button onClick={requestReturn} disabled={busy} sx={{ mt: 1.5 }}>
            Request return
          </Button>
        </div>
      )}

      {rr?.status && (
        <div className={`${card} mt-5`}>
          <p className={label}>Return</p>
          <p className="text-sm font-bold mt-1">
            {rr.status === "requested" &&
              "Return requested. Waiting for approval."}
            {rr.status === "approved" && "Return approved."}
            {rr.status === "rejected" && "Return rejected."}
          </p>
          {rr.reason && (
            <p className="text-sm text-gray-600 mt-1">Reason: {rr.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
