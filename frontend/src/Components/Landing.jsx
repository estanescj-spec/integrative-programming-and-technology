import React, { useState } from "react";
import { Play, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
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
        <div className="absolute top-[0px] left-[27%] md:left-[29%] z-30 w-36 md:w-52 pointer-events-none transform -rotate-3">
          <img
            src="/spiderman.png"
            alt="Spiderman"
            className="w-full drop-shadow-xl"
          />
        </div>

        {/* Confetti Particles - Hero */}
        <div className="absolute top-28 left-20 w-3 h-2 bg-[#E3000B] rotate-45 rounded-sm"></div>
        <div className="absolute top-48 left-[45%] w-3.5 h-2.5 bg-[#E3000B] -rotate-12 rounded-sm"></div>
        <div className="absolute top-36 right-[40%] w-3 h-2 bg-[#1D4ED8] rotate-12 rounded-sm"></div>
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

            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block bg-[#E3000B] hover:bg-red-700 text-white font-fredoka font-semibold text-lg px-8 py-3 rounded-full shadow-md transition-transform hover:scale-105"
              >
                Shop now
              </Link>
            </div>
          </div>

          {/* Right Giant Bowser Stand */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-10xl relative">
              <img
                src="/minecraft.png"
                alt="Minecraft"
                className="w-full h-auto object-contain drop-shadow-2xl scale-150"
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
          <div className="col-span-6 bg-[#1D4ED8]"></div>
          <div className="col-span-6 bg-[#E3000B]"></div>
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
        <div className="bg-[#1D4ED8] relative px-8 sm:px-16 py-16 flex flex-col justify-between overflow-hidden">
          {/* Yellow Area Confetti */}
          <div className="absolute top-16 left-20 w-3 h-2 bg-[#E3000B] rotate-45 rounded-sm"></div>
          <div className="absolute top-1/3 left-12 w-3 h-3 bg-[#E3000B] -rotate-12 rounded-sm"></div>

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
                <h4 className="font-fredoka font-semibold text-white text-sm leading-tight">
                  {reviews[activeReviewIdx].name}
                </h4>
                <p className="font-body text-[11px] text-blue-100 font-bold">
                  {reviews[activeReviewIdx].role}
                </p>
              </div>
            </div>

            {/* Quote Block */}
            <div className="space-y-1">
              <div className="flex items-start space-x-2">
                <span className="font-fredoka text-2xl font-bold text-white leading-none">
                  “
                </span>
                <h3 className="font-fredoka font-semibold text-white text-lg sm:text-xl tracking-tight">
                  {reviews[activeReviewIdx].title}
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-white font-bold leading-relaxed pl-5">
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
                    activeReviewIdx === idx ? "w-8 bg-white" : "w-3 bg-white/40"
                  }`}
                  aria-label={`Switch review ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT HALF - GREEN BACKGROUND WITH CONCENTRIC RINGS */}
        <div className="bg-[#E3000B] relative px-8 sm:px-16 py-16 flex flex-col justify-center text-white overflow-hidden">
          {/* Concentric Circle Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
            <div className="w-[900px] h-[900px] rounded-full border-[50px] border-white"></div>
            <div className="absolute w-[650px] h-[650px] rounded-full border-[35px] border-white"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border-[20px] border-white"></div>
          </div>

          {/* Confetti */}
          <div className="absolute top-16 right-20 w-3 h-2 bg-[#1D4ED8] rotate-12 rounded-sm"></div>
          <div className="absolute bottom-20 right-32 w-4 h-2 bg-white -rotate-45 rounded-sm"></div>

          {/* Content Block */}
          <div className="max-w-md mx-auto lg:ml-28 z-10 space-y-4">
            <h2 className="font-fredoka text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              It's a big universe <br />
              out there
            </h2>

            <p className="font-body text-xs sm:text-sm text-white font-semibold leading-relaxed opacity-95">
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
    </div>
  );
}
