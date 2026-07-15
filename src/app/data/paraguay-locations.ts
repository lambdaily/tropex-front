// Coordenadas aproximadas (lat, lng) de localidades paraguayas usadas en el demo.
// Sirven para ubicar orígenes/destinos en el mapa cuando solo tenemos el nombre.

export const CITY_COORDS: Record<string, [number, number]> = {
  'Asunción': [-25.28, -57.63],
  'Filadelfia': [-22.35, -60.03],
  'Loma Plata': [-22.38, -59.84],
  'Neuland': [-22.68, -60.12],
  'Villa Hayes': [-25.09, -57.52],
  'Concepción': [-23.40, -57.43],
  'Puerto Casado': [-22.29, -57.94],
  'Mariscal Estigarribia': [-22.03, -60.61],
  'Coronel Oviedo': [-25.45, -56.44],
  'San Pedro': [-24.10, -57.08],
  'Pozo Colorado': [-23.49, -58.79],
  'Pedro Juan Caballero': [-22.55, -55.73],
};

/** Busca las coords de una localidad por nombre (tolera sufijos tipo "Asunción - Frigorífico"). */
export function coordsForCity(name: string | undefined): [number, number] | null {
  if (!name) return null;
  const base = name.split(' - ')[0].trim();
  if (CITY_COORDS[base]) return CITY_COORDS[base];
  // match parcial por si viene con texto extra
  const key = Object.keys(CITY_COORDS).find((c) => base.startsWith(c) || c.startsWith(base));
  return key ? CITY_COORDS[key] : null;
}

/** Interpola un punto entre origen y destino según un progreso 0..100 (para el camión en ruta). */
export function interpolate(
  origin: [number, number],
  destination: [number, number],
  progressPercent: number,
): [number, number] {
  const t = Math.max(0, Math.min(100, progressPercent)) / 100;
  return [
    origin[0] + (destination[0] - origin[0]) * t,
    origin[1] + (destination[1] - origin[1]) * t,
  ];
}
