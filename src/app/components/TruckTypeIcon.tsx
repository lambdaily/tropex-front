// Ilustraciones de tipos de camión (las mismas del signup de empresa).
// Un solo lugar para usarlas en signup, cuenta, etc.
// Acepta tanto las claves del signup ('chico'|'mediano'|'acoplado'|'semirremolque')
// como las del store ('camion-chico'|'camion-mediano'|'camion-acoplado'|'semirremolque').

type TruckKey = 'chico' | 'mediano' | 'acoplado' | 'semirremolque';

const DIMS: Record<TruckKey, [number, number]> = {
  chico: [70, 45],
  mediano: [80, 45],
  acoplado: [95, 45],
  semirremolque: [95, 45],
};

function normalize(type: string): TruckKey {
  const t = type.toLowerCase().replace('camion-', '').replace('camión-', '');
  if (t.startsWith('media')) return 'mediano';
  if (t.startsWith('acopl')) return 'acoplado';
  if (t.startsWith('semi')) return 'semirremolque';
  return 'chico';
}

interface TruckTypeIconProps {
  type: string;
  /** Alto en px (el ancho se calcula manteniendo proporción). */
  height?: number;
  color?: string;
}

export function TruckTypeIcon({ type, height = 45, color = '#1E5126' }: TruckTypeIconProps) {
  const key = normalize(type);
  const [vbW, vbH] = DIMS[key];
  const width = Math.round(height * (vbW / vbH));
  const sw = 2.5;

  const paths = (() => {
    switch (key) {
      case 'mediano':
        return (
          <>
            <rect x="8" y="17" width="13" height="15" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <rect x="22" y="15" width="45" height="17" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <circle cx="16" cy="34" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="48" cy="34" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="58" cy="34" r="4" fill="white" stroke={color} strokeWidth={sw} />
          </>
        );
      case 'acoplado':
        return (
          <>
            <rect x="5" y="18" width="11" height="13" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <rect x="17" y="16" width="22" height="15" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <line x1="39" y1="23" x2="45" y2="23" stroke={color} strokeWidth={sw} />
            <circle cx="42" cy="23" r="2" fill={color} />
            <rect x="45" y="15" width="38" height="16" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <circle cx="13" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="33" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="58" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="75" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
          </>
        );
      case 'semirremolque':
        return (
          <>
            <rect x="5" y="19" width="14" height="12" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <rect x="18" y="13" width="65" height="18" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <line x1="18" y1="25" x2="18" y2="31" stroke={color} strokeWidth={sw} />
            <circle cx="13" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="52" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="62" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="72" cy="33" r="4" fill="white" stroke={color} strokeWidth={sw} />
          </>
        );
      default: // chico
        return (
          <>
            <rect x="10" y="18" width="12" height="14" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <rect x="24" y="16" width="28" height="16" fill={color} stroke={color} strokeWidth={sw} rx="1" />
            <circle cx="18" cy="34" r="4" fill="white" stroke={color} strokeWidth={sw} />
            <circle cx="46" cy="34" r="4" fill="white" stroke={color} strokeWidth={sw} />
          </>
        );
    }
  })();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${vbW} ${vbH}`} style={{ display: 'block' }}>
      {paths}
    </svg>
  );
}
