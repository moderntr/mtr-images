import { Product } from "@/lib/api";
import { ImageIcon, Link2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(product.product_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Link
      to={`/product/${product.product_id}`}
      state={{ product }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.cover_image}
          alt={product.product_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          <ImageIcon className="h-3 w-3" />
          {product.images.length}
        </div>
        {product.is_boosted && (
          <div className="absolute top-2 left-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            Boosted
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-display text-sm font-semibold text-card-foreground">
          {product.product_name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {product.category?.name || "Uncategorized"}
          </p>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Copy product link"
          >
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Link2 className="h-3 w-3" />}
            {copied ? "Copied" : "Link"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
