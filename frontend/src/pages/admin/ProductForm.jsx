import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../api";
import { filesToDataUrls } from "../../utils";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";

const field = (register, name) => {
  const { ref, ...rest } = register(name);
  return { ...rest, inputRef: ref };
};

const schema = yup.object({
  name: yup.string().max(100).required("Name is required"),
  description: yup.string(),
  categories: yup.mixed(),
  variants: yup
    .array()
    .of(
      yup.object({
        _id: yup.string(),
        label: yup.string(),
        price: yup
          .number()
          .typeError("Enter a price")
          .moreThan(0, "Price must be greater than 0")
          .required("Enter a price"),
        discountPercent: yup
          .number()
          .transform((v, o) => (o === "" ? 0 : v))
          .typeError("Discount must be a number")
          .min(0, "Discount can't be negative")
          .max(100, "Discount can't exceed 100"),
        stock: yup
          .number()
          .typeError("Enter stock")
          .integer("Whole numbers only")
          .min(0, "Stock can't be negative")
          .required("Enter stock"),
        photoIndex: yup
          .number()
          .transform((v, o) => (o === "" || o == null ? undefined : v)),
      }),
    )
    .min(1, "Add at least one variant"),
  photos: yup.mixed(),
});

const emptyVariant = {
  label: "",
  price: "",
  discountPercent: "",
  stock: "",
  photoIndex: "",
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removePhotoIds, setRemovePhotoIds] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      categories: [],
      variants: [emptyVariant],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const files = watch("photos");
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = Array.from(files || []).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  const shiftPhotoIndex = (pos) =>
    (getValues("variants") || []).forEach((v, vi) => {
      const n =
        v.photoIndex === "" || v.photoIndex == null
          ? null
          : Number(v.photoIndex);
      if (n === pos) setValue(`variants.${vi}.photoIndex`, "");
      else if (n != null && n > pos)
        setValue(`variants.${vi}.photoIndex`, n - 1);
    });
  const removeNew = (index) => {
    shiftPhotoIndex(visibleExisting.length + index);
    const dt = new DataTransfer();
    Array.from(files || []).forEach((f, i) => i !== index && dt.items.add(f));
    setValue("photos", dt.files);
  };

  const visibleExisting = existingPhotos.filter(
    (p) => !removePhotoIds.includes(p.public_id),
  );
  const photoOptions = [...visibleExisting.map((p) => p.url), ...previews];

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch((err) => toast.error(err.message));
    if (id) {
      api.get(`/product/${id}`).then(({ data }) => {
        const p = data.product;
        reset({
          name: p.name,
          description: p.description,
          categories: p.categories || [],
          variants: p.variants.map((v) => ({
            _id: v._id,
            label: v.label,
            price: v.price,
            discountPercent: v.discountPercent || 0,
            stock: v.stock,
            photoIndex: v.photoIndex ?? "",
          })),
        });
        setExistingPhotos(p.photos || []);
      });
    }
  }, [id, reset]);

  const onSubmit = async (values) => {
    try {
      const photos = values.photos?.length
        ? await filesToDataUrls(values.photos)
        : [];
      const payload = {
        name: values.name,
        description: values.description,
        categories: [].concat(values.categories || []).filter(Boolean),
        variants: values.variants,
        photos,
        removePhotoIds,
      };
      if (id) await api.put(`/admin/product/${id}`, payload);
      else await api.post("/admin/product", payload);
      toast.success(id ? "Product updated" : "Product created");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="font-fredoka text-3xl font-semibold text-black mb-5">
        {id ? "Edit product" : "New product"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-6 space-y-4 max-w-3xl"
      >
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">
            Name
          </label>
          <TextField
            {...field(register, "name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ mt: 0.5 }}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">
            Description
          </label>
          <TextField
            multiline
            rows={4}
            {...field(register, "description")}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">
            Categories
          </label>
          <div className="mt-1 flex flex-wrap gap-x-2">
            {categories.map((c) => (
              <FormControlLabel
                key={c}
                label={c}
                control={
                  <Checkbox
                    size="small"
                    value={c}
                    {...field(register, "categories")}
                  />
                }
              />
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-gray-500">
              Variants
            </label>
            <Button
              size="small"
              variant="text"
              type="button"
              onClick={() => append(emptyVariant)}
            >
              Add variant
            </Button>
          </div>

          <div className="hidden md:grid grid-cols-6 gap-2 mt-2 text-[11px] font-bold uppercase text-gray-500">
            <span>Option</span>
            <span>Price (₱)</span>
            <span>Discount %</span>
            <span>Stock</span>
            <span>Photo</span>
            <span />
          </div>

          {fields.map((f, i) => (
            <div key={f.id}>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2">
                <TextField
                  placeholder="Default (if empty)"
                  {...field(register, `variants.${i}.label`)}
                />
                <TextField
                  type="number"
                  placeholder="Price"
                  {...field(register, `variants.${i}.price`)}
                />
                <TextField
                  type="number"
                  placeholder="0-100"
                  {...field(register, `variants.${i}.discountPercent`)}
                />
                <TextField
                  type="number"
                  placeholder="Stock"
                  {...field(register, `variants.${i}.stock`)}
                />
                <TextField
                  select
                  slotProps={{ select: { native: true } }}
                  {...field(register, `variants.${i}.photoIndex`)}
                >
                  <option value="">No photo</option>
                  {photoOptions.map((_, n) => (
                    <option key={n} value={n}>
                      Photo {n + 1}
                    </option>
                  ))}
                </TextField>
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </div>
              {errors.variants?.[i] && (
                <p className="text-red-500 text-xs mt-1">
                  {
                    Object.values(errors.variants[i])
                      .map((e) => e?.message)
                      .filter(Boolean)[0]
                  }
                </p>
              )}
            </div>
          ))}

          {errors.variants?.message && (
            <p className="text-red-500 text-xs">{errors.variants.message}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">Photos</p>
          <Button component="label" variant="outlined" sx={{ mt: 1 }}>
            Choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              {...register("photos")}
            />
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            {files?.length
              ? `${files.length} file(s) selected`
              : "No files chosen"}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {visibleExisting.map((p, i) => (
              <div key={p.public_id} className="relative">
                <img
                  src={p.url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 rounded-full">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    shiftPhotoIndex(i);
                    setRemovePhotoIds((ids) => [...ids, p.public_id]);
                  }}
                  className="absolute -top-1 -right-1 bg-brand-500 text-white w-5 h-5 rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border-2 border-ink"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 rounded-full">
                    {visibleExisting.length + i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1 -right-1 bg-ink text-white w-5 h-5 rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save product"}
          </Button>
          <Button
            type="button"
            size="large"
            variant="outlined"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
