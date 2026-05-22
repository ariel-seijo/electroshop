import Link from "next/link";
import { SearchX } from "lucide-react";

interface EmptyProductsProps {
  name: string;
}

export default function EmptyProducts({ name }: EmptyProductsProps) {
  return (
    <div className="emptyState">
      <SearchX size={48} strokeWidth={1.5} />
      <h3>No encontramos productos</h3>
      <p>Probá cambiar los filtros seleccionados para encontrar lo que buscás.</p>
      <Link href={`/category/${name}`} className="emptyBtn">
        Ver todos los productos
      </Link>
    </div>
  );
}
