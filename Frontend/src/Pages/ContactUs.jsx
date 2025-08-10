import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import FAQSection from "../Components/FAQSection";
import axios from "axios"; // Import axios

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState(null); // To display success/error messages
  const [loading, setLoading] = useState(false); // To handle button loading state

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
    triggerOnce: true,
    threshold: 0.5,
  });

  const [paragraphRef, paragraphInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    setLoading(true);
    const apiUrl = `${
      import.meta.env.VITE_BASE_URL
    }/api/v1/notification/contacts/`;

    try {
      const response = await axios.post(apiUrl, formData);
      console.log("Form submitted successfully:", response.data);
      setFormStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "An error occurred. Please try again later.";
      if (error.response && error.response.data && error.response.data.email) {
        errorMessage = `Error: ${error.response.data.email[0]}`;
      }
      setFormStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/20 to-white min-h-screen">
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
            Contactez-nous
          </motion.h1>

          <motion.p
            ref={paragraphRef}
            initial="hidden"
            animate={paragraphInView ? "visible" : "hidden"}
            variants={textVariants}
            transition={{ delay: 0.2 }} // Slight delay for staggered effect
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            Nous sommes là pour vous aider ! Contactez notre équipe pour toute
            question ou préoccupation.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[] md:max-w-[90%] mx-auto px-6 py-16">
        <div className=" gap-12">
          {/* Contact Information */}
          <div className="bg-white">
            <h2 className="text-2xl font-bold text-center text-indigo-900 mb-8">
              Entrer en contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-10 mb-8 pt-5">
              <div className=" text-center gap-4">
                <div className="flex items-center gap-x-2  justify-center bg-indigo-100 p-3 rounded-full">
                  <MapPin className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Notre adresse
                  </h3>
                </div>
                <div className="mt-3">
                  <p className="text-gray-600">
                    123 Avenue de la Mode, Suite 456
                    <br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Mail className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Nous écrire
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    <a
                      href="mailto:info@chigfrip.com"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      chigfrip@outlook.fr
                    </a>
                    <br />
                    <a
                      href="mailto:support@chigfrip.com"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      chigfrip@outlook.fr
                    </a>
                  </p>
                </div>
              </div>

              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Phone className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Appelez-nous
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    <a
                      href="tel:+18005551234"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      +1 (800) 555-1234
                    </a>
                    <br />
                    Mon-Fri: 9am-6pm EST
                  </p>
                </div>
              </div>

              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Clock className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Heures d’ouverture
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    Monday-Friday: 9:00 AM - 6:00 PM
                    <br />
                    Saturday: 10:00 AM - 4:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="col-span-1 md:px-20">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                Envoyez-nous un message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1  gap-6">
                  <div className="space-y-6">
                    {/* Full Name Input */}
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent"
                        placeholder="Nom complet"
                        required
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
            ${
              formData.name
                ? "-top-2 text-xs text-black"
                : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
            }`}
                      >
                        Votre nom
                      </label>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent"
                        placeholder="Email"
                        required
                      />
                      <label
                        htmlFor="email"
                        className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
            ${
              formData.email
                ? "-top-2 text-xs text-black"
                : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
            }`}
                      >
                        Votre e-mail
                      </label>
                    </div>
                  </div>
                </div>

                <div className="relative mt-6">
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    className="peer w-full px-4 pt-6 pb-2 border border-black rounded-lg focus:outline-none  placeholder-transparent resize-none"
                    required
                  />
                  <label
                    htmlFor="message"
                    className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
          ${
            formData.message
              ? "-top-2 text-xs text-black"
              : "top-4 text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black"
          }`}
                  >
                    Votre message
                  </label>
                </div>
                {formStatus && (
                  <div
                    className={`p-4 rounded-md ${
                      formStatus.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formStatus.message}
                  </div>
                )}
                <div className="flex justify-center items-center">
                  {/* <button class="text-xl w-40 h-12 rounded bg-emerald-500 text-white relative overflow-hidden group z-10 hover:text-white duration-1000">
                    <span class="absolute bg-emerald-600 w-44 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
                    <span class="absolute bg-emerald-800 w-44 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
                    Send
                  </button> */}
                  <button className="primary-btn">Envoyer</button>
                </div>
              </form>
            </div>
            <div className="col-span-1 flex items-center bg-white rounded-xl shadow-sm p-8">
              <FAQSection />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
      </div>
    </div>
  );
};

export default ContactUs;
