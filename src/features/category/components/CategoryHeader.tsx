import Link from "next/link";

interface CategoryHeaderProps {
  categoryName: string;
}

export default function CategoryHeader({ categoryName }: CategoryHeaderProps) {
  return (
    <nav className="flex items-center gap-[0.45rem] text-text-placeholder text-[0.85rem] font-semibold">
      <Link href="/" className="text-text-muted no-underline hover:text-accent transition-colors duration-200">Inicio</Link>

      <span>/</span>

      <span>{categoryName}</span>
    </nav>
  );
}
