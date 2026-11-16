import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="px-4 sm:px-6 lg:px-10 pt-44 pb-32 max-w-[1400px] mx-auto">
        <h1 className="font-kyiv tracking-[-0.04em] leading-[0.9] text-[clamp(48px,9vw,120px)]">This project isn&apos;t here</h1>
        <p className="mt-6 font-kyiv-sans text-[17px] text-brand-gray max-w-[44ch]">It may have been renamed or taken down. Everything that&apos;s live is on the work page.</p>
        <Link href="/work" className="inline-flex mt-8 h-12 items-center px-6 rounded-full bg-brand-purple text-white font-kyiv-sans text-[15px]">See all work</Link>
      </div>
    </SiteChrome>
  );
}
