import { Product } from "@/lib/api";
import { ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
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
      </div>
      <div className="p-3">
        <h3 className="truncate font-display text-sm font-semibold text-card-foreground">
          {product.product_name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {product.images.length} image{product.images.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
