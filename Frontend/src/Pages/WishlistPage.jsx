// src/pages/WishlistPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { products as allProducts } from "../data/products";
import ProductCard from "../Components/ProductCard";
import { Heart } from "lucide-react";

const WishlistPage = ({ wishlist, onToggleWishlist, onQuickView }) => {
  // Find the full product objects that match the IDs in the wishlist
  const wishlistedProducts = allProducts.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Ma liste de souhaits
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Vous avez {wishlistedProducts.length} article(s) dans votre liste de
            souhaits.
          </p>
        </div>

        <section className="pt-12 pb-24">
          {wishlistedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {wishlistedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          ) : (
            // Displayed when the wishlist is empty
            <div className="text-center py-20">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                Votre liste de souhaits est vide
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Touchez le cœur sur un produit pour l'enregistrer ici pour plus
                tard.
              </p>

              <div className="mt-6">
                <Link
                  to="/"
                  onClick={() => scrollTo(0, 0)}
                  className="primary-btn"
                >
                  Commencer à acheter
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WishlistPage;
