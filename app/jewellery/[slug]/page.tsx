import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getProduct, priceFor, products, related } from "@/data/products";
import type { SlotId } from "@/data/image-slots";
import { getImage, withUtm } from "@/lib/images";
import { site } from "@/lib/site";
import { Photo } from "@/components/media/Photo";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ProductView } from "@/components/shop/ProductView";
import { ProductCard } from "@/components/shop/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/jewellery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.type}`,
    description: p.description,
    alternates: { canonical: `/jewellery/${p.slug}` },
    openGraph: { title: `${p.name} — ${p.type}`, description: p.description, images: [`/cutouts/${p.cutout}.webp`] },
  };
}

export default async function ProductPage({ params }: PageProps<"/jewellery/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.id === product.category)!;
  const source = getImage(`cut-${product.cutout}` as SlotId);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.type}`,
    description: product.description,
    image: `${site.url}/cutouts/${product.cutout}.webp`,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: priceFor(product),
      availability: "https://schema.org/MadeToOrder",
      url: `${site.url}/jewellery/${product.slug}`,
    },
  };

  return (
    <div className="shell pt-[calc(var(--header-h)+1.5rem)] pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mono mb-6 flex flex-wrap gap-2 text-muted">
        <TransitionLink href="/jewellery" className="link-line">
          jewellery
        </TransitionLink>
        <span aria-hidden>/</span>
        <TransitionLink href={`/jewellery?category=${category.id}`} className="link-line">
          {category.label.toLowerCase()}
        </TransitionLink>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-fg">
          {product.name.toLowerCase()}
        </span>
      </nav>

      <ProductView
        product={product}
        gallery={product.gallery.map((slot) => (
          <Photo key={slot} slot={slot} sizes="(min-width: 1024px) 55vw, 100vw" className="h-full" />
        ))}
        credit={
          source ? (
            <>
              piece photographed by{" "}
              <a href={withUtm(source.photographer.url)} target="_blank" rel="noopener noreferrer" className="link-line">
                {source.photographer.name}
              </a>{" "}
              on{" "}
              <a href={withUtm(source.photoUrl)} target="_blank" rel="noopener noreferrer" className="link-line">
                unsplash
              </a>
              , background removed
            </>
          ) : null
        }
      />

      <section aria-labelledby="related-title" className="mt-32">
        <div className="mb-10 flex items-end justify-between gap-6 border-t border-line pt-10">
          <h2 id="related-title" className="heading">
            Complete the look
          </h2>
          <TransitionLink href="/jewellery" className="micro link-line shrink-0">
            All jewellery
          </TransitionLink>
        </div>
        <ul className="grid grid-cols-2 gap-x-[clamp(0.75rem,2vw,1.75rem)] gap-y-12 md:grid-cols-4">
          {related(product).map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
