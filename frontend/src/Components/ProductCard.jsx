import { Link } from "react-router-dom";
import { lowestPrice, peso, stars } from "../utils";

export default function ProductCard({ product }) {
  const img = product.photos?.[0]?.url;
  const off = Math.max(
    0,
    ...(product.variants || []).map((v) => v.discountPercent || 0),
  );
  const soldOut = product.variants?.every((v) => v.stock === 0);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-black shadow-md transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
    >
      <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden relative border-b-2 border-gray-100">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
            No image
          </div>
        )}
        {off > 0 && (
          <span className="absolute top-3 left-3 bg-[#E3000B] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
            -{off}%
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 right-3 bg-black text-white text-xs font-extrabold px-3 py-1 rounded-full">
            Sold out
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <h3 className="font-fredoka font-semibold text-black text-lg mt-2.5 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
            <span>{stars(product.ratings)}</span>
            <span className="text-gray-500">({product.numOfReviews || 0})</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <p className="font-fredoka text-xl font-semibold text-black">
              {peso(lowestPrice(product))}
            </p>
            <span className="text-xs font-bold text-[#E3000B]">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
