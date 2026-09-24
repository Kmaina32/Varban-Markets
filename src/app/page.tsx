import Link from "next/link";
import Image from "next/image";
import { Shield, Database, Sliders, Cpu, ArrowRight } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F7F7F5]">
      {/* SECTION 1 - Hero */}
      <section className="relative bg-[#0A0A0A] text-white min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={placeholderImages.hero.url}
            alt="Varban Markets Terminal"
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholderImages.hero.hint}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0055FF] block mb-4">
              Varban Markets
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase mb-6 leading-[1.1]">
              Professional Trading for Global Markets.
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] mb-8 leading-relaxed max-w-2xl">
              Trade global markets using a professional system. Get clear results, reliable prices, and manage your money with ease using our high-performance trading tools.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-institutional-primary bg-[#0055FF] text-white border-[#0055FF] hover:bg-white hover:text-[#0055FF] px-8">
                Open Account
              </Link>
              <Link href="/markets" className="btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5 px-8">
                View Markets
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <Link href="/login" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-white transition-colors">
                Sign in to your account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - How we work */}
      <section className="py-24 bg-white border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-2">Our System</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A]">
                Global Market Access
              </h2>
            </div>
            <div className="lg:col-span-8 text-sm text-[#6B7280] space-y-6 leading-relaxed">
              <p>
                Varban Markets gives you a direct link to the world's financial markets. Our system provides reliable prices and fast trading across all asset classes, 24 hours a day.
              </p>
              <p>
                Every trade shows you the potential profit and risk before you start. We've built a system that gives you the control you need to trade with confidence and clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - Safety & Rules */}
      <section className="py-24 bg-white border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-2">Account Protection</span>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-6">Fixed Risk Trading</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              We use simple rules to protect your balance. Before you confirm any trade, you can see exactly how much you stand to win or lose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Shield className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Limited Risk</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">You can only lose the amount you put into a trade. There are no hidden fees or unexpected losses beyond your initial amount.</p>
            </div>
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Database className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Fair Prices</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">We record the exact price the moment you click trade. This ensures you always get a fair and honest result every time.</p>
            </div>
            <div className="border border-[#E4E4E4] p-8 bg-[#F7F7F5]">
              <Sliders className="w-6 h-6 text-[#0055FF] mb-6" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">Flexible Times</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">Choose a time that works for you. Place trades that last anywhere from one minute to a full day, depending on your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[#0055FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8">
            Start Trading with Varban Markets Today.
          </h3>
          <div className="flex justify-center gap-4">
            <Link href="/markets" className="btn-institutional-primary bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#141414] px-10">
              Explore Markets
            </Link>
            <Link href="/register" className="btn-institutional-secondary bg-white text-[#0A0A0A] border-white hover:bg-[#F7F7F5] px-10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
