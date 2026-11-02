import { Link } from "react-router-dom";
import { Chip, Rating } from "@mui/material";
import { discountedPrice, peso } from "../utils";

export default function ProductCard({ product }) {
  const img = product.photos?.[0]?.url;
  const soldOut = product.variants?.every((v) => v.stock === 0);
  const best = (product.variants || []).reduce(
    (a, v) => (!a || discountedPrice(v) < discountedPrice(a) ? v : a),
    null,
  );

  return (
    <Link
      to={`/product/${product._id}`}
      className="group w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-500 shadow-md transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
    >
      <div className="aspect-[4/3] w-full bg-cream overflow-hidden relative border-b-2 border-gray-100">
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
        {soldOut && (
          <Chip
            label="Sold out"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "#000",
              color: "#fff",
            }}
          />
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <h3 className="font-fredoka font-semibold text-black text-lg mt-2.5 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs">
            <Rating
              value={Number(product.ratings)}
              precision={0.1}
              readOnly
              size="small"
            />
            <span className="text-gray-500">({product.numOfReviews || 0})</span>
          </div>
          <div className="flex items-baseline flex-wrap gap-x-2 mt-1">
            <p className="font-fredoka text-xl font-semibold text-brand-500">
              {peso(discountedPrice(best))}
            </p>
            {best?.discountPercent > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {peso(best.price)}
                </span>
                <Chip
                  label={`-${best.discountPercent}%`}
                  size="small"
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.main",
                    fontWeight: 800,
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
