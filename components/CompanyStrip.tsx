"use client";

/**
 * Landing strip of recognizable companies currently hiring, from
 * /api/jobs/stats `topCompanies` (lowercase slugs → display name + logo via
 * lib/companies.ts). Each chip shows a favicon, falling back to a monogram when
 * there's no domain or the favicon fails to load.
 */

import { useState } from "react";
import Image from "next/image";
import { companyDisplay } from "@/lib/companies";

function CompanyChip({ slug }: { slug: string }) {
  const { name, logoUrl } = companyDisplay(slug);
  const [failed, setFailed] = useState(false);
  const showLogo = logoUrl && !failed;

  return (
    <span className="shadow-hard-sm inline-flex items-center gap-2 rounded-full border-2 border-stone-800/90 bg-white py-1.5 pl-2 pr-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-white text-[11px] font-extrabold uppercase text-amber-800">
        {showLogo ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            width={24}
            height={24}
            unoptimized
            onError={() => setFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          name.charAt(0)
        )}
      </span>
      <span className="text-sm font-extrabold text-stone-700">{name}</span>
    </span>
  );
}

export default function CompanyStrip({ companies }: { companies: string[] }) {
  if (companies.length === 0) return null;

  return (
    <section className="pb-14 md:pb-16">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400">
        Names you&apos;ll recognize
      </p>
      <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-stone-800">
        Hiring on RoleOwl right now
      </h2>
      <div className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2.5">
        {companies.map((slug) => (
          <CompanyChip key={slug} slug={slug} />
        ))}
      </div>
    </section>
  );
}
