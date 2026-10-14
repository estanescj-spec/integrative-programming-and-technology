import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useCart } from "../context/CartContext";
import { discountedPrice, peso } from "../utils";

export default function Cart() {
  const { cart, refresh, subtotal } = useCart();
  const navigate = useNavigate();

  const update = async (item, quantity) => {
    try {
      await api.put("/cart", {
        productId: item.product._id,
        variant: item.variant,
        quantity,
      });
      await refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (item) => {
    await api.delete("/cart", {
      data: { productId: item.product._id, variant: item.variant },
    });
    await refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-6">Your cart</h1>
      {!cart.items?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-10 text-center">
          <p className="text-slate-500">Cart is empty.</p>
          <Link to="/shop" className="text-electric-600 font-bold text-sm mt-2 inline-block">
            Browse toys
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-3">
            {cart.items.map((item) => {
              const v = item.product?.variants?.find((x) => x.label === item.variant);
              return (
                <div
                  key={`${item.product?._id}-${item.variant}`}
                  className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-4 flex gap-4"
                >
                  <img
                    src={item.product?.photos?.[0]?.url}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover bg-slate-100"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-navy-900">{item.product?.name}</p>
                    <p className="text-sm text-slate-500">{item.variant}</p>
                    <p className="font-bold mt-1">{peso(discountedPrice(v))}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => update(item, Number(e.target.value))}
                        className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => remove(item)}
                        className="text-xs font-bold text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-5 h-fit">
            <p className="text-xs font-bold uppercase text-slate-400">Subtotal</p>
            <p className="text-2xl font-black text-navy-900 mt-1">{peso(subtotal)}</p>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-4 w-full bg-electric-600 text-white font-bold py-3 rounded-xl"
            >
              Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
