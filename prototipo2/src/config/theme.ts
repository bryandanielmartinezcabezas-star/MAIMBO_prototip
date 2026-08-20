/**
 * What makes this prototype look like itself. The only file that differs
 * between the four skins besides the stylesheet.
 */

export const THEME = {
  id: 'noir',
  /** Shown next to the logo so the client can name the option they liked. */
  label: 'NOIR',
  blurb: 'Editorial oscuro',
  logo: 'logo-word.jpg',
  logoAlt: 'MAINBO MODA',
  /** 'rail' puts navigation down the left edge; 'top' runs it across the header. */
  nav: 'top' as 'rail' | 'top',
} as const
