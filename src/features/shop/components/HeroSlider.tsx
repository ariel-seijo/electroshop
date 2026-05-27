"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/slider/slider-image-1.webp",
    title: "COMPONENTES GAMING",
    subtitle: "Rendimiento extremo para tu setup",
    cta: "Ver GPU",
    href: "/category/gpu",
  },
  {
    src: "/slider/slider-image-2.webp",
    title: "NUEVA GENERACIÓN",
    subtitle: "Procesadores de última tecnología",
    cta: "Ver CPU",
    href: "/category/cpu",
  },
  {
    src: "/slider/slider-image-4.webp",
    title: "ALMACENAMIENTO SSD",
    subtitle: "Velocidad sin límites para tus datos",
    cta: "Ver Almacenamiento",
    href: "/category/storage",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resumeKey, setResumeKey] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, isPaused]);

  return (
    <section
      className="w-full overflow-hidden relative select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setResumeKey((k) => k + 1);
      }}
    >
      <div
        className="flex transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            className="min-w-full relative aspect-[1920/511] max-xl:aspect-[1920/750] max-md:aspect-[1920/900] max-ms:aspect-[1920/1100]"
            key={index}
          >
            <Image
              src={slide.src}
              alt={`Banner ${index + 1}`}
              fill
              priority={index === 0}
              loading={index !== 0 ? "eager" : undefined}
              sizes="100vw"
              className="object-cover block"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.6)_45%,rgba(10,10,10,0.25)_70%,transparent_100%)] pointer-events-none max-md:bg-[linear-gradient(0deg,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.4)_60%,transparent_100%)]" />
            <div className="absolute left-[7%] top-1/2 -translate-y-1/2 max-w-[520px] z-[2] max-xl:left-[5%] max-xl:max-w-[400px] max-md:left-0 max-md:right-0 max-md:top-auto max-md:bottom-12 max-md:px-6 max-md:max-w-full max-md:text-center max-md:-translate-y-0 max-ms:bottom-10">
              <h2 className="font-cosmic text-[3rem] font-thin tracking-[4px] text-white [text-shadow:0_0_40px_rgba(36,171,243,0.5)] leading-[1.1] m-0 mb-[0.8rem] animate-[slideFadeUp_0.8s_ease-out] max-xl:text-[2.2rem] max-xl:tracking-[2px] max-md:text-[1.6rem] max-md:tracking-[2px] max-ms:text-[1.3rem]">
                {slide.title}
              </h2>
              <p className="m-0 mb-[1.8rem] text-[1.15rem] font-semibold text-text-tertiary animate-[slideFadeUp_0.8s_ease-out_0.15s_both] max-xl:text-base max-md:text-[0.9rem] max-md:mb-[1.2rem] max-ms:text-[0.8rem]">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 px-8 py-[0.85rem] bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] text-[0.9rem] font-semibold uppercase tracking-[1.5px] no-underline transition-all duration-300 ease-linear animate-[slideFadeUp_0.8s_ease-out_0.3s_both] hover:shadow-[0_0_30px_rgba(0,127,255,0.5),0_0_60px_rgba(0,207,255,0.3)] hover:-translate-y-0.5 max-md:text-[0.8rem] max-md:px-6 max-md:py-[0.7rem]"
              >
                {slide.cta}
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        className="absolute top-1/2 left-6 -translate-y-1/2 z-[5] size-[46px] rounded-full border border-white/15 bg-[rgba(20,20,20,0.7)] backdrop-blur-[8px] text-white cursor-pointer flex items-center justify-center transition-all duration-300 ease-linear opacity-0 group-hover:opacity-100 hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_20px_rgba(36,171,243,0.3)] max-xl:size-[38px] max-xl:opacity-100 max-md:size-[34px] max-md:left-3 max-md:opacity-100"
        onClick={prev}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute top-1/2 right-6 -translate-y-1/2 z-[5] size-[46px] rounded-full border border-white/15 bg-[rgba(20,20,20,0.7)] backdrop-blur-[8px] text-white cursor-pointer flex items-center justify-center transition-all duration-300 ease-linear opacity-0 group-hover:opacity-100 hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_20px_rgba(36,171,243,0.3)] max-xl:size-[38px] max-xl:opacity-100 max-md:size-[34px] max-md:right-3 max-md:opacity-100"
        onClick={next}
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-[0.6rem] z-[5] max-md:bottom-4">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`size-2.5 rounded-full cursor-pointer transition-all duration-300 ease-linear p-0 hover:border-white/70 ${
              index === current
                ? "bg-accent border-2 border-accent shadow-[0_0_12px_rgba(36,171,243,0.5)]"
                : "bg-transparent border-2 border-white/30"
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/[0.06] z-[5]">
        <div
          className="h-full bg-[linear-gradient(90deg,#007fff,#00cfff,#24abf3)] animate-progress-bar group-hover:[animation-play-state:paused]"
          style={{ animationDuration: "6s" }}
          key={`${current}-${resumeKey}`}
        />
      </div>
    </section>
  );
}
