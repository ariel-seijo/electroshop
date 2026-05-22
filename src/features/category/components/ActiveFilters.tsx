import Link from "next/link";

interface ActiveFiltersProps {
  name: string;
  sort: string;
  brand: string;
  min: string;
  max: string;
}

const sortLabels: Record<string, string> = {
  asc: "Menor precio",
  desc: "Mayor precio",
  popular: "Más vendidos",
  rating: "Mejor valorados",
};

export default function ActiveFilters({ name, sort, brand, min, max }: ActiveFiltersProps) {
  const filters: { label: string; href: string }[] = [];

  if (sort && sort !== "recent") {
    filters.push({
      label: sortLabels[sort],
      href: `/category/${name}?brand=${brand}&min=${min}&max=${max}`,
    });
  }

  if (brand) {
    filters.push({
      label: brand,
      href: `/category/${name}?sort=${sort}&min=${min}&max=${max}`,
    });
  }

  if (min || max) {
    filters.push({
      label: `$${min || 0} - $${max || "∞"}`,
      href: `/category/${name}?sort=${sort}&brand=${brand}`,
    });
  }

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="activeFilters">
      {filters.map((item) => (
        <Link key={item.label} href={item.href} className="filterChip">
          {item.label} ✕
        </Link>
      ))}
    </div>
  );
}
