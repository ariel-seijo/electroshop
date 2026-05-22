import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryHeaderProps {
  categoryName: string;
}

export default function CategoryHeader({ categoryName }: CategoryHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
      <Link href="/" className="hover:text-white transition-colors">
        Inicio
      </Link>
      <ChevronRight size={14} />
      <span className="text-white capitalize">{categoryName}</span>
    </div>
  );
}
