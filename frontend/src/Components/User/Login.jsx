import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import { signInWithGoogle } from "../../firebase";

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
});

export default function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const go = (user) => navigate(user.role === "admin" ? "/admin" : "/");

  const onSubmit = async (values) => {
    try {
      const user = await login(values.email, values.password);
      toast.success("Welcome back");
      go(user);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const google = async () => {
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/google-login", { idToken });
      setUser(data.user);
      toast.success("Signed in with Google");
      go(data.user);
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
        <h1 className="text-2xl font-extrabold text-navy-900">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {params.get("verified") ? "Email verified. You can log in now." : "Welcome back to the toy shop."}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
            <input
              {...register("email")}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-electric-600/25"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          onClick={google}
          className="mt-3 w-full border border-slate-200 font-bold py-3 rounded-xl text-sm hover:bg-slate-50"
        >
          <i className="fa-brands fa-google mr-2 text-electric-600" />
          Continue with Google
        </button>
        <p className="text-sm text-slate-500 mt-5">
          New here?{" "}
          <Link to="/register" className="text-electric-600 font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
