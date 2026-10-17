import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { fileToDataUrl } from "../utils";

const schema = yup.object({
  name: yup.string().max(30).required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .transform((v) => v || undefined)
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Add a lowercase letter")
    .matches(/[A-Z]/, "Add an uppercase letter")
    .matches(/\d/, "Add a number")
    .matches(/[^A-Za-z0-9]/, "Add a symbol"),
  currentPassword: yup.string(),
  photo: yup
    .mixed()
    .test(
      "type",
      "Photo must be an image",
      (v) => !v?.[0] || v[0].type.startsWith("image/"),
    )
    .test(
      "size",
      "Photo must be under 5MB",
      (v) => !v?.[0] || v[0].size <= 5 * 1024 * 1024,
    ),
});

const input =
  "mt-1 w-full border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#E3000B] focus:ring-1 focus:ring-[#E3000B]";
const label =
  "text-[11px] font-extrabold tracking-widest text-gray-800 uppercase";
const err = "text-[#E3000B] text-xs mt-1";

export default function Profile() {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (user)
      reset({
        name: user.name,
        email: user.email,
        password: "",
        currentPassword: "",
      });
  }, [user, reset]);

  const photo = watch("photo");
  const preview = useMemo(
    () =>
      photo?.[0] ? URL.createObjectURL(photo[0]) : user?.profilePhoto?.url,
    [photo, user],
  );

  const onSubmit = async (values) => {
    try {
      const payload = { name: values.name, email: values.email };
      if (values.password) payload.password = values.password;
      if (values.currentPassword)
        payload.currentPassword = values.currentPassword;
      const file = values.photo?.[0];
      if (file) payload.photo = await fileToDataUrl(file);
      const { data } = await api.put("/me", payload);
      setUser(data.user);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-fredoka text-4xl font-semibold tracking-tight text-black mb-1">
        Your <span className="text-[#E3000B]">profile</span>
      </h1>
      <div className="flex mb-6 h-1.5 w-24 rounded-full overflow-hidden">
        <div className="flex-1 bg-[#1D4ED8]" />
        <div className="flex-1 bg-[#E3000B]" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-4">
          {preview ? (
            <img
              src={preview}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#E3000B] text-white text-3xl font-bold flex items-center justify-center">
              {(user?.name || "?")[0]}
            </div>
          )}
          <div>
            <p className={label}>Photo</p>
            <label className="mt-2 inline-block cursor-pointer bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-extrabold tracking-widest uppercase rounded-full px-5 py-2.5 transition-colors">
              Choose photo
              <input
                type="file"
                accept="image/*"
                {...register("photo")}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {photo?.[0]?.name || "No file chosen"}
            </p>
            {errors.photo && <p className={err}>{errors.photo.message}</p>}
          </div>
        </div>

        <div>
          <label className={label}>Name</label>
          <input {...register("name")} className={input} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={label}>Email</label>
          <input {...register("email")} className={input} />
          {errors.email && <p className={err}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={label}>Current password</label>
          <input
            type="password"
            {...register("currentPassword")}
            className={input}
            placeholder="Needed to change email or password"
          />
        </div>
        <div>
          <label className={label}>New password (optional)</label>
          <input
            type="password"
            {...register("password")}
            className={input}
            placeholder="Leave blank to keep current"
          />
          {errors.password && <p className={err}>{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full bg-[#E3000B] hover:bg-red-700 text-white font-fredoka font-semibold text-lg py-3 rounded-full shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
