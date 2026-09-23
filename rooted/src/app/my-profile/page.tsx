import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvisorAccount from "@/components/AdvisorAccount";

export default function MyProfilePage() {
  return <div className="min-h-screen bg-ivory"><Navbar /><main className="mx-auto max-w-4xl px-5 pb-20 pt-32"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">ROOTED account</p><h1 className="mt-3 font-serif text-5xl text-forest">Your saved profiles</h1><p className="mt-4 text-sm text-muted">Sign in with your verified email to view or delete your saved advisor results.</p><AdvisorAccount /><Link href="/shampoo-advisor" className="mt-8 inline-block text-sm text-forest underline">Explore the shampoo advisor →</Link></main><Footer /></div>;
}
