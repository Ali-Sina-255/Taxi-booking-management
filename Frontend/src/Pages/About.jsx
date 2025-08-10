import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import { IoReaderOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";

import { Link } from "react-router-dom";

const About = () => {
  const textVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // For scroll-triggered animations
  const [headingRef, headingInView] = useInView({
    triggerOnce: false, // Set to true if you only want animation once
    threshold: 0.5,
  });

  const [paragraphRef, paragraphInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  return (
    <div className="bg-gradient-to-b from-indigo-50/20 to-white min-h-screen ">
      {/* Hero Section */}
      <section className="relative bg-[url('about.png')] bg-cover bg-center bg-no-repeat text-white py-20 h-[400px]">
        <div className="absolute inset-0 bg-black opacity-50 z-0" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            ref={headingRef}
            initial="hidden"
            animate={headingInView ? "visible" : "hidden"}
            variants={textVariants}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            À propos de ChiqFrip
          </motion.h1>

          <motion.p
            ref={paragraphRef}
            initial="hidden"
            animate={paragraphInView ? "visible" : "hidden"}
            variants={textVariants}
            transition={{ delay: 0.2 }} // Slight delay for staggered effect
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            Votre destination de confiance pour la mode d'occasion premium à des
            prix imbattables.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[90%] mx-auto px-6 py-16">
        {/* Our Story */}
        <section className="mb-20">
          <div className="flex flex-col lg:flex-row gap-12 ">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-x-3 mb-5">
                <IoReaderOutline className="text-3xl text-indigo-900" />
                <h2 className="text-3xl font-bold text-indigo-900">
                  Notre Histoire
                </h2>
              </div>

              <p className="text-gray-700 mb-4 text-lg text-justify">
                Fondée en 2023, ChigFrip a débuté comme un petit projet passion
                visant à rendre la mode durable accessible à tous. Ce qui était
                à l'origine une initiative locale est désormais une communauté
                en ligne florissante d'amateurs de mode engagés.
              </p>

              <p className="text-gray-700 mb-4 text-lg text-justify">
                Nous croyons en l'économie circulaire - donner une seconde vie à
                des pièces pré-aimées tout en permettant à nos clients de
                découvrir des articles uniques à une fraction de leur prix
                d'origine.
              </p>

              <p className="text-gray-700 mb-8 text-lg text-justify">
                Chaque article de notre collection est soigneusement sélectionné
                et authentifié par notre équipe d'experts en mode.
              </p>

              {/* Contact Information */}
              <div className=" border-t  md:flex items-center space-y-4 md:space-y-0 justify-between border-gray-200 pt-4 ">
                <div className="flex items-center gap-3">
                  <MdOutlineEmail className="text-2xl text-indigo-600" />
                  <a
                    href="mailto:info@chigfrip.com"
                    className="text-gray-700 text-base md:text-xl hover:text-indigo-600 transition-colors"
                  >
                    info@chigfrip.com
                  </a>
                </div>
                <div className="hidden md:block h-[1px] w-[250px] bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-2xl text-indigo-600" />
                  <a
                    href="tel:+1234567890"
                    className="text-gray-700 text-base md:text-xl hover:text-indigo-600 transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Our team"
                className="rounded-xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-indigo-900 mb-12 text-center">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShieldCheck size={40} className="text-indigo-600" />,
                title: "Authenticité",
                desc: "Chaque article est rigoureusement vérifié pour garantir son authenticité avant mise en vente.",
              },
              {
                icon: <Truck size={40} className="text-indigo-600" />,
                title: "Livraison Rapide",
                desc: "Expédition sous 1-2 jours ouvrés avec suivi de colis fourni.",
              },
              {
                icon: <CreditCard size={40} className="text-indigo-600" />,
                title: "Paiements Sécurisés",
                desc: "Vos informations de paiement sont toujours protégées.",
              },
              {
                icon: <Headphones size={40} className="text-indigo-600" />,
                title: "Support 24/7",
                desc: "Notre service client est disponible à tout moment pour vous aider.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className=" p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center bg-indigo-200"
              >
                <div className="flex justify-center mb-4 text-white">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Methods - Focus on PayPal */}
        <section className="mb-20 bg-white  p-8 lg:p-12  border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-10 text-center">
            Options de Paiement Sécurisées
          </h2>

          <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
            {/* Text Section */}
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-semibold mb-5 text-gray-900 flex items-center">
                <FaPaypal size={36} className="text-blue-500 mr-3" />
                Paiements PayPal
              </h3>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Nous avons intégré PayPal pour vous offrir une expérience de
                paiement sécurisée, flexible et pratique..
              </p>

              <ul className="space-y-4 text-gray-700 text-base">
                {[
                  "Chiffrement sécurisé pour toutes les transactions",
                  "Protection des acheteurs sur tous les achats",
                  "Paiement par carte bancaire ou solde PayPal",
                  "Confirmation de paiement instantanée",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 font-bold mr-3 text-lg">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-gray-700 mt-6 text-lg leading-relaxed">
                Pas de compte PayPal ? Aucun problème. Vous pouvez payer en tant
                qu'invité avec votre carte de crédit ou de débit — rapide et
                sécurisé." Key Notes:
              </p>
            </div>

            {/* Image Section */}
            <div className="lg:w-1/2 w-full">
              <img
                src="paypal.png"
                alt="Secure payment illustration"
                className="rounded-2xl  w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
