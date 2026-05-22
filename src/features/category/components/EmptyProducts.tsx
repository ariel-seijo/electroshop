import Link from "next/link";
import { SearchX } from "lucide-react";

interface EmptyProductsProps {
  name: string;
}

export default function EmptyProducts({ name }: EmptyProductsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX size={48} strokeWidth={1.5} className="text-gray-600 mb-4" />
      <h2 className="text-lg font-semibold text-gray-300 mb-2">No hay productos</h2>
      <p className="text-gray-500 mb-4">
        No encontramos productos en &quot;{name}&quot; con los filtros seleccionados.
      </p>
      <Link href={`/category/${name}`} className="text-blue-400 hover:text-blue-300 transition-colors">
        Limpiar filtros
      </Link>
    </div>
  );
}
