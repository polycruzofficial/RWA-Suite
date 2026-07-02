'use client'

import React from 'react'
import Image from 'next/image'
import { encodePublicAssetPath, PARTNER_LOGO_GROUPS } from '@/lib/partner-logos'

function isSvgPath(src: string): boolean {
  return /\.svg$/i.test(src.split('?')[0] ?? '')
}

const PARTNER_LOGOS_FLAT = PARTNER_LOGO_GROUPS
  .filter((group) => group.id === 'new-partner-logo')
  .flatMap((group) =>
    group.logos.map((logo) => ({ ...logo, key: `${group.id}-${logo.src}` })),
  )

export function PartnerLogoGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {PARTNER_LOGOS_FLAT.map((logo) => {
        const src = encodePublicAssetPath(logo.src)
        const unopt = isSvgPath(logo.src)
        return (
          <div
            key={logo.key}
            className="flex min-h-[52px] items-center justify-center px-2 py-2 sm:min-h-14"
          >
            <div className="relative h-12 w-full max-w-[148px] sm:h-14">
              <Image
                src={src}
                alt={logo.alt}
                fill
                className="object-contain object-center brightness-0 opacity-40 hover:opacity-100 transition-opacity duration-300"
                sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 148px"
                unoptimized={unopt}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
