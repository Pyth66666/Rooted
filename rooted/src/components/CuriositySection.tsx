const INGREDIENTS = [
  "Hyaluronic Acid",
  "Glycerin",
  "Panthenol",
  "Niacinamide",
  "Sodium Laureth Sulfate",
  "Argan Oil",
  "Shea Butter",
  "Keratin",
  "Cetearyl Alcohol",
  "Jojoba Oil",
];

export default function CuriositySection() {
  return (
    <section id="discover" className="bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-earth">
          Your bathroom shelf
        </p>
        <h2 className="font-serif text-3xl font-medium leading-snug text-charcoal sm:text-4xl lg:text-5xl">
          Your bathroom shelf is full of ingredients.
          <br />
          <span className="text-sage italic">How many do you actually recognize?</span>
        </h2>

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-4">
          {INGREDIENTS.map((name, i) => (
            <span
              key={name}
              className="animate-fade-up rounded-full border border-sage/12 bg-ivory/80 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:border-sage/25 hover:text-charcoal"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
