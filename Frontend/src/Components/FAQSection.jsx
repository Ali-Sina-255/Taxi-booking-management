import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqItems = [
  {
    question: "Combien de temps prend la livraison ?",
    answer:
      "La livraison standard prend de 3 à 5 jours ouvrables. Des options express sont disponibles lors du paiement.",
  },
  {
    question: "Quelle est votre politique de retour ?",
    answer:
      "Nous offrons un retour sous 30 jours pour les articles non utilisés avec les étiquettes d'origine. Les articles en vente finale ne peuvent pas être retournés.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Vous recevrez un numéro de suivi par e-mail une fois votre commande expédiée. Vous pouvez également vérifier dans le tableau de bord de votre compte.",
  },
  {
    question: "Proposez-vous la livraison internationale ?",
    answer:
      "Oui ! Nous livrons dans plus de 50 pays dans le monde. Les frais de livraison varient selon la destination.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // First question open by default
  const contentRefs = useRef([]);

  const toggleIndex = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        if (openIndex === index) {
          ref.style.maxHeight = ref.scrollHeight + "px";
        } else {
          ref.style.maxHeight = "0px";
        }
      }
    });
  }, [openIndex]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
        Questions fréquemment posées
      </h2>
      {faqItems.map((item, index) => (
        <div key={index} className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleIndex(index)}
            className="flex justify-between items-center w-full text-left"
          >
            <h3 className="text-base font-semibold text-gray-900">
              {item.question}
            </h3>
            <span className="text-gray-500">
              {openIndex === index ? <FaMinus /> : <FaPlus />}
            </span>
          </button>

          <div
            ref={(el) => (contentRefs.current[index] = el)}
            className="overflow-hidden transition-all duration-300 ease-in-out mt-2 text-gray-600"
            style={{ maxHeight: openIndex === index ? "none" : "0px" }}
          >
            <p className="py-1">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
