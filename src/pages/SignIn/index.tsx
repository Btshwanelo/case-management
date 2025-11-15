import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  X,
  MessageCircle,
  ChevronRightCircle,
} from "lucide-react";
import Logo from "@/assets/logo-black.png";
import WhiteLogo from "@/assets/logo-white.png";
import Background from "@/assets/landing-bg.jpg";
import StudentImg from "@/assets/undraw_team_up_re_84ok 1.png";
import APImg from "@/assets/undraw_analysis_dq08.png";
import ContentImg from "@/assets/ContentBg.png";
import InstitutionImg from "@/assets/undraw_search_app_oso2.png";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentSignInPage from "./StudentSignIn";
import APSignIn from "./APSignIn";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Chatbot from "@/components/Chatbot";

export default function SignIn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to NSFAS housing platform",
      subtitle:
        "We're proudly servicing KwaZulu-Natal, Mpumalanga & All TUT Campuses",
    },
    {
      title: "Find Your Perfect Stay",
      subtitle: "Quality accommodation for NSFAS students",
    },
  ];

  const userTypes = [
    {
      title: "Student",
      description: "Student looking for accomodation",
      icon: StudentImg,
      type: "s",
    },
    {
      title: "Accommodation Provider",
      description: "Landlord offering accommodation",
      icon: APImg,
      type: "p",
    },
    {
      title: "Institution",
      description: "Offer student accommodation",
      icon: InstitutionImg,
      type: "i",
    },
  ];

  const handleSlideChange = (direction) => {
    if (direction === "next") {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  if (type === "s") return <APSignIn />;
  if (type === "p" || type === "i") return <APSignIn />;
  if (type != "p" && type != "i") return <APSignIn />;

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      data-testid="signin-page-container"
    >
      {/* Header */}
      <nav
        className="sticky top-0 z-50 bg-white border-b border-orange-500"
        data-testid="signin-navigation"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img
            data-testid="signin-nav-logo"
            src={Logo}
            alt="NSFAS Logo"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative h-[500px] bg-orange-600"
        data-testid="signin-hero-section"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-600/90"
          data-testid="signin-hero-overlay"
        >
          <img
            src={Background}
            alt="Background"
            className="w-full h-full object-cover mix-blend-overlay"
            data-testid="signin-hero-background"
          />
        </div>

        <div
          className="relative container mx-auto px-4 h-full flex items-center"
          data-testid="signin-hero-content"
        >
          <div className="text-white max-w-2xl" data-testid="signin-hero-text">
            <h1
              className="text-5xl font-bold mb-6"
              data-testid="signin-hero-title"
            >
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl mb-8" data-testid="signin-hero-subtitle">
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          data-testid="signin-carousel-prev-btn"
          onClick={() => handleSlideChange("prev")}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          data-testid="signin-carousel-next-btn"
          onClick={() => handleSlideChange("next")}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          data-testid="signin-carousel-indicators"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              data-testid={`signin-carousel-indicator-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* User Types Section */}
      <div
        className="container mx-auto px-4 -mt-20 mb-16"
        data-testid="signin-user-types-section"
      >
        <div
          className="grid md:grid-cols-3 gap-8"
          data-testid="signin-user-types-grid"
        >
          {userTypes.map((userType, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform"
              data-testid={`signin-user-type-card-${userType.type}`}
            >
              <img
                src={userType.icon}
                alt={userType.title}
                className="w-24 h-24 mx-auto mb-6"
                data-testid={`signin-user-type-icon-${userType.type}`}
              />
              <h3
                className="text-xl font-semibold mb-4"
                data-testid={`signin-user-type-title-${userType.type}`}
              >
                {userType.title}
              </h3>
              <p
                className="text-gray-600 mb-6"
                data-testid={`signin-user-type-description-${userType.type}`}
              >
                {userType.description}
              </p>
              <Button
                data-testid={`signin-watch-video-btn-${userType.type}`}
                onClick={() => navigate(`/watch-video?type=${userType.type}`)}
                variant="link"
                className="text-gray-600 hover:text-orange-500 mb-6 flex items-center gap-2 mx-auto"
              >
                Watch intro video <ChevronRightCircle className="w-4 h-4" />
              </Button>
              <div
                className="flex gap-4 justify-center"
                data-testid={`signin-user-type-actions-${userType.type}`}
              >
                {userType.type != "i" && (
                  <Button
                    data-testid={`signin-register-btn-${userType.type}`}
                    onClick={() => navigate(`/sign-up?entry=${userType.type}`)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Register
                  </Button>
                )}
                <Button
                  data-testid={`signin-signin-btn-${userType.type}`}
                  onClick={() => setSearchParams({ type: userType.type })}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  Sign in
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16" data-testid="signin-contact-section">
        <div className="container mx-auto px-4">
          <div
            className="text-center mb-12"
            data-testid="signin-contact-header"
          >
            <h2
              className="text-2xl font-bold text-gray-900 mb-2"
              data-testid="signin-contact-title"
            >
              Contact us
            </h2>
            <p className="text-gray-600" data-testid="signin-contact-subtitle">
              Our friendly team is available to chat.
            </p>
          </div>

          <div
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            data-testid="signin-contact-grid"
          >
            <div className="text-center" data-testid="signin-contact-email">
              <div
                className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                data-testid="signin-contact-email-icon-container"
              >
                <Mail
                  className="w-8 h-8 text-orange-500"
                  data-testid="signin-contact-email-icon"
                />
              </div>
              <h3
                className="font-semibold mb-2"
                data-testid="signin-contact-email-title"
              >
                Need help?
              </h3>
              <p
                className="text-gray-600 mb-4"
                data-testid="signin-contact-email-description"
              >
                Our friendly team is here to help.
              </p>
              <Button
                data-testid="signin-contact-email-btn"
                onClick={() => navigate("/support-case")}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                Log case
              </Button>
            </div>

            <div className="text-center" data-testid="signin-contact-whatsapp">
              <div
                className="w-16 h-16 bg-green-500 rounded-full p-2 flex items-center justify-center mx-auto mb-4"
                data-testid="signin-contact-whatsapp-icon-container"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-12 h-12 text-white fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  data-testid="signin-contact-whatsapp-icon"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h3
                className="font-semibold mb-2"
                data-testid="signin-contact-whatsapp-title"
              >
                WhatsApp
              </h3>
              <p
                className="text-gray-600 mb-4"
                data-testid="signin-contact-whatsapp-description"
              >
                Our team is available to chat on WhatsApp
              </p>
              <Button
                data-testid="signin-contact-whatsapp-btn"
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                onClick={() => window.open("https://wa.me/0647468669")}
              >
                Chat to us on WhatsApp
              </Button>
            </div>

            <div className="text-center" data-testid="signin-contact-phone">
              <div
                className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                data-testid="signin-contact-phone-icon-container"
              >
                <Phone
                  className="w-8 h-8 text-orange-500"
                  data-testid="signin-contact-phone-icon"
                />
              </div>
              <h3
                className="font-semibold mb-2"
                data-testid="signin-contact-phone-title"
              >
                Phone
              </h3>
              <p
                className="text-gray-600 mb-4"
                data-testid="signin-contact-phone-description"
              >
                Mon-Fri from 8am to 5pm.
              </p>
              <p
                className="text-orange-500 font-medium"
                data-testid="signin-contact-phone-number"
              >
                010 447 1542
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Section */}
      <div className="bg-white pt-16" data-testid="signin-whatsapp-section">
        <div className="container mx-auto px-4">
          <div
            className="grid md:grid-cols-2 gap-12 items-center"
            data-testid="signin-whatsapp-grid"
          >
            <div data-testid="signin-whatsapp-content">
              <h2
                className="text-3xl font-bold mb-4"
                data-testid="signin-whatsapp-title"
              >
                Get the latest updates on WhatsApp
              </h2>
              <p
                className="text-gray-600 mb-6"
                data-testid="signin-whatsapp-description"
              >
                Our friendly team is available to chat.
              </p>
              <Button
                data-testid="signin-whatsapp-subscribe-btn"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() =>
                  window.open(
                    "https://whatsapp.com/channel/0029VajJzSP9Bb5pjFEfu31U"
                  )
                }
              >
                Subscribe
              </Button>
            </div>
            <div
              className="relative"
              data-testid="signin-whatsapp-image-container"
            >
              <img
                src={ContentImg}
                alt="WhatsApp Preview"
                className=""
                data-testid="signin-whatsapp-preview-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="bg-orange-600 text-white mt-auto py-8"
        data-testid="signin-footer"
      >
        <div className="container mx-auto px-4">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            data-testid="signin-footer-content"
          >
            <img
              src={WhiteLogo}
              alt="NSFAS Logo"
              className="h-12"
              data-testid="signin-footer-logo"
            />
            <p className="text-sm" data-testid="signin-footer-copyright">
              © {new Date().getFullYear()} NSFAS Student Accommodation
              Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Float Buttons */}
      <div
        data-testid="signin-float-buttons"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-4"
      >
        <WhatsAppFloat data-testid="signin-whatsapp-float" />
        <Chatbot data-testid="signin-chatbot-float" />
      </div>
    </div>
  );
}
