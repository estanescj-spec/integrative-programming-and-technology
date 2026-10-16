import { Link } from "react-router-dom";
import { lowestPrice, peso, stars } from "../utils";

export default function ProductCard({ product }) {
  const img = product.photos?.[0]?.url;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group w-full bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="aspect-[4/3] w-full bg-slate-50 overflow-hidden relative border-b border-slate-100">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <svg
              className="w-8 h-8 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span className="text-xs font-semibold text-slate-400">
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60">
            {product.category}
          </span>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight mt-2.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <span>{stars(product.ratings)}</span>
            <span className="text-slate-400 text-xs font-normal">
              ({product.numOfReviews || 0})
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <p className="text-lg font-black text-slate-900 tracking-tight">
              {peso(lowestPrice(product))}
            </p>
            <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              View &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
