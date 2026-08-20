/**
 * What makes this prototype look like itself. The only file that differs
 * between the four skins besides the stylesheet.
 */

export const THEME = {
  id: 'neon',
  /** Shown next to the logo so the client can name the option they liked. */
  label: 'NEÓN',
  blurb: 'Cromo y verde eléctrico',
  logo: 'logo-neon.jpeg',
  logoAlt: 'MAIMBO',
  /** 'rail' puts navigation down the left edge; 'top' runs it across the header. */
  nav: 'rail' as 'rail' | 'top',
} as const
