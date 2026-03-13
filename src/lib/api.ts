export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_url: string;
  category: Category;
  is_boosted: boolean;
  image_url: string;
  thumbnail_url: string;
  created_at: string;
  view_count?: number;
}

export interface ApiResponse {
  images: ProductImage[];
  page: number;
  per_page: number;
  total: number;
}

export interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_url: string;
  category: Category;
  is_boosted: boolean;
  images: ProductImage[];
  cover_image: string;
  view_count?: number;
}

const BASE_URL = "https://moderntrademarket.com/api/v1/products/images";

export async function fetchProductImages(page: number, perPage: number = 20): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/** Fetch all images for a single product (ensures no images are lost when opening product gallery by URL). */
export async function fetchImagesByProductId(productId: number): Promise<ProductImage[]> {
  const all: ProductImage[] = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const res = await fetch(`${BASE_URL}/?product_id=${productId}&page=${page}&per_page=${perPage}`);
    if (!res.ok) throw new Error("Failed to fetch product images");
    const data: ApiResponse = await res.json();
    all.push(...data.images);
    if (data.images.length < perPage || all.length >= data.total) break;
    page++;
  }
  return all;
}

export async function fetchAllProductImages(): Promise<ProductImage[]> {
  const allImages: ProductImage[] = [];
  let page = 1;
  const perPage = 100;
  let total: number | null = null;
  while (true) {
    let data: ApiResponse;
    try {
      data = await fetchProductImages(page, perPage);
    } catch (err) {
      console.error(`Failed to fetch page ${page}, returning partial results:`, err);
      break;
    }
    allImages.push(...data.images);
    if (total === null) total = data.total;
    if (allImages.length >= data.total || data.images.length < perPage) break;
    page++;
  }
  return allImages;
}

export function groupByProduct(images: ProductImage[]): Product[] {
  const map = new Map<number, Product>();
  for (const img of images) {
    if (!map.has(img.product_id)) {
      map.set(img.product_id, {
        product_id: img.product_id,
        product_name: img.product_name.trim(),
        product_slug: img.product_slug,
        product_url: img.product_url,
        category: img.category,
        is_boosted: img.is_boosted,
        images: [],
        cover_image: img.image_url,
        view_count: img.view_count,
      });
    }
    const entry = map.get(img.product_id)!;
    // Any image in the product can confirm is_boosted status
    if (img.is_boosted) entry.is_boosted = true;
    entry.images.push(img);
  }
  return Array.from(map.values());
}

export function extractCategories(products: Product[]): Category[] {
  const map = new Map<number, Category>();
  for (const p of products) {
    if (p.category && !map.has(p.category.id)) {
      map.set(p.category.id, p.category);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
