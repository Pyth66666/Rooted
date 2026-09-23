import Image from "next/image";

export default function EditorialImage({ preload = false }: { preload?: boolean }) {
  return <figure className="relative overflow-hidden rounded-[2rem] bg-[#DFE7D9]">
    <div className="relative aspect-[4/5] sm:aspect-[3/2] md:aspect-[4/5]">
      <Image src="/rooted-editorial.webp" alt="Sage and ivory shampoo bottles on a limestone shelf in soft tropical daylight" fill sizes="(max-width: 767px) 100vw, 50vw" preload={preload} className="object-cover object-[60%_center]" />
    </div>
    <figcaption className="absolute bottom-4 left-4 right-4 rounded-xl bg-ivory/95 px-4 py-3 text-xs text-forest">A little clarity for your daily ritual.<span className="mt-1 block text-[10px] text-muted">Original AI-created artwork · unbranded bottles</span></figcaption>
  </figure>;
}
