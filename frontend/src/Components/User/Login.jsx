import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import { signInWithGoogle } from "../../firebase";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

const input =
  "mt-1 w-full border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#E3000B] focus:ring-1 focus:ring-[#E3000B]";
const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";

export default function Login() {
  const { login, setUser } = useAuth();
  const [unverified, setUnverified] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [show, setShow] = useState(false);
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
      if (err.message.toLowerCase().includes("verify"))
        setUnverified(values.email);
    }
  };

  const resend = async () => {
    try {
      const { data } = await api.post("/resend-verification", {
        email: unverified,
      });
      toast.success(data.message);
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
    <div className="min-h-screen bg-white text-gray-900 font-body flex items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-md bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden flex flex-col">
        <section className="w-full p-8 sm:p-10 flex flex-col">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 border-2 border-gray-200 hover:border-black text-gray-800 text-xs font-extrabold tracking-widest uppercase rounded-full px-4 py-2 transition-colors"
            >
              ← Back to home
            </Link>
            <Link
              to="/"
              className="font-fredoka text-xl font-bold uppercase tracking-tight text-black"
            >
              Toy Haven
            </Link>
          </div>

          <div className="py-8 w-full">
            <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black">
              Welcome <span className="text-[#E3000B]">back</span>
            </h1>
            <div className="flex my-3 h-1.5 w-24 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#1D4ED8]" />
              <div className="flex-1 bg-[#E3000B]" />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-6">
              {params.get("verified") === "true"
                ? "Email verified. You can log in now."
                : params.get("verified") === "false"
                  ? "That link is invalid or expired. Log in to get a new one."
                  : "Log in to continue shopping."}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={label}>Email</label>
                <input
                  {...register("email")}
                  className={input}
                  placeholder="you@email.com"
                />
                {errors.email && (
                  <p className="text-[#E3000B] text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className={label}>Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    {...register("password")}
                    className={`${input} pr-16`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-black"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#E3000B] text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-[#E3000B] hover:bg-red-700 text-white font-fredoka font-semibold text-lg py-3 rounded-full shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            {unverified && (
              <button
                type="button"
                onClick={resend}
                className="mt-3 w-full text-sm font-bold text-[#E3000B] hover:underline"
              >
                Resend verification link
              </button>
            )}

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-bold absolute">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={google}
              className="w-full py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-bold rounded-full flex items-center justify-center gap-3 text-sm transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Login with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Need an account?{" "}
              <Link
                to="/register"
                className="text-[#E3000B] font-bold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center lg:text-left">
            &copy; {new Date().getFullYear()} Toy Haven. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
