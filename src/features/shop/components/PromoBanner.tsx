import Link from "next/link";
import { ChevronRight, Zap, Truck, ShieldCheck } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="px-4" aria-labelledby="promo-heading">
      <h2 id="promo-heading" className="visually-hidden">
        Beneficios de comprar con nosotros
      </h2>
      <div className="max-w-[1200px] mx-auto mt-10">
        <ul className="grid grid-cols-3 gap-[1px] bg-border-34 border border-border-34 rounded-lg overflow-hidden list-none p-0 m-0 max-6lg:grid-cols-1">
          <li className="group flex items-center gap-4 px-[1.8rem] py-[1.6rem] bg-surface-20 transition-[background,transform] duration-[350ms] ease-linear hover:bg-[rgb(25,25,25)] max-3md:px-4 max-3md:py-[1.2rem]">
            <div
              className="size-[50px] rounded-full bg-accent/[0.08] border border-accent/20 flex items-center justify-center shrink-0 text-accent transition-[background,border-color,box-shadow,transform] duration-[350ms] ease-linear group-hover:bg-accent/15 group-hover:border-accent/45 group-hover:shadow-[0_0_20px_rgba(36,171,243,0.25)] group-hover:scale-[1.06] max-3md:size-11"
              aria-hidden="true"
            >
              <Truck size={22} />
            </div>
            <div className="flex flex-col gap-[0.15rem]">
              <span className="text-[0.88rem] font-semibold text-[rgb(210,210,210)] uppercase tracking-[0.5px]">Envío gratis</span>
              <span className="text-[0.78rem] text-text-subtle font-semibold">En compras +$50.000</span>
            </div>
          </li>

          <li className="group flex items-center gap-4 px-[1.8rem] py-[1.6rem] bg-surface-20 transition-[background,transform] duration-[350ms] ease-linear hover:bg-[rgb(25,25,25)] max-3md:px-4 max-3md:py-[1.2rem]">
            <div
              className="size-[50px] rounded-full bg-accent/[0.08] border border-accent/20 flex items-center justify-center shrink-0 text-accent transition-[background,border-color,box-shadow,transform] duration-[350ms] ease-linear group-hover:bg-accent/15 group-hover:border-accent/45 group-hover:shadow-[0_0_20px_rgba(36,171,243,0.25)] group-hover:scale-[1.06] max-3md:size-11"
              aria-hidden="true"
            >
              <ShieldCheck size={22} />
            </div>
            <div className="flex flex-col gap-[0.15rem]">
              <span className="text-[0.88rem] font-semibold text-[rgb(210,210,210)] uppercase tracking-[0.5px]">Garantía oficial</span>
              <span className="text-[0.78rem] text-text-subtle font-semibold">
                12 meses en todos los productos
              </span>
            </div>
          </li>

          <li className="group flex items-center gap-4 px-[1.8rem] py-[1.6rem] bg-surface-20 transition-[background,transform] duration-[350ms] ease-linear hover:bg-[rgb(25,25,25)] max-3md:px-4 max-3md:py-[1.2rem]">
            <div
              className="size-[50px] rounded-full bg-accent/[0.08] border border-accent/20 flex items-center justify-center shrink-0 text-accent transition-[background,border-color,box-shadow,transform] duration-[350ms] ease-linear group-hover:bg-accent/15 group-hover:border-accent/45 group-hover:shadow-[0_0_20px_rgba(36,171,243,0.25)] group-hover:scale-[1.06] max-3md:size-11"
              aria-hidden="true"
            >
              <Zap size={22} />
            </div>
            <div className="flex flex-col gap-[0.15rem]">
              <span className="text-[0.88rem] font-semibold text-[rgb(210,210,210)] uppercase tracking-[0.5px]">Envío rápido</span>
              <span className="text-[0.78rem] text-text-subtle font-semibold">
                Despacho en 24hs hábiles
              </span>
            </div>
          </li>
        </ul>

        <div className="mt-[1px] flex items-center justify-between gap-8 px-[2.5rem] py-[2.2rem] bg-surface-20 border border-border-34 rounded-b-lg relative overflow-hidden after:content-[''] after:absolute after:top-0 after:right-0 after:w-[420px] after:h-full after:bg-[linear-gradient(90deg,transparent_0%,rgba(36,171,243,0.03)_50%,rgba(0,207,255,0.06)_100%)] after:pointer-events-none max-6lg:flex-col max-6lg:items-start max-6lg:gap-[1.2rem] max-3md:px-[1.2rem] max-3md:py-6">
          <div className="[&>h3]:m-0 [&>h3]:mb-[0.4rem] [&>h3]:text-[1.35rem] [&>h3]:font-semibold [&>h3]:text-[rgb(220,220,220)] [&>p]:m-0 [&>p]:text-[0.92rem] [&>p]:text-text-dim [&>p]:max-w-[500px] max-3md:[&>h3]:text-[1.1rem] max-3md:[&>p]:text-[0.85rem]">
            <h3>¿Listo para armar tu PC gamer?</h3>
            <p>
              Encontrá los mejores componentes con los precios más competitivos
              del mercado.
            </p>
          </div>

          <Link
            href="/category/gpu"
            className="inline-flex items-center gap-2 px-[2.2rem] py-[0.9rem] bg-gradient-to-br from-brand to-brand-end text-[#111] text-[0.88rem] font-semibold uppercase tracking-[1px] no-underline whitespace-nowrap shrink-0 rounded-md transition-[box-shadow,transform] duration-300 ease-linear relative z-[1] hover:shadow-[0_0_35px_rgba(0,127,255,0.5),0_0_65px_rgba(0,207,255,0.3)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px] max-3md:px-6 max-3md:py-3 max-3md:text-[0.82rem]"
            aria-label="Ver todos los componentes gaming"
          >
            Ver componentes
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
