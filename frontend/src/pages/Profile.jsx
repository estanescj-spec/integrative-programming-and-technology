import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { fileToDataUrl } from "../utils";

const schema = yup.object({
  name: yup.string().max(30).required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().transform((v) => v || undefined).min(6, "At least 6 characters"),
  photo: yup.mixed(),
});

export default function Profile() {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, password: "" });
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = { name: values.name, email: values.email };
      if (values.password) payload.password = values.password;
      const file = values.photo?.[0];
      if (file) payload.photo = await fileToDataUrl(file);
      const { data } = await api.put("/me", payload);
      setUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-6">Your profile</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-6 space-y-4"
      >
        {user?.profilePhoto?.url && (
          <img src={user.profilePhoto.url} alt="" className="w-16 h-16 rounded-full object-cover" />
        )}
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">Name</label>
          <input {...register("name")} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5" />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">Email</label>
          <input {...register("email")} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5" />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">New password</label>
          <input
            type="password"
            {...register("password")}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">Photo</label>
          <input type="file" accept="image/*" {...register("photo")} className="mt-1 block text-sm" />
        </div>
        <button
          disabled={isSubmitting}
          className="w-full bg-electric-600 text-white font-bold py-3 rounded-xl"
        >
          Save
        </button>
      </form>
    </div>
  );
}
