import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { orderTotal, peso } from "../utils";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    api.get(`/order/${id}`).then(({ data }) => setOrder(data.order));
  }, [id]);

  if (!order) return <p className="p-10 text-center text-slate-400">Loading...</p>;

  const ret = async () => {
    try {
      const { data } = await api.put(`/order/${id}/return`, { reason });
      setOrder(data.order);
      toast.success("Return requested");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-navy-900">Order #{order._id.slice(-8)}</h1>
      <p className="text-sm text-electric-600 font-bold uppercase mt-1">{order.status}</p>
      <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-5 mt-5 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.name} ({item.variant}) × {item.quantity}
            </span>
            <span className="font-bold">{peso(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <p className="text-right font-black text-lg">Total {peso(orderTotal(order))}</p>
        <p className="text-sm text-slate-500">
          {order.shippingInfo.address}, {order.shippingInfo.city} · {order.paymentMethod}
        </p>
      </div>
      {order.status === "delivered" && !order.returnRequest?.status && (
        <div className="mt-5 bg-white rounded-2xl border border-slate-200/70 p-5">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Return reason"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
          <button onClick={ret} className="mt-2 bg-navy-900 text-white font-bold px-4 py-2 rounded-xl text-sm">
            Request return
          </button>
        </div>
      )}
    </div>
  );
}
