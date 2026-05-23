const brands = [
  "Intel",
  "AMD",
  "NVIDIA",
  "ASUS",
  "MSI",
  "Gigabyte",
  "Corsair",
  "Samsung",
  "Kingston",
  "Logitech",
  "HyperX",
  "Razer",
  "Cooler Master",
  "Western Digital",
  "Seagate",
  "Acer",
];

export default function BrandSection() {
  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-8 gap-4 max-4xl:px-4 max-4xl:grid-cols-6 max-6lg:grid-cols-4 max-md:flex max-md:gap-[0.8rem] max-md:px-4 max-md:overflow-x-auto max-md:overflow-y-hidden max-md:[scrollbar-width:none] max-md:[scroll-snap-type:x_mandatory] max-md:[-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:max-md:hidden">
      {brands.map((brand) => (
        <div
          className="group relative aspect-square w-full cursor-pointer flex items-center justify-center text-center bg-border-34 p-2 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_#24abf3] before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[linear-gradient(0deg,transparent,transparent_30%,#24abf3)] before:-rotate-45 before:transition-all before:duration-500 before:opacity-0 hover:before:opacity-100 hover:before:-rotate-45 hover:before:translate-y-full max-md:flex-[0_0_140px] max-md:min-w-[140px] max-md:aspect-square max-md:[scroll-snap-align:start] max-ms:flex-[0_0_120px] max-ms:min-w-[120px]"
          key={brand}
        >
          <h2 className="text-[rgb(187,187,187)] text-base relative z-[2] leading-[1.1] group-hover:text-accent max-md:text-[0.9rem] max-ms:text-[0.8rem]">
            {brand.toUpperCase()}
          </h2>
        </div>
      ))}
    </div>
  );
}
