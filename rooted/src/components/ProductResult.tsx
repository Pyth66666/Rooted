import type { ProductResult } from "@/lib/mock-data";
import IngredientCard from "./IngredientCard";

interface Props {
  product: ProductResult;
}

export default function ProductResult({ product }: Props) {
  return (
    <section className="bg-ivory py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-12 border-b border-sage/10 pb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-earth">
            Your product
          </p>
          <h2 className="font-serif text-4xl font-medium text-charcoal sm:text-5xl">
            {product.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted">
            <div>
              <span className="text-xs uppercase tracking-wider text-earth">Brand</span>
              <p className="mt-0.5 font-medium text-charcoal">{product.brand}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-earth">Category</span>
              <p className="mt-0.5 font-medium text-charcoal">{product.category}</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="mb-2 font-serif text-2xl font-medium text-charcoal">
            What&apos;s inside?
          </h3>
          <p className="mb-8 text-sm text-muted">
            We identified {product.ingredients.length} ingredients on the label.
          </p>
          <div className="divide-y divide-sage/8">
            {product.ingredients.map((ing) => (
              <IngredientCard key={ing.name} ingredient={ing} />
            ))}
          </div>
        </div>

        <div className="rounded-sm bg-cream/70 p-8 lg:p-10">
          <h3 className="font-serif text-2xl font-medium text-charcoal sm:text-3xl">
            So... what does all of this actually mean?
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {product.summary}
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-sage">
                Best suited for
              </p>
              <ul className="space-y-1.5">
                {product.bestFor.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="h-1 w-1 rounded-full bg-sage/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-earth">
                Things you may want to consider
              </p>
              <ul className="space-y-1.5">
                {product.consider.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="h-1 w-1 rounded-full bg-earth/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted/60 leading-relaxed">
          Ingredient information is provided for educational purposes and does
          not replace professional medical advice.
        </p>
      </div>
    </section>
  );
}
