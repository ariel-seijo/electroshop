import Link from "next/link";

interface CategoryHeaderProps {
  categoryName: string;
}

export default function CategoryHeader({ categoryName }: CategoryHeaderProps) {
  return (
    <nav className="breadcrumbs">
      <Link href="/">Inicio</Link>

      <span>/</span>

      <span>{categoryName}</span>
    </nav>
  );
}
