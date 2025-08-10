import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import logo from "../../public/44.png"; // Make sure this path matches your logo import

const Footer = () => {
  return (
    <footer className="bg-primary text-white" aria-labelledby="footer-heading">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8 lg:py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4 md:space-y-8  xl:col-span-1">
            {/* Replaced text with logo */}
            <Link to="/" className="flex items-center gap-x-5">
              <img
                src="footer_logo1.png"
                alt="Website Logo"
                className="h-20 md:h-28 w-auto" // Adjust height to match your header logo
              />
              <p className="text-3xl block md:hidden">Chiq Frip</p>
            </Link>
            <p className="text-base text-black">
              La mode durable, un article à la fois. Découvrez des pièces
              uniques d'occasion et offrez-leur une seconde vie.
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" className="text-black hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/chiqfrip.vibes?igsh=MWZhZ29iajBva2Jybg=="
                className="text-black hover:text-white"
              >
                <span className="sr-only">Instagram</span>
                <Instagram />
              </a>
              <a href="#" className="text-black hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter />
              </a>
            </div>
          </div>
          <div className="mt-12 md:grid md:grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid flex justify-between  md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-wider uppercase">
                  Boutique
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link
                      to="/"
                      className="text-base text-black hover:text-black/50"
                    >
                      Tous les produits
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      Nouveautés
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      Femmes
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      Hommes
                    </a>
                  </li>
                </ul>
              </div>
              <div className=" md:mt-0">
                <h3 className="text-sm text-black font-semibold tracking-wider uppercase">
                  Support
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      Livraison et Retours
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm text-black font-semibold tracking-wider uppercase">
                  Abonnez-vous à notre newsletter
                </h3>
                <p className="mt-4 text-base text-black">
                  Recevez les dernières nouveautés et offres spéciales
                  directement dans votre boîte de réception.
                </p>
                <form className="mt-4 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-2 text-white foc 
                    outline-none  sm:text-sm"
                    placeholder="Entrez votre e-mail"
                  />
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-md bg-white text-primary px-3 py-2 text-sm font-semibold  shadow-sm   focus-visible:outline-2 focus-visible:outline-offset-2 "
                    >
                      S’abonner
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-black text-center">
            © {new Date().getFullYear()} ChiqFrip, Inc. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
