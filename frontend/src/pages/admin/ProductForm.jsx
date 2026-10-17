import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../api";
import { filesToDataUrls } from "../../utils";

const schema = yup.object({
  name: yup.string().max(100).required("Name is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  variants: yup
    .array()
    .of(
      yup.object({
        label: yup.string().required("Label is required"),
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
      }),
    )
    .min(1, "Add at least one variant"),
  photos: yup.mixed(),
});

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      variants: [{ label: "", price: "", discountPercent: "", stock: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const files = watch("photos");
  const previews = useMemo(
    () => Array.from(files || []).map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(
    () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
    [previews],
  );
  const removeNew = (index) => {
    const dt = new DataTransfer();
    Array.from(files || []).forEach((f, i) => i !== index && dt.items.add(f));
    setValue("photos", dt.files);
  };

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories));
    if (id) {
      api.get(`/product/${id}`).then(({ data }) => {
        const p = data.product;
        reset({
          name: p.name,
          description: p.description,
          category: p.category,
          variants: p.variants.map((v) => ({
            label: v.label,
            price: v.price,
            discountPercent: v.discountPercent || 0,
            stock: v.stock,
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
        category: values.category,
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
          <input
            {...register("name")}
            className="mt-1 w-full border border-gray-300 rounded-full px-3 py-2"
          />
          {errors.name && (
            <p className="text-[#E3000B] text-xs">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-2xl px-3 py-2"
          />
          {errors.description && (
            <p className="text-[#E3000B] text-xs">
              {errors.description.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">
            Category
          </label>
          <select
            {...register("category")}
            className="mt-1 w-full border border-gray-300 rounded-full px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[#E3000B] text-xs">{errors.category.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-gray-500">
              Variants
            </label>
            <button
              type="button"
              onClick={() =>
                append({ label: "", price: "", discountPercent: "", stock: "" })
              }
              className="text-xs font-bold text-[#1D4ED8]"
            >
              Add variant
            </button>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-2 mt-2 text-[11px] font-bold uppercase text-gray-500">
            <span>Option</span>
            <span>Price (₱)</span>
            <span>Discount %</span>
            <span>Stock</span>
            <span />
          </div>

          {fields.map((field, i) => (
            <div key={field.id}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                <input
                  placeholder="e.g. Red, Large, Deluxe Edition"
                  {...register(`variants.${i}.label`)}
                  className="border border-gray-300 rounded-full px-2 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  {...register(`variants.${i}.price`)}
                  className="border border-gray-300 rounded-full px-2 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="0-100"
                  {...register(`variants.${i}.discountPercent`)}
                  className="border border-gray-300 rounded-full px-2 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  {...register(`variants.${i}.stock`)}
                  className="border border-gray-300 rounded-full px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[#E3000B] text-xs font-bold"
                >
                  Remove
                </button>
              </div>
              {errors.variants?.[i] && (
                <p className="text-[#E3000B] text-xs mt-1">
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
            <p className="text-[#E3000B] text-xs">{errors.variants.message}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">Photos</p>
          <label className="mt-2 inline-block cursor-pointer bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-extrabold tracking-widest uppercase rounded-xl px-5 py-2.5">
            Choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              {...register("photos")}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {files?.length
              ? `${files.length} file(s) selected`
              : "No files chosen"}
          </p>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1 -right-1 bg-[#1D4ED8] text-white w-5 h-5 rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {existingPhotos
              .filter((p) => !removePhotoIds.includes(p.public_id))
              .map((p) => (
                <div key={p.public_id} className="relative">
                  <img
                    src={p.url}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRemovePhotoIds((ids) => [...ids, p.public_id])
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={isSubmitting}
            className="bg-[#E3000B] text-white font-bold px-6 py-3 rounded-full"
          >
            {isSubmitting ? "Saving..." : "Save product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="border-2 border-gray-300 hover:border-black text-gray-700 font-bold px-6 py-3 rounded-full transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
