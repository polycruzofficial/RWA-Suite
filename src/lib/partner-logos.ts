/**
 * Partner logos served from `public/`. Subfolders mirror `public/<base>/<group>/`.
 */
export const PARTNER_ASSETS_BASE = '/images/partners' as const

export interface PartnerLogoItem {
  /** Path under public, e.g. `/images/partners/partner-logo/foo.png` */
  src: string
  alt: string
}

export interface PartnerLogoGroup {
  id: string
  logos: PartnerLogoItem[]
}

function p(group: string, file: string, alt: string): PartnerLogoItem {
  return {
    src: `${PARTNER_ASSETS_BASE}/${group}/${file}`,
    alt,
  }
}

/** URL-encode path segments for filenames with spaces or special characters. */
export function encodePublicAssetPath(path: string): string {
  const trimmed = path.startsWith('/') ? path.slice(1) : path
  return `/${trimmed.split('/').map(encodeURIComponent).join('/')}`
}

export const PARTNER_LOGO_GROUPS: PartnerLogoGroup[] = [
  {
    id: 'partner-logo',
    logos: [
      p('partner-logo', 'ackno-ledger.png', 'Ackno Ledger'),
      p('partner-logo', 'arteq.png', 'Arteq'),
      p('partner-logo', 'dtc.png', 'DTC'),
      p('partner-logo', 'eth-global.png', 'ETHGlobal'),
      p('partner-logo', 'Logo 09.png', 'Partner'),
      p('partner-logo', 'Logo 10.png', 'Partner'),
      p('partner-logo', 'Logo 11.png', 'Partner'),
      p('partner-logo', 'Logo 12.png', 'Partner'),
      p('partner-logo', 'Logo 13.png', 'Partner'),
      p('partner-logo', 'magic-square.png', 'Magic Square'),
      p('partner-logo', 'masterblox.png', 'Masterblox'),
      p('partner-logo', 'microsoft-for-startups.png', 'Microsoft for Startups'),
      p('partner-logo', 'prom.png', 'Prom'),
      p('partner-logo', 'rg.png', 'RG'),
      p('partner-logo', 'scotty beam.png', 'Scotty Beam'),
      p('partner-logo', 'twitterscan.png', 'TwitterScan'),
      p('partner-logo', 'venture-vault.png', 'Venture Vault'),
    ],
  },
  {
    id: 'new-partner-logo',
    logos: [
      p('new-partner-logo', 'Frame.svg', 'Partner'),
      p('new-partner-logo', 'Frame (1).svg', 'Partner'),
      p('new-partner-logo', 'Frame (2).svg', 'Partner'),
      p('new-partner-logo', 'Frame (5).svg', 'Partner'),
      p('new-partner-logo', 'Frame (6).svg', 'Partner'),
      p('new-partner-logo', 'Frame (7).svg', 'Partner'),
      p('new-partner-logo', 'Frame 238052.svg', 'Partner'),
      p('new-partner-logo', 'Frame 238055.svg', 'Partner'),
      p('new-partner-logo', 'Frame 238056.svg', 'Partner'),
      p('new-partner-logo', 'Frame 238059.svg', 'Partner'),
      p('new-partner-logo', 'Frame 238060.svg', 'Partner'),
      p('new-partner-logo', 'Frame 238061.svg', 'Partner'),
      p('new-partner-logo', 'idqLZW67RB_logos 1.svg', 'Partner'),
      p('new-partner-logo', 'Logo 10.svg', 'Partner'),
      p('new-partner-logo', 'Mask group (3).svg', 'Partner'),
      p('new-partner-logo', 'Mask group (5).svg', 'Partner'),
      p('new-partner-logo', 'Mask group (6).svg', 'Partner'),
      p('new-partner-logo', 'svg10.svg', 'Partner'),
      p('new-partner-logo', 'TDeFi-White 1.svg', 'TDeFi'),
    ],
  },
]
