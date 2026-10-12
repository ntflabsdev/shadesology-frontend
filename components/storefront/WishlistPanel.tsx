"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getStoredWishlist, type WishlistItem } from "@/lib/advancedEcommerce";

export function WishlistPanel() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  function refresh() {
    setItems(getStoredWishlist());
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("wishlist:updated", handler);
    return () => window.removeEventListener("wishlist:updated", handler);
  }, []);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-[--color-text-primary]">Wishlist</h2>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <div className="text-center py-6 text-[--color-text-muted]">
            <p className="font-medium">No saved items yet</p>
            <p className="mt-1 text-sm">Save products you like from any product page to compare them later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between gap-3 rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-3">
                <div>
                  <p className="font-medium text-[--color-text-primary]">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/products/${item.slug}`} className="text-sm font-medium text-[--color-brand-primary] hover:underline">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button href="/products" variant="outline" size="sm">Browse products</Button>
        </div>
      </CardBody>
    </Card>
  );
}
