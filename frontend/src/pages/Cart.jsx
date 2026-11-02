import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useCart } from "../hooks";
import { discountedPrice, peso, variantOf } from "../utils";
import { Alert, Button, Checkbox, FormControlLabel } from "@mui/material";

export default function Cart() {
  const {
    cart,
    refresh,
    keyOf,
    toggle,
    deselected,
    setDeselected,
    selectedItems,
    selectedSubtotal,
  } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];
  const available = items.filter((i) => variantOf(i));
  const allSelected =
    available.length > 0 &&
    available.every((i) => !deselected.includes(keyOf(i)));
  const blocked = selectedItems.some((i) => variantOf(i).stock < i.quantity);

  const selectAll = () =>
    setDeselected(allSelected ? available.map((i) => keyOf(i)) : []);

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
    try {
      await api.delete("/cart", {
        data: { productId: item.product?._id, variant: item.variant },
      });
      await refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black mb-1">
        Your <span className="text-brand-500">cart</span>
      </h1>
      <div className="flex mb-6 h-1.5 w-24 rounded-full overflow-hidden">
        <div className="flex-1 bg-ink" />
        <div className="flex-1 bg-brand-500" />
      </div>

      {!items.length ? (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-10 text-center">
          <p className="text-gray-600 font-semibold">Your cart is empty.</p>
          <Button component={Link} to="/shop" sx={{ mt: 2 }}>
            Browse toys
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-3">
            <FormControlLabel
              label={`Select all (${selectedItems.length} of ${available.length} selected)`}
              control={<Checkbox checked={allSelected} onChange={selectAll} />}
            />

            {items.map((item) => {
              const v = variantOf(item);
              const key = keyOf(item);

              if (!v) {
                return (
                  <Alert
                    key={key}
                    severity="warning"
                    action={
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => remove(item)}
                      >
                        Remove
                      </Button>
                    }
                  >
                    <strong>{item.product?.name || "Removed product"}</strong>{" "}
                    is no longer available.
                  </Alert>
                );
              }

              const price = discountedPrice(v);
              const over = v.stock < item.quantity;
              const checked = !deselected.includes(key);
              return (
                <div
                  key={key}
                  className={`bg-white rounded-2xl border-2 shadow-md p-4 flex gap-4 items-start transition-colors ${
                    checked ? "border-gray-200" : "border-gray-100 opacity-70"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(key)}
                    sx={{ mt: 3.5, p: 0.5 }}
                  />
                  <img
                    src={item.product.photos?.[0]?.url}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover bg-white"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="font-fredoka font-semibold text-lg text-black hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-600">{item.variant}</p>
                    <p className="font-bold mt-1">
                      {peso(price)}
                      {v.discountPercent > 0 && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          {peso(v.price)}
                        </span>
                      )}
                    </p>
                    {over && (
                      <p className="text-xs font-bold text-red-500 mt-1">
                        {v.stock
                          ? `Only ${v.stock} left. Lower the quantity.`
                          : "Out of stock. Remove this item."}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                        <Button
                          variant="text"
                          onClick={() => update(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          sx={{ minWidth: 32, px: 0, borderRadius: 0 }}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="text"
                          onClick={() => update(item, item.quantity + 1)}
                          disabled={item.quantity >= v.stock}
                          sx={{ minWidth: 32, px: 0, borderRadius: 0 }}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        onClick={() => remove(item)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="font-fredoka text-lg font-semibold text-black whitespace-nowrap">
                    {peso(price * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          <aside className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5 h-fit">
            <p className="text-[11px] font-extrabold tracking-widest text-gray-800 uppercase">
              Subtotal ({selectedItems.length} selected)
            </p>
            <p className="font-fredoka text-3xl font-semibold text-black mt-1">
              {peso(selectedSubtotal)}
            </p>
            {blocked && (
              <p className="text-xs font-bold text-brand-500 mt-2">
                Fix the highlighted items to continue.
              </p>
            )}
            {!selectedItems.length && (
              <p className="text-xs font-bold text-gray-500 mt-2">
                Tick the items you want to buy.
              </p>
            )}
            <Button
              fullWidth
              size="large"
              onClick={() => navigate("/checkout")}
              disabled={blocked || !selectedItems.length}
              sx={{ mt: 2 }}
            >
              Checkout ({selectedItems.length})
            </Button>
            <Button
              component={Link}
              to="/shop"
              variant="text"
              fullWidth
              sx={{ mt: 1 }}
            >
              Continue shopping
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
