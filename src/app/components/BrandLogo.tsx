// Logo de marca TROPEX (un solo lugar para toda la app).
// Archivos en public/: tropex-logo.png (blanco, para fondos oscuros),
// tropex-logo-dark.png (oscuro, para fondos claros), tropex-isotipo.png (TX).

interface BrandLogoProps {
  /** Altura del logo en px. */
  height?: number;
  className?: string;
  /** 'light' = versión blanca (fondos oscuros), 'dark' = versión oscura (fondos claros). */
  variant?: 'light' | 'dark';
}

export function BrandLogo({ height = 36, className, variant = 'light' }: BrandLogoProps) {
  const src = variant === 'dark' ? '/tropex-logo-dark.png' : '/tropex-logo.png';
  return (
    <img src={src} alt="TROPEX" className={className} style={{ height, width: 'auto', display: 'block' }} />
  );
}
