import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import { Button, InputAdornment, TextField } from "@mui/material";

const field = (register, name) => {
  const { ref, ...rest } = register(name);
  return { ...rest, inputRef: ref };
};

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

const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";

function PasswordField({ name, text, placeholder, register, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={label}>{text}</label>
      <TextField
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...field(register, name)}
        error={!!error}
        helperText={error?.message}
        sx={{ mt: 0.5 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShow((s) => !s)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    minWidth: 0,
                    color: "text.secondary",
                  }}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />
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
    <div className="relative overflow-hidden min-h-screen bg-white text-gray-900 flex items-center justify-center p-4 sm:p-6">
      <img
        src="/minecraft.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -left-16 bottom-0 w-[420px] lg:w-[560px] opacity-20"
      />
      <img
        src="/spiderman.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-10 top-0 w-[260px] lg:w-[380px] opacity-20"
      />
      <main className="w-full max-w-md bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden">
        <section className="p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <Button component={Link} to="/" variant="outlined" size="small">
              ← Back to home
            </Button>
            <Link
              to="/"
              className="font-fredoka text-xl font-bold uppercase tracking-tight text-black"
            >
              Toy Haven
            </Link>
          </div>

          <div className="py-8">
            <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black">
              Create <span className="text-brand-500">account</span>
            </h1>
            <div className="flex my-3 h-1.5 w-24 rounded-full overflow-hidden">
              <div className="flex-1 bg-ink" />
              <div className="flex-1 bg-brand-500" />
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-6">
              We’ll email you a verification link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={label}>Name</label>
                <TextField
                  placeholder="Your name"
                  {...field(register, "name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mt: 0.5 }}
                />
              </div>
              <div>
                <label className={label}>Email</label>
                <TextField
                  placeholder="you@email.com"
                  {...field(register, "email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mt: 0.5 }}
                />
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

              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 1 }}
              >
                {isSubmitting ? "Creating..." : "Register"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-500 font-bold hover:underline"
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
