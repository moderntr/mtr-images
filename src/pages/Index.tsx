import { useState, useEffect, useMemo } from "react";
import { fetchProductImages, groupByProduct, extractCategories, Product, ProductImage, Category } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Search, Loader2, ImageIcon, Sparkles } from "lucide-react";

type FilterTab = "all" | "boosted" | number;

const Index = () => {
  const [allImages, setAllImages] = useState<ProductImage[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiPage, setApiPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const perPage = 80; // backend page size

  // Load first page of images on mount
  useEffect(() => {
    const loadFirstPage = async () => {
      try {
        setInitialLoading(true);
        const data = await fetchProductImages(1, perPage);
        setAllImages(data.images);
        setHasMore(data.images.length < data.total);
        setApiPage(1);
      } catch (err) {
        console.error("Failed to load marketing gallery images", err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = apiPage + 1;
      const data = await fetchProductImages(nextPage, perPage);
      setAllImages((prev) => [...prev, ...data.images]);
      setApiPage(nextPage);
      if (data.images.length === 0 || prevLengthPlus(data.images.length, allImages.length) >= data.total) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more marketing gallery images", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const prevLengthPlus = (added: number, current: number) => current + added;

  const allProducts = useMemo(() => groupByProduct(allImages), [allImages]);
  const categories = useMemo(() => extractCategories(allProducts), [allProducts]);

  const filtered = useMemo(() => {
    let result = allProducts;

    // Category / boosted filter
    if (activeTab === "boosted") {
      result = result.filter((p) => p.is_boosted);
    } else if (typeof activeTab === "number") {
      result = result.filter((p) => p.category?.id === activeTab);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.product_name.toLowerCase().includes(q));
    }

    return result;
  }, [allProducts, activeTab, search]);

  const visibleProducts = filtered;

  const tabs: { key: FilterTab; label: string; icon?: React.ReactNode }[] = [
    { key: "all", label: "All Products" },
    { key: "boosted", label: "Boosted", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ...categories.map((c) => ({ key: c.id as FilterTab, label: c.name })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <ImageIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                  Marketing Gallery
                </h1>
                <p className="text-xs text-muted-foreground">
                  {allProducts.length} products · {allImages.length} images
                </p>
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

          {/* Category Nav */}
          <nav className="flex gap-1 overflow-x-auto pb-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={String(tab.key)}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {initialLoading ? (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="relative aspect-[4/5] bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex items-center justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingMore ? "Loading more…" : "Load more products"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
