export interface ProductImage {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  image_url: string;
  thumbnail_url: string;
  created_at: string;
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
  images: ProductImage[];
  cover_image: string;
}

const BASE_URL = "https://moderntrademarket.com/api/v1/products/images";

export async function fetchProductImages(page: number, perPage: number = 20): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function groupByProduct(images: ProductImage[]): Product[] {
  const map = new Map<number, Product>();
  for (const img of images) {
    if (!map.has(img.product_id)) {
      map.set(img.product_id, {
        product_id: img.product_id,
        product_name: img.product_name.trim(),
        product_slug: img.product_slug,
        images: [],
        cover_image: img.thumbnail_url,
      });
    }
    map.get(img.product_id)!.images.push(img);
  }
  return Array.from(map.values());
}
