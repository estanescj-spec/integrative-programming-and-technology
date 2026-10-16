import React, { useState } from "react";
import { Play, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Review state data matching screenshot
  const reviews = [
    {
      id: 1,
      name: "Talon Ekstrom",
      role: "LEGO Fan",
      avatar:
        "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80",
      title: "Amazing set! Great to display",
      quote:
        "This is definitely one of coolest sets I've ever built. It is extremely detailed and has a lot of awesome features",
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      role: "AFOL Builder",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      title: "Incredible attention to detail",
      quote:
        "The interactive movements and mechanical functions make this set stand out in any Super Mario collection!",
    },
  ];

  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  return (
    <div className="w-full min-h-screen bg-white font-body text-gray-900 select-none overflow-x-hidden antialiased">
      {/* Google Fonts Import for Exact Fredoka & Nunito Rounded Typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        
        .font-fredoka {
          font-family: 'Fredoka', 'Nunito', sans-serif;
        }
        .font-body {
          font-family: 'Nunito', sans-serif;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 24s linear infinite;
        }
      `}</style>

      {/* =========================================================================
          SECTION 1: HERO LANDING PAGE
         ========================================================================= */}
      <section className="relative w-full min-h-screen flex flex-col justify-between bg-white overflow-hidden">
        {/* Hanging Upside-down Bowser Figure at Top Center */}
        <div className="absolute top-[-25px] left-[27%] md:left-[29%] z-30 w-36 md:w-52 pointer-events-none transform -rotate-3">
          <img
            src="https://m.media-amazon.com/images/I/81fH5iT3nTL._AC_SL1500_.jpg"
            alt="LEGO Bowser upside down head"
            className="w-full transform rotate-180 drop-shadow-xl"
          />
        </div>

        {/* Confetti Particles - Hero */}
        <div className="absolute top-28 left-20 w-3 h-2 bg-[#E3000B] rotate-45 rounded-sm"></div>
        <div className="absolute top-48 left-[45%] w-3.5 h-2.5 bg-[#00A651] -rotate-12 rounded-sm"></div>
        <div className="absolute top-36 right-[40%] w-3 h-2 bg-[#FFCC00] rotate-12 rounded-sm"></div>
        <div className="absolute bottom-32 right-[46%] w-4 h-2 bg-[#E3000B] -rotate-45 rounded-sm"></div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-4 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 flex-grow">
          {/* Left Text Block */}
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <h1 className="font-fredoka text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-black leading-[1.05]">
              We deliver <br />
              you <span className="text-[#E3000B]">FUN</span> to <br />
              your home
            </h1>

            <p className="font-body text-xs sm:text-sm text-gray-700 font-bold leading-relaxed max-w-md">
              Kids can always add to their levels with exciting new sets,
              accessories and characters... meaning there really is no end to
              the LEGO® Super Mario™ adventures they can have!
            </p>

            {/* Brand Logos */}
            <div className="flex items-center space-x-5 pt-2">
              {/* LEGO Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#E3000B] p-1 flex items-center justify-center rounded-sm shadow-md border-2 border-white">
                <span className="text-white font-extrabold text-xl tracking-tighter border-2 border-yellow-300 px-1 py-0.5 uppercase leading-none text-center font-serif">
                  LEGO
                </span>
              </div>

              {/* Super Mario Custom Logo */}
              <div className="flex flex-col font-black text-2xl sm:text-3xl tracking-tight leading-none uppercase">
                <span className="text-[#FFCC00] drop-shadow-[0_2px_0_rgba(0,0,0,1)] tracking-normal">
                  SUPER
                </span>
                <span className="text-[#E3000B] drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                  MARIO
                </span>
              </div>
            </div>
          </div>

          {/* Right Giant Bowser Stand */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-xl relative">
              <img
                src="https://m.media-amazon.com/images/I/81fH5iT3nTL._AC_SL1500_.jpg"
                alt="LEGO Mighty Bowser"
                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-102 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Circular Rotating Stamp & Arrow Overlay */}
        <div className="absolute left-6 md:left-28 bottom-12 z-30 flex items-center space-x-3 pointer-events-none">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              className="w-full h-full animate-spin-slow"
              viewBox="0 0 100 100"
            >
              <path
                id="stampPath"
                d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                fill="none"
              />
              <text className="font-body text-[8.5px] font-extrabold tracking-widest fill-gray-900 uppercase">
                <textPath href="#stampPath" startOffset="0%">
                  • SHOP NOW • SUPER MARIO COLLECTION
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-black text-black" />
            </div>
          </div>

          <div className="hidden sm:block w-16 h-12 text-black transform -rotate-12">
            <svg
              viewBox="0 0 100 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M10,10 C 35,50 65,10 88,40" />
              <polyline points="78,40 90,42 88,28" />
            </svg>
          </div>
        </div>

        {/* Toad Figure on Left */}
        <div className="absolute left-2 bottom-0 z-20 w-32 sm:w-44 pointer-events-none">
          <div className="absolute -top-3 right-4 text-yellow-400 text-lg font-bold">
            ✨
          </div>
          <div className="absolute top-1/2 -left-1 text-yellow-400 text-sm font-bold">
            ✨
          </div>
          <img
            src="https://m.media-amazon.com/images/I/71R2o583nBL._AC_SL1500_.jpg"
            alt="LEGO Toad character set"
            className="w-full h-auto drop-shadow-xl"
          />
        </div>

        {/* Bottom Split Color Floor (Yellow / Green) */}
        <div className="w-full h-16 grid grid-cols-12 z-0">
          <div className="col-span-6 bg-[#FFCC00]"></div>
          <div className="col-span-6 bg-[#00A651]"></div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SPLIT UNIVERSE & REVIEWS FOLD
         ========================================================================= */}
      <section
        id="reviews"
        className="relative w-full min-h-screen grid grid-cols-1 lg:grid-cols-2"
      >
        {/* LEFT HALF - YELLOW BACKGROUND */}
        <div className="bg-[#FFCC00] relative px-8 sm:px-16 py-16 flex flex-col justify-between overflow-hidden">
          {/* Yellow Area Confetti */}
          <div className="absolute top-16 left-20 w-3 h-2 bg-[#E3000B] rotate-45 rounded-sm"></div>
          <div className="absolute top-1/3 left-12 w-3 h-3 bg-[#00A651] -rotate-12 rounded-sm"></div>

          {/* Bowser Figure Build Top Center */}
          <div className="flex justify-center pt-4 mb-8">
            <div className="w-52 sm:w-64 relative">
              <img
                src="https://m.media-amazon.com/images/I/81fH5iT3nTL._AC_SL1500_.jpg"
                alt="LEGO Bowser Figure Build"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Testimonial / Review Card */}
          <div className="max-w-md mx-auto w-full z-10 space-y-4">
            {/* User Profile Info */}
            <div className="flex items-center space-x-3">
              <img
                src={reviews[activeReviewIdx].avatar}
                alt={reviews[activeReviewIdx].name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 className="font-fredoka font-semibold text-gray-900 text-sm leading-tight">
                  {reviews[activeReviewIdx].name}
                </h4>
                <p className="font-body text-[11px] text-gray-800 font-bold">
                  {reviews[activeReviewIdx].role}
                </p>
              </div>
            </div>

            {/* Quote Block */}
            <div className="space-y-1">
              <div className="flex items-start space-x-2">
                <span className="font-fredoka text-2xl font-bold text-black leading-none">
                  “
                </span>
                <h3 className="font-fredoka font-semibold text-gray-900 text-lg sm:text-xl tracking-tight">
                  {reviews[activeReviewIdx].title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-gray-900 font-bold leading-relaxed pl-5">
                {reviews[activeReviewIdx].quote}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2 pt-2 pl-5">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveReviewIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeReviewIdx === idx ? "w-8 bg-black" : "w-3 bg-black/30"
                  }`}
                  aria-label={`Switch review ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE PLAY BUTTON OVERLAY */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center pointer-events-none">
          <div
            onClick={() => setIsVideoOpen(true)}
            className="relative pointer-events-auto cursor-pointer group flex flex-col items-center"
          >
            {/* Lego Characters Stand */}
            <div className="w-64 sm:w-80 relative flex items-center justify-center">
              <img
                src="https://m.media-amazon.com/images/I/71R2o583nBL._AC_SL1500_.jpg"
                alt="LEGO Shy Guy and Yoshi"
                className="w-full h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 border-2 border-white">
                  <Play className="w-7 h-7 text-black fill-black ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HALF - GREEN BACKGROUND WITH CONCENTRIC RINGS */}
        <div className="bg-[#00A651] relative px-8 sm:px-16 py-16 flex flex-col justify-center text-white overflow-hidden">
          {/* Concentric Circle Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
            <div className="w-[900px] h-[900px] rounded-full border-[50px] border-white"></div>
            <div className="absolute w-[650px] h-[650px] rounded-full border-[35px] border-white"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border-[20px] border-white"></div>
          </div>

          {/* Confetti */}
          <div className="absolute top-16 right-20 w-3 h-2 bg-[#FFCC00] rotate-12 rounded-sm"></div>
          <div className="absolute bottom-20 right-32 w-4 h-2 bg-[#E3000B] -rotate-45 rounded-sm"></div>

          {/* Content Block */}
          <div className="max-w-md mx-auto lg:ml-28 z-10 space-y-4">
            <h2 className="font-fredoka text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              It's a big universe <br />
              out there
            </h2>

            <p className="font-body text-xs sm:text-sm text-green-50 font-semibold leading-relaxed opacity-95">
              With LEGO® Super Mario™, kids can team up with or battle their
              favorite characters from across the Super Mario™ universe! Also we
              chatted to the great minds behind this fan-favorite LEGO theme.
            </p>
          </div>

          {/* Far Right Bowser Peek */}
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-40 sm:w-52 pointer-events-none opacity-90 hidden sm:block">
            <img
              src="https://m.media-amazon.com/images/I/81fH5iT3nTL._AC_SL1500_.jpg"
              alt="LEGO Bowser Right Edge"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIGHTBOX VIDEO MODAL
         ========================================================================= */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="LEGO Super Mario Showcase Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
