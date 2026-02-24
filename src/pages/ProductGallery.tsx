import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Product, ProductImage, fetchProductImages, groupByProduct } from "@/lib/api";
import ImageLightbox from "@/components/ImageLightbox";
import { ArrowLeft, Check, CheckSquare, Download, Loader2, Square, ImageIcon } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ProductGallery = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const passedProduct = (location.state as { product?: Product })?.product;

  const [product, setProduct] = useState<Product | null>(passedProduct || null);
  const [loading, setLoading] = useState(!passedProduct);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fallback: fetch if no state passed
  useEffect(() => {
    if (passedProduct || !id) return;
    setLoading(true);
    // Fetch pages until we find the product
    const findProduct = async () => {
      let page = 1;
      while (page <= 100) {
        const data = await fetchProductImages(page, 100);
        const products = groupByProduct(data.images);
        const found = products.find((p) => p.product_id === Number(id));
        if (found) {
          setProduct(found);
          break;
        }
        if (data.images.length < 100) break;
        page++;
      }
      setLoading(false);
    };
    findProduct();
  }, [id, passedProduct]);

  const toggleSelect = (imgId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(imgId) ? next.delete(imgId) : next.add(imgId);
      return next;
    });
  };

  const selectAll = () => {
    if (!product) return;
    if (selected.size === product.images.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(product.images.map((i) => i.id)));
    }
  };

  const handleDownload = useCallback(async () => {
    if (!product || selected.size === 0) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      const toDownload = product.images.filter((img) => selected.has(img.id));
      await Promise.all(
        toDownload.map(async (img, i) => {
          const res = await fetch(img.image_url);
          const blob = await res.blob();
          const ext = img.image_url.split(".").pop() || "jpg";
          zip.file(`${product.product_name}_${i + 1}.${ext}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${product.product_name}_images.zip`);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  }, [product, selected]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-muted-foreground">
        <p>Product not found</p>
        <button onClick={() => navigate("/")} className="mt-4 text-primary underline text-sm">
          Go back
        </button>
      </div>
    );
  }

  const allSelected = selected.size === product.images.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-border bg-card p-2 text-card-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                {product.product_name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {product.images.length} image{product.images.length !== 1 ? "s" : ""}
                {selected.size > 0 && ` · ${selected.size} selected`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
            >
              {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={handleDownload}
              disabled={selected.size === 0 || downloading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {product.images.map((img, idx) => {
            const isSelected = selected.has(img.id);
            return (
              <div
                key={img.id}
                className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected ? "border-primary shadow-md" : "border-transparent hover:border-border"
                }`}
              >
                <img
                  src={img.thumbnail_url}
                  alt={img.product_name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                  onClick={() => setLightboxIndex(idx)}
                />
                {/* Select overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(img.id);
                  }}
                  className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/70 text-foreground opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={product.images.map((i) => i.image_url)}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default ProductGallery;
