// "Mis envíos" del ganadero: secciones por estado (en tránsito, aceptados,
// esperando transportista, y completos esperando liquidación). Los completos
// abren el flujo de liquidación (calificar + pagar + comprobante → esperando verificación).
import { useMemo, useState } from 'react';
import { Truck, CheckCircle2, Clock, Package, Star } from 'lucide-react';
import { C, DISPLAY, BODY, MONO, formatGs } from './admin/kit';
import { useIsMobile } from '../ui/use-mobile';
import { GanaderoLiquidacionFlow } from '../payments/GanaderoLiquidacionFlow';
import { useShipments } from '@/features/shipments';
import { isMarketplaceDemoEnabled, useRancherOffers } from '@/features/transport-marketplace';

type Envio = { id: string; route: string; heads: number; cattle: string; transportista?: string; sub?: string; freight?: number };

const SECTIONS: { key: string; title: string; color: string; items: Envio[] }[] = [
  { key: 'transito', title: 'En tránsito', color: C.naranja, items: [
    { id: 'ENV-052', route: 'Filadelfia → Asunción', heads: 45, cattle: 'Gordos', transportista: 'J. Giménez', sub: '65% · ETA 2 h' },
  ] },
  { key: 'aceptados', title: 'Aceptados · por retirar', color: '#2563EB', items: [
    { id: 'ENV-051', route: 'Loma Plata → Villa Hayes', heads: 30, cattle: 'Desmamantes', transportista: 'D. Areco', sub: 'Retiro 22/03 · 06:00' },
  ] },
  { key: 'esperando', title: 'Esperando transportista', color: C.grisClaro, items: [
    { id: 'ENV-050', route: 'Concepción → Asunción', heads: 60, cattle: 'Gordos', sub: '3 ofertas recibidas' },
    { id: 'ENV-048', route: 'Mariscal E. → Central', heads: 38, cattle: 'Desmamantes', sub: '1 oferta · negociando' },
  ] },
  { key: 'liquidacion', title: 'Completos · esperando liquidación', color: '#B45309', items: [
    { id: 'ENV-046', route: 'Filadelfia → Asunción', heads: 45, cattle: 'Gordos', transportista: 'J. Giménez', freight: 8940000 },
  ] },
];

export function MisEnviosView({ compact }: { compact?: boolean }) {
  const isMobile = useIsMobile();
  const [settled, setSettled] = useState<Set<string>>(new Set());
  const [liq, setLiq] = useState<Envio | null>(null);
  const { data: shipments = [] } = useShipments();
  const { data: rancherOffers = [] } = useRancherOffers();

  const sections = useMemo(() => {
    if (shipments.length === 0) return isMarketplaceDemoEnabled ? SECTIONS : [];

    const offerCountByRequest = rancherOffers.reduce<Record<number, number>>((counts, item) => {
      counts[item.request.id] = (counts[item.request.id] || 0) + 1;
      return counts;
    }, {});

    const formatPickupDate = (date: string) => {
      const [year, month, day] = date.split('-');
      return year && month && day ? `${day}/${month}/${year}` : date;
    };

    const toEnvio = (shipment: typeof shipments[number]): Envio => {
      const id = `SOL-${String(shipment.id).padStart(4, '0')}`;
      const offersCount = offerCountByRequest[shipment.id] || 0;
      const sub = offersCount > 0
        ? `${offersCount} oferta${offersCount === 1 ? '' : 's'} recibida${offersCount === 1 ? '' : 's'}`
        : `Retiro ${formatPickupDate(shipment.pickup_date)}`;

      return {
        id,
        route: `${shipment.origin} → ${shipment.destination}`,
        heads: shipment.heads,
        cattle: shipment.cattle_type_label,
        sub,
      };
    };

    const sectionsByStatus = [
      {
        key: 'aceptados',
        title: 'Aceptados · por retirar',
        color: '#2563EB',
        items: shipments.filter((shipment) => shipment.status === 'accepted').map(toEnvio),
      },
      {
        key: 'esperando',
        title: 'Esperando transportista',
        color: C.grisClaro,
        items: shipments.filter((shipment) => shipment.status === 'new' || shipment.status === 'partial').map(toEnvio),
      },
    ];

    return sectionsByStatus.filter((section) => section.items.length > 0);
  }, [rancherOffers, shipments]);

  return (
    <div style={{ padding: compact ? '4px 0 40px' : '8px 0 24px', fontFamily: BODY }}>
      {!compact && (
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: C.texto, margin: 0 }}>Mis envíos</h1>
          <p style={{ fontSize: 14, color: C.gris, margin: '6px 0 0' }}>Tus envíos por estado, hasta el cierre y la liquidación.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map(sec => (
          <div key={sec.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color }} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: C.texto, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sec.title}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.grisClaro, background: '#F3F4F6', padding: '2px 8px', borderRadius: 99 }}>{sec.items.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: !isMobile && !compact ? 'repeat(2, 1fr)' : '1fr', gap: 10 }}>
              {sec.items.map(e => {
                const isSettled = settled.has(e.id);
                return (
                  <div key={e.id} style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.borde}`, padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.grisClaro }}>{e.id}</span>
                      {sec.key === 'liquidacion' && isSettled && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: C.naranja, background: `${C.naranja}18`, border: `1px solid ${C.naranja}33`, padding: '3px 8px', borderRadius: 99 }}><Clock size={11} /> Esperando verificación</span>
                      )}
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.texto, marginTop: 3 }}>{e.route}</div>
                    <div style={{ fontSize: 12, color: C.gris, marginTop: 1 }}>
                      {e.heads} {e.cattle}{e.transportista ? ` · ${e.transportista}` : ''}{e.freight ? ` · ${formatGs(e.freight)}` : ''}
                    </div>
                    {e.sub && <div style={{ fontSize: 11.5, color: sec.color, fontWeight: 600, marginTop: 5 }}>{e.sub}</div>}

                    {sec.key === 'liquidacion' && !isSettled && (
                      <button onClick={() => setLiq(e)} style={{ marginTop: 11, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 10, border: 'none', background: C.verde, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                        <Star size={15} /> Calificar y pagar
                      </button>
                    )}
                    {sec.key === 'liquidacion' && isSettled && (
                      <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.gris, background: '#FAFAF8', borderRadius: 9, padding: '9px 11px' }}>
                        <CheckCircle2 size={15} color={C.verde} /> Calificaste y enviaste el comprobante. Verificamos tu pago (hasta 24 h).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {liq && (
        <GanaderoLiquidacionFlow
          shipmentId={liq.id} route={liq.route} transportista={liq.transportista || 'el transportista'} freight={liq.freight || 0}
          onClose={() => setLiq(null)}
          onSettled={() => setSettled(s => new Set(s).add(liq.id))}
        />
      )}
    </div>
  );
}
