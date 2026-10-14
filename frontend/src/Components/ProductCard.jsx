import { Link } from "react-router-dom";
import { lowestPrice, peso, stars } from "../utils";

export default function ProductCard({ product }) {
  const img = product.photos?.[0]?.url;
  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white rounded-2xl border border-slate-200/70 card-shadow hover:border-slate-300 transition-all overflow-hidden flex flex-col"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-cubes text-3xl" />
          </div>
        )}
      </div>
      <div className="p-4 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wider text-electric-600">
          {product.category}
        </p>
        <h3 className="font-extrabold text-navy-900 tracking-tight mt-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-amber-500 text-sm mt-1">
          {stars(product.ratings)}{" "}
          <span className="text-slate-400 text-xs font-medium">
            ({product.numOfReviews || 0})
          </span>
        </p>
        <p className="text-xl font-bold text-navy-900 mt-2">{peso(lowestPrice(product))}</p>
      </div>
    </Link>
  );
}
