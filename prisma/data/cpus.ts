import type { SeedProductInput } from "./helpers";

export const cpus: SeedProductInput[] = [
  {
    title: "AMD Ryzen 5 5600X 6-Core 4.6GHz - Zen 3 Architecture",
    description:
      "El Ryzen 5 5600X ofrece 6 núcleos y 12 hilos con reloj base de 3.7GHz y boost de 4.6GHz. Arquitectura Zen 3 para gaming fluido y multitarea eficiente.",
    price: 220,
    thumbnail:
      "https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2463180-ryzen-chip-front.png",
    stock: 15,
  },
  {
    title: "AMD Ryzen 7 5800X 8-Core 4.7GHz - Zen 3 Architecture",
    description:
      "El Ryzen 7 5800X es un procesador de 8 núcleos y 16 hilos ideal para gaming de élite y creación de contenido. Boost hasta 4.7GHz.",
    price: 300,
    thumbnail:
      "https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2463180-ryzen-chip-front.png",
    stock: 12,
    featured: true,
  },
  {
    title: "AMD Ryzen 9 5900X 12-Core 4.8GHz - Zen 3 Architecture",
    description:
      "El Ryzen 9 5900X cuenta con 12 núcleos y 24 hilos para rendimiento extremo. Tecnología Precision Boost 2 para máximo rendimiento en gaming.",
    price: 450,
    thumbnail:
      "https://www.amd.com/content/dam/amd/en/images/products/processors/ryzen/2463180-ryzen-chip-front.png",
    stock: 9,
  },
  {
    title: "Intel Core i5-12400F 6-Core 4.4GHz - Alder Lake",
    description:
      "El Intel Core i5-12400F incluye 6 núcleos de rendimiento y 12 hilos con frecuencia hasta 4.4GHz. Arquitectura Alder Lake de 12ª generación.",
    price: 180,
    thumbnail:
      "https://www.venex.com.ar/products_images/1617202662_1555515752_sda.png",
    stock: 20,
    featured: true,
  },
  {
    title: "Intel Core i7-12700K 8-Core 5.0GHz - Alder Lake",
    description:
      "El Intel Core i7-12700K ofrece 8 núcleos de rendimiento y 8 núcleos eficientes con Boost térmico de 5.0GHz. Desbloqueado para overclock.",
    price: 320,
    thumbnail:
      "https://www.venex.com.ar/products_images/1617202662_1555515752_sda.png",
    stock: 10,
  },
];
