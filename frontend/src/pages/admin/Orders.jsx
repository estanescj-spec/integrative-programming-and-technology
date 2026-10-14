import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { orderTotal, peso } from "../../utils";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/orders");
    setOrders(data.orders);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    try {
      await api.put(`/admin/order/${id}`, { status });
      toast.success("Status updated — customer emailed");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-5">Orders</h2>
      <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="p-3">
                  {o.user?.name}
                  <div className="text-xs text-slate-400">{o.user?.email}</div>
                </td>
                <td className="p-3 font-bold">{peso(orderTotal(o))}</td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) => update(o._id, e.target.value)}
                    className="border border-slate-200 rounded-xl px-2 py-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
