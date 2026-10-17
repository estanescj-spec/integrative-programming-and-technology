import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const schema = yup.object({
  name: yup.string().max(30).required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Add a lowercase letter")
    .matches(/[A-Z]/, "Add an uppercase letter")
    .matches(/\d/, "Add a number")
    .matches(/[^A-Za-z0-9]/, "Add a symbol")
    .required("Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const input =
  "mt-1 w-full border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#E3000B] focus:ring-1 focus:ring-[#E3000B]";
const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";
const err = "text-[#E3000B] text-xs mt-1";

function PasswordField({ name, text, placeholder, register, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={label}>{text}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          {...register(name)}
          placeholder={placeholder}
          className={`${input} pr-16`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-black"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className={err}>{error.message}</p>}
    </div>
  );
}

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
      toast.success(data.message || "Registration successful!");
      navigate("/login");
    } catch (e) {
      toast.error(e.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body flex items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-md bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden">
        <section className="p-8 sm:p-10">
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

          <div className="py-8">
            <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black">
              Create <span className="text-[#E3000B]">account</span>
            </h1>
            <div className="flex my-3 h-1.5 w-24 rounded-full overflow-hidden">
              <div className="flex-1 bg-[#1D4ED8]" />
              <div className="flex-1 bg-[#E3000B]" />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-6">
              We’ll email you a verification link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={label}>Name</label>
                <input
                  {...register("name")}
                  className={input}
                  placeholder="Your name"
                />
                {errors.name && <p className={err}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={label}>Email</label>
                <input
                  {...register("email")}
                  className={input}
                  placeholder="you@email.com"
                />
                {errors.email && <p className={err}>{errors.email.message}</p>}
              </div>
              <PasswordField
                name="password"
                text="Password"
                placeholder="Password"
                register={register}
                error={errors.password}
              />
              <PasswordField
                name="confirm"
                text="Confirm password"
                placeholder="Confirm password"
                register={register}
                error={errors.confirm}
              />

              <button
                disabled={isSubmitting}
                className="w-full bg-[#E3000B] hover:bg-red-700 text-white font-fredoka font-semibold text-lg py-3 rounded-full shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60 mt-2"
              >
                {isSubmitting ? "Creating..." : "Register"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#E3000B] font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Toy Haven. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
