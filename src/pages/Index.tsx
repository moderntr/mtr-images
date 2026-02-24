import { useState, useEffect, useMemo } from "react";
import { fetchProductImages, groupByProduct, Product, ProductImage } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Search, Loader2, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

const Index = () => {
  const [allImages, setAllImages] = useState<ProductImage[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const perPage = 20;

  useEffect(() => {
    setLoading(true);
    fetchProductImages(page, perPage)
      .then((data) => {
        setAllImages(data.images);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const products = useMemo(() => groupByProduct(allImages), [allImages]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.product_name.toLowerCase().includes(q));
  }, [products, search]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ImageIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                Marketing Gallery
              </h1>
              <p className="text-xs text-muted-foreground">{total} images across products</p>
            </div>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary py-2 pl-9 pr-3 text-sm text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-card p-2 text-card-foreground transition-colors hover:bg-secondary disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border bg-card p-2 text-card-foreground transition-colors hover:bg-secondary disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
