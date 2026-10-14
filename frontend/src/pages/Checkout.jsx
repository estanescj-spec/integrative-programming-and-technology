import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../api";
import { useCart } from "../context/CartContext";
import { peso } from "../utils";

const schema = yup.object({
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  phoneNo: yup.string().required("Phone is required"),
  postalCode: yup.string().required("Postal code is required"),
  country: yup.string().required("Country is required"),
  paymentMethod: yup.string().required(),
});

export default function Checkout() {
  const { subtotal, refresh, cart } = useCart();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { country: "Philippines", paymentMethod: "Cash on Delivery" },
  });

  const onSubmit = async (values) => {
    try {
      const { paymentMethod, ...shippingInfo } = values;
      const { data } = await api.post("/order", { shippingInfo, paymentMethod });
      await refresh();
      toast.success("Order placed");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!cart.items?.length) {
    return <p className="p-10 text-center text-slate-500">Your cart is empty.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-6">Checkout</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-6 space-y-4"
      >
        {["address", "city", "phoneNo", "postalCode", "country"].map((name) => (
          <div key={name}>
            <label className="text-xs font-bold uppercase text-slate-400">{name}</label>
            <input
              {...register(name)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            />
            {errors[name] && <p className="text-red-500 text-xs">{errors[name].message}</p>}
          </div>
        ))}
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">Payment</label>
          <select
            {...register("paymentMethod")}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          >
            <option>Cash on Delivery</option>
            <option>Card</option>
            <option>GCash</option>
          </select>
        </div>
        <p className="text-lg font-black">Total {peso(subtotal)}</p>
        <button
          disabled={isSubmitting}
          className="w-full bg-electric-600 text-white font-bold py-3 rounded-xl"
        >
          Place order
        </button>
      </form>
    </div>
  );
}
