import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../api";
import { useCart } from "../hooks";
import { discountedPrice, peso, variantOf } from "../utils";
import { Controller, useForm } from "react-hook-form";
import { Button, MenuItem, Select, TextField } from "@mui/material";

const field = (register, name) => {
  const { ref, ...rest } = register(name);
  return { ...rest, inputRef: ref };
};

const schema = yup.object({
  address: yup.string().trim().required("Address is required"),
  phoneNo: yup
    .string()
    .matches(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .required("Phone is required"),
  paymentMethod: yup.string(),
});

const fields = [
  ["address", "Address"],
  ["phoneNo", "Phone number"],
];

const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";

export default function Checkout() {
  const { refresh, selectedItems, selectedSubtotal } = useCart();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { paymentMethod: "Cash on Delivery" },
  });

  const onSubmit = async (values) => {
    try {
      const { paymentMethod, ...shippingInfo } = values;
      const items = selectedItems.map((i) => ({
        productId: i.product._id,
        variant: i.variant,
      }));
      const { data } = await api.post("/order", {
        shippingInfo,
        paymentMethod,
        items,
      });
      await refresh();
      toast.success("Order placed");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!selectedItems.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-semibold">
          No items selected for checkout.
        </p>
        <Button component={Link} to="/cart" sx={{ mt: 2 }}>
          Back to cart
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black mb-1">
        <span className="text-brand-500">Check</span>out
      </h1>
      <div className="flex mb-6 h-1.5 w-24 rounded-full overflow-hidden">
        <div className="flex-1 bg-ink" />
        <div className="flex-1 bg-brand-500" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4"
        >
          {fields.map(([name, text]) => (
            <div key={name}>
              <label className={label}>{text}</label>
              <TextField
                {...field(register, name)}
                error={!!errors[name]}
                helperText={errors[name]?.message}
                sx={{ mt: 0.5 }}
              />
            </div>
          ))}
          <div>
            <label className={label}>Payment</label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field: f }) => (
                <Select {...f} fullWidth sx={{ mt: 0.5 }}>
                  <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                  <MenuItem value="GCash">GCash</MenuItem>
                </Select>
              )}
            />
          </div>
          <Button type="submit" fullWidth size="large" disabled={isSubmitting}>
            {isSubmitting
              ? "Placing order..."
              : `Place order · ${peso(selectedSubtotal)}`}
          </Button>
          <Button component={Link} to="/cart" sx={{ mt: 2 }}>
            Back to cart
          </Button>
        </form>

        <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-fit">
          <p className={label}>Order summary</p>
          <div className="divide-y divide-gray-100 mt-2">
            {selectedItems.map((i) => {
              const v = variantOf(i);
              return (
                <div
                  key={`${i.product._id}-${i.variant}`}
                  className="py-2 flex justify-between gap-3 text-sm"
                >
                  <span className="text-gray-700">
                    {i.product.name}{" "}
                    <span className="text-gray-500">
                      ({i.variant}) × {i.quantity}
                    </span>
                  </span>
                  <span className="font-bold whitespace-nowrap">
                    {peso(discountedPrice(v) * i.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="font-fredoka text-2xl font-semibold text-black mt-3">
            Total {peso(selectedSubtotal)}
          </p>
        </aside>
      </div>
    </div>
  );
}
