import { useEffect, useState } from "react";
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
        price: yup.number().min(0).required(),
        discountPercent: yup.number().min(0).max(100),
        stock: yup.number().min(0).required(),
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "Lego Sets",
      variants: [{ label: "", price: 0, discountPercent: 0, stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

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
      <h2 className="text-2xl font-bold text-navy-900 mb-5">
        {id ? "Edit product" : "New product"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200/70 card-shadow p-6 space-y-4 max-w-3xl"
      >
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">
            Name
          </label>
          <input
            {...register("name")}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">
            Category
          </label>
          <select
            {...register("category")}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-slate-400">
              Variants
            </label>
            <button
              type="button"
              onClick={() =>
                append({ label: "", price: 0, discountPercent: 0, stock: 0 })
              }
              className="text-xs font-bold text-electric-600"
            >
              Add variant
            </button>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-2 mt-2 text-[11px] font-bold uppercase text-slate-400">
            <span>Option</span>
            <span>Price (₱)</span>
            <span>Discount %</span>
            <span>Stock</span>
            <span />
          </div>

          {fields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2"
            >
              <input
                placeholder="e.g. Red, Large, Deluxe Edition"
                {...register(`variants.${i}.label`)}
                className="border border-slate-200 rounded-xl px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Price"
                {...register(`variants.${i}.price`)}
                className="border border-slate-200 rounded-xl px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="0-100"
                {...register(`variants.${i}.discountPercent`)}
                className="border border-slate-200 rounded-xl px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Stock"
                {...register(`variants.${i}.stock`)}
                className="border border-slate-200 rounded-xl px-2 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-500 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          {errors.variants && (
            <p className="text-red-500 text-xs">
              {errors.variants.message || errors.variants.root?.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-400">
            Photos (multiple)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            {...register("photos")}
            className="mt-1 block text-sm"
          />
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
        <button
          disabled={isSubmitting}
          className="bg-electric-600 text-white font-bold px-6 py-3 rounded-xl"
        >
          {isSubmitting ? "Saving..." : "Save product"}
        </button>
      </form>
    </div>
  );
}
