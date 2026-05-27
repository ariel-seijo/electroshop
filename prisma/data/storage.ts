import type { SeedProductInput } from "./helpers";

export const storage: SeedProductInput[] = [
  {
    title: 'Kingston A400 SSD 500GB 2.5" - SATA III 6Gb/s',
    description:
      "SSD Kingston A400 de 500GB con velocidades de lectura/escritura de hasta 500MB/s y 450MB/s. Ideal para actualizar PCs lentos y notebooks.",
    price: 60,
    thumbnail:
      "https://www.pngall.com/wp-content/uploads/5/SSD-PNG-Image-File.png",
    stock: 20,
  },
  {
    title: "Samsung 980 Pro NVMe SSD 1TB PCIe 4.0 x4",
    description:
      "NVMe Samsung 980 Pro de 1TB con PCIe 4.0 ofrece velocidades de lectura de hasta 7000MB/s. El estándar de velocidad para gaming y edición profesional.",
    price: 100,
    thumbnail:
      "https://www.pngall.com/wp-content/uploads/5/SSD-PNG-Image-File.png",
    stock: 18,
  },
  {
    title: "Samsung 990 Pro NVMe SSD 2TB PCIe 4.0 x4",
    description:
      "NVMe Samsung 990 Pro de 2TB con velocidades de lectura/escritura de hasta 7450MB/s y 6900MB/s. El almacenamiento sólido para profesionales y gamers extremos.",
    price: 180,
    thumbnail:
      "https://www.pngall.com/wp-content/uploads/5/SSD-PNG-Image-File.png",
    stock: 10,
    featured: true,
  },
  {
    title: 'Seagate Barracuda HDD 1TB 3.5" - SATA III 6Gb/s 7200RPM',
    description:
      "Seagate Barracuda de 1TB con 7200RPM y caché de 64MB. Almacenamiento confiable para desktops y PCs de gaming básico.",
    price: 50,
    thumbnail:
      "https://pngimg.com/uploads/hard_disc/Hard%20disc%20PNG,%20hard%20drive%20PNG%20images%20free%20download,%20HDD%20PNG_PNG12038.png",
    stock: 25,
  },
  {
    title: 'Seagate Barracuda HDD 2TB 3.5" - SATA III 6Gb/s 7200RPM',
    description:
      "Seagate Barracuda de 2TB con 7200RPM y caché de 256MB. Máxima capacidad y rendimiento para almacenamiento masivo de juegos y medios.",
    price: 80,
    thumbnail:
      "https://pngimg.com/uploads/hard_disc/Hard%20disc%20PNG,%20hard%20drive%20PNG%20images%20free%20download,%20HDD%20PNG_PNG12038.png",
    stock: 15,
  },
];
