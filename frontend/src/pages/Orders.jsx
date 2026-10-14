import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { orderTotal, peso } from "../utils";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/me").then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-6">Your orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/orders/${o._id}`}
            className="block bg-white rounded-2xl border border-slate-200/70 card-shadow p-5 hover:border-slate-300"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold text-navy-900">#{o._id.slice(-8)}</p>
                <p className="text-sm text-slate-500">
                  {new Date(o.createdAt).toLocaleString()} · {o.items.length} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-black">{peso(orderTotal(o))}</p>
                <span className="text-xs font-bold uppercase text-electric-600">{o.status}</span>
              </div>
            </div>
          </Link>
        ))}
        {!orders.length && <p className="text-slate-400">No orders yet.</p>}
      </div>
    </div>
  );
}
