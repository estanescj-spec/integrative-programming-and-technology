import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const schema = yup.object({
  name: yup.string().max(30).required("Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success(data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/70 card-shadow p-8">
        <Link to="/" className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-electric-600 text-white font-black flex items-center justify-center">
            TH
          </div>
          <span className="font-bold text-navy-900 text-xl">Toy Haven</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-navy-900">Create account</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">We’ll email you a verification link.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["password", "Password", "password"],
            ["confirm", "Confirm password", "password"],
          ].map(([name, label, type = "text"]) => (
            <div key={name}>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {label}
              </label>
              <input
                type={type}
                {...register(name)}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
              )}
            </div>
          ))}
          <button
            disabled={isSubmitting}
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-electric-600/25"
          >
            {isSubmitting ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-electric-600 font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
