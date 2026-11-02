import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../hooks";
import { fileToDataUrl } from "../utils";
import { Avatar, Button, TextField } from "@mui/material";

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

const label = "sm:w-40 sm:text-right text-sm text-gray-600 shrink-0 sm:pt-2.5";
const err = "text-red-500 text-xs mt-1";

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
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    if (!photo?.[0]) {
      setBlobUrl(null);
      return;
    }
    const u = URL.createObjectURL(photo[0]);
    setBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photo]);
  const preview = blobUrl || user?.profilePhoto?.url;

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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-6 sm:p-8">
      <h1 className="font-fredoka text-2xl font-semibold text-black">
        My Profile
      </h1>
      <p className="text-sm text-gray-600">Manage and protect your account</p>
      <div className="border-t border-gray-200 my-5" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col-reverse md:flex-row gap-8"
      >
        <div className="flex-1 space-y-5">
          <div className="sm:flex sm:gap-4">
            <label className={label}>Name</label>
            <div className="flex-1">
              <TextField
                {...field(register, "name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </div>
          </div>

          <div className="sm:flex sm:gap-4">
            <label className={label}>Email</label>
            <div className="flex-1">
              <TextField
                {...field(register, "email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </div>
          </div>

          <div className="sm:flex sm:gap-4">
            <label className={label}>Current password</label>
            <div className="flex-1">
              <TextField
                type="password"
                placeholder="Needed to change email or password"
                {...field(register, "currentPassword")}
              />
            </div>
          </div>

          <div className="sm:flex sm:gap-4">
            <label className={label}>New password</label>
            <div className="flex-1">
              <TextField
                type="password"
                placeholder="Leave blank to keep current"
                {...field(register, "password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </div>
          </div>

          <div className="sm:flex sm:gap-4">
            <div className="sm:w-40 shrink-0" />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="md:w-64 md:border-l md:border-gray-200 md:pl-8 flex flex-col items-center justify-center">
          <Avatar
            src={preview}
            sx={{
              width: 112,
              height: 112,
              bgcolor: "primary.main",
              fontSize: 40,
            }}
          >
            {(user?.name || "?")[0].toUpperCase()}
          </Avatar>
          <Button component="label" variant="outlined" sx={{ mt: 2 }}>
            Select Image
            <input type="file" accept="image/*" hidden {...register("photo")} />
          </Button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            {photo?.[0]?.name || "File size: maximum 5 MB"}
          </p>
          {errors.photo && <p className={err}>{errors.photo.message}</p>}
        </div>
      </form>
    </div>
  );
}
