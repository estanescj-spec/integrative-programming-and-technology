import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

const reviews = [
  {
    id: 1,
    name: "Talon Ekstrom",
    role: "LEGO Fan",
    title: "Amazing set! Great to display",
    quote:
      "This is definitely one of coolest sets I've ever built. It is extremely detailed and has a lot of awesome features",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "AFOL Builder",
    title: "Incredible attention to detail",
    quote:
      "The interactive movements and mechanical functions make this set stand out in any Super Mario collection!",
  },
];

export default function Landing() {
  const [idx, setIdx] = useState(0);
  const review = reviews[idx];
  const heroRef = useRef(null);
  const anchorRef = useRef(null);
  const [spiderLeft, setSpiderLeft] = useState(0);

  useLayoutEffect(() => {
    const place = () => {
      if (!heroRef.current || !anchorRef.current) return;
      setSpiderLeft(
        anchorRef.current.getBoundingClientRect().right -
          heroRef.current.getBoundingClientRect().left +
          4,
      );
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(heroRef.current);
    ro.observe(anchorRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-black select-none overflow-x-hidden antialiased">
      {/* ===== SECTION 1: HERO ===== */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col justify-between bg-white overflow-hidden"
      >
        <img
          src="/spiderman.png"
          alt="Spiderman"
          style={{ left: spiderLeft }}
          className={`absolute top-0 z-20 w-28 md:w-52 max-w-none pointer-events-none drop-shadow-xl animate-spider-drop`}
        />
        {/* Content */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-4 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 flex-grow">
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <h1 className="font-fredoka text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
              <span ref={anchorRef}>We deliver</span>
              <br />
              you <span className="text-brand-500">FUN</span> to <br />
              your home
            </h1>

            <p className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed max-w-md">
              Kids can always add to their levels with exciting new sets,
              accessories and characters... meaning there really is no end to
              the ToyHaven adventures they can have!
            </p>

            <div className="pt-2">
              <Button component={Link} to="/shop" size="large">
                Shop now
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <img
              src="/minecraft.png"
              alt="Minecraft"
              className="w-full h-auto object-contain drop-shadow-2xl scale-150"
            />
          </div>
        </div>

        {/* Floor strip */}
        <div className="w-full h-16 grid grid-cols-12 z-0">
          <div className="col-span-6 bg-brand-500" />
          <div className="col-span-6 bg-brand-600" />
        </div>
      </section>

      {/* ===== SECTION 2: REVIEWS ===== */}
      <section
        id="reviews"
        className="relative w-full min-h-screen grid grid-cols-1 lg:grid-cols-2"
      >
        {/* Left half */}
        <div className="bg-brand-500 relative px-8 sm:px-16 py-16 flex flex-col justify-center overflow-hidden">
          <div className="absolute top-16 left-20 w-3 h-2 bg-brand-100 rotate-45 rounded-sm" />
          <div className="absolute top-1/3 left-12 w-3 h-3 bg-brand-100 -rotate-12 rounded-sm" />

          <div className="max-w-md mx-auto w-full z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white text-brand-500 font-bold flex items-center justify-center border-2 border-white shadow-md">
                {review.name[0]}
              </div>
              <div>
                <h4 className="font-fredoka font-semibold text-white text-sm leading-tight">
                  {review.name}
                </h4>
                <p className="text-[11px] text-brand-100 font-bold">
                  {review.role}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-start space-x-2">
                <span className="font-fredoka text-2xl font-bold text-white leading-none">
                  “
                </span>
                <h3 className="font-fredoka font-semibold text-white text-lg sm:text-xl tracking-tight">
                  {review.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed pl-5">
                {review.quote}
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2 pl-5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === i ? "w-8 bg-white" : "w-3 bg-white/40"
                  }`}
                  aria-label={`Switch review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right half */}
        <div className="bg-brand-600 relative px-8 sm:px-16 py-16 flex flex-col justify-center text-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
            <div className="w-[900px] h-[900px] rounded-full border-[50px] border-white" />
            <div className="absolute w-[650px] h-[650px] rounded-full border-[35px] border-white" />
            <div className="absolute w-[400px] h-[400px] rounded-full border-[20px] border-white" />
          </div>

          <div className="absolute top-16 right-20 w-3 h-2 bg-brand-100 rotate-12 rounded-sm" />
          <div className="absolute bottom-20 right-32 w-4 h-2 bg-white -rotate-45 rounded-sm" />

          <div className="max-w-md mx-auto lg:ml-28 z-10 space-y-4">
            <h2 className="font-fredoka text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              It's a big universe <br />
              out there
            </h2>
            <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed opacity-95">
              With ToyHaven, kids can team up with or battle their
              favorite characters from across the LEGO universe! Also we
              chatted to the great minds behind this fan-favorite Toy store.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
