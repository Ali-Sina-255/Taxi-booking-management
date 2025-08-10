// src/components/ProductCard.jsx
import React from "react";
import { Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product, onQuickView, wishlist, onToggleWishlist }) => {
  const isWishlisted = wishlist.includes(product.id);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <article className="group relative">
      <Link
        to={`/product/${product.id}`}
        className="block"
        aria-label={`View ${product.name} details`}
      >
        {/* Image container with hover effect */}
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100 lg:h-80">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-opacity duration-300"
            loading="lazy"
          />
          {product.hoverImageUrl && (
            <img
              src={product.hoverImageUrl}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
            />
          )}
        </div>

        {/* Quick view button */}
        <div className="absolute inset-x-0 bottom-24 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
          <button
            onClick={handleQuickView}
            className="w-full bg-white/90 backdrop-blur-sm text-gray-900 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-white transition-colors duration-200 flex items-center justify-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Quick View
          </button>
        </div>
      </Link>

      {/* Product info */}
      <div className="mt-4 flex justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {product.brand}
          </h3>
          <p className="mt-1 text-sm text-gray-500 truncate">{product.name}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-sm font-semibold text-gray-900">
            €{product.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Size: {product.size}</p>
        </div>
      </div>

      {/* Wishlist button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 z-10"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={18}
          className={isWishlisted ? "text-red-500" : "text-gray-500"}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>
    </article>
  );
};

export default ProductCard;
