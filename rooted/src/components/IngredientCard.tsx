import type { IngredientAnalysis } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  HYDRATING: "bg-sage/10 text-sage",
  CONDITIONING: "bg-earth/10 text-earth",
  CLEANSING: "bg-[#5A6B7A]/10 text-[#5A6B7A]",
  BOTANICAL: "bg-[#6B7A4A]/10 text-[#6B7A4A]",
  FRAGRANCE: "bg-[#8A6B7A]/10 text-[#8A6B7A]",
  PRESERVATIVE: "bg-muted/10 text-muted",
  UNCLASSIFIED: "bg-cream text-charcoal",
};

export default function IngredientCard({ ingredient }: { ingredient: IngredientAnalysis }) {
  return (
    <div className="group border-b border-sage/8 py-5 transition-colors last:border-0 hover:bg-cream/40 px-4 -mx-4 rounded-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="font-serif text-lg font-medium text-charcoal">
              {ingredient.name}
            </h4>
            <span
              className={`rounded-full px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                CATEGORY_COLORS[ingredient.category] ?? CATEGORY_COLORS.UNCLASSIFIED
              }`}
            >
              {ingredient.category}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-earth">
            {ingredient.description}
          </p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {ingredient.detail}
          </p>
        </div>
        <div className="mt-1 hidden h-2 w-2 rounded-full bg-sage/20 transition-colors group-hover:bg-sage/40 sm:block" />
      </div>
    </div>
  );
}
