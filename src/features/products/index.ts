export { default as ProductCard } from "./components/ProductCard";
export { default as Products } from "./components/Products";
export { default as FeaturedCarousel } from "./components/FeaturedCarousel";
export { default as Pagination } from "./components/Pagination";

export { default as ProductPage } from "./components/ProductPage";
export { default as ProductGallery } from "./components/ProductGallery";

export { default as FeaturedCarouselDynamic } from "./components/FeaturedCarouselDynamic";
export type { Product } from "./components/FeaturedCarousel";

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./services/product.service";

export { getProductBySlug, getRelatedProducts } from "./api/product.service";
