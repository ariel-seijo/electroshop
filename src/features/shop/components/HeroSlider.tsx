"use client";

import styles from "../styles/HeroSlider.module.css";
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
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setResumeKey((k) => k + 1); }}
    >
      <div
        className={styles["slider-track"]}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className={styles.slide} key={index}>
            <Image
              src={slide.src}
              alt={`Banner ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
            />
            <div className={styles["slide-overlay"]} />
            <div className={styles["slide-content"]}>
              <h2 className={styles["slide-title"]}>{slide.title}</h2>
              <p className={styles["slide-subtitle"]}>{slide.subtitle}</p>
              <Link href={slide.href} className={styles["slide-cta"]}>
                {slide.cta}
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button className={`${styles["slider-arrow"]} ${styles["slider-arrow-left"]}`} onClick={prev}>
        <ChevronLeft size={24} />
      </button>
      <button className={`${styles["slider-arrow"]} ${styles["slider-arrow-right"]}`} onClick={next}>
        <ChevronRight size={24} />
      </button>

      <div className={styles["slider-dots"]}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles["slider-dot"]} ${index === current ? styles.active : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>

      <div className={styles["slider-progress"]}>
        <div
          className={styles["slider-progress-bar"]}
          style={{ animationDuration: "6s" }}
          key={`${current}-${resumeKey}`}
        />
      </div>
    </section>
  );
}
