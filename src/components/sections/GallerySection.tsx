"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

export function GallerySection() {
  const withImages = cms.projects.filter((p) => p.image);
  return (
    <section id="gallery" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
          08 · DELIVERY GALLERY
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Shipped <span className="neon-text">interfaces</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Screenshots of delivered products, sourced from the Notion delivery
          portfolio.
        </p>

        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {withImages.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <Link
                href={`/projects/${p.slug}`}
                className="group relative block overflow-hidden rounded-2xl skill-card"
              >
                <Image
                  src={p.image!}
                  alt={`${p.title} delivered interface`}
                  width={1200}
                  height={800}
                  className="h-auto w-full transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent p-4">
                  <p className="display text-sm text-[var(--text)]">{p.title}</p>
                  <p className="text-[11px] text-[var(--muted)]">{p.category}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
