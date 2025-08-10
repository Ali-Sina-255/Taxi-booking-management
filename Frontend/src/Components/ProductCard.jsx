import React from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product, wishlist, onToggleWishlist }) => {
  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={() => scrollTo(0, 0)}
      className="group relative  rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
    >
      {/* Image section - fixed height */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-opacity duration-300"
        />
        <img
          src={product.hoverImageUrl}
          alt={`${product.name} hover`}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-500 hover:text-red-500 z-10 shadow"
        >
          <Heart
            size={20}
            className={isWishlisted ? "text-red-500" : "text-gray-500"}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Product Info - fixed height with flex-grow */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm text-indigo-500 font-semibold uppercase tracking-wide">
          {product.brand}
        </h3>
        <p className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">
          {product.name}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Size: {product.size}</p>
            <p className="text-sm font-semibold text-gray-900">
              €{product.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
