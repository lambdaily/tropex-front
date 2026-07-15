import { useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { useDemoStore, type DemoOrder, type DemoOffer } from '../../../../store/demoStore';
import {
  C, DISPLAY, formatGs, timeAgo, SectionHeader, DataTable, StatusBadge, DetailSheet, Field, EmptyState, Card, type Column,
} from '../kit';

const orderStatusMeta: Record<string, { label: string; color: string }> = {
  new: { label: 'Nueva', color: C.verdeClaro },
  partial: { label: 'Parcial', color: C.naranja },
  accepted: { label: 'Adjudicada', color: C.verde },
};
const offerStatusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: C.naranja },
  'rancher-countered': { label: 'Contraoferta', color: '#1D4ED8' },
  accepted: { label: 'Aceptada', color: C.verde },
  rejected: { label: 'Rechazada', color: C.rojo },
};

export function MarketplaceSection() {
  const { orders, offers } = useDemoStore();
  const [sel, setSel] = useState<DemoOrder | null>(null);

  const offersFor = (orderId: string) => offers.filter(o => o.orderId === orderId);

  const columns: Column<DemoOrder>[] = [
    { key: 'id', header: 'Solicitud', value: o => o.id, render: o => <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{o.id}</span> },
    { key: 'route', header: 'Ruta', value: o => o.origin, render: o => <div><div style={{ fontWeight: 600 }}>{o.origin} → {o.destination}</div><div style={{ fontSize: 12, color: C.gris }}>{o.heads} {o.cattleTypeLabel} · {o.distance} km</div></div> },
    { key: 'rancher', header: 'Ganadero', value: o => o.rancherName, hideMobile: true },
    { key: 'market', header: 'Ref. mercado', align: 'right', value: o => o.marketPrice, hideMobile: true, render: o => formatGs(o.marketPrice) },
    { key: 'offers', header: 'Ofertas', align: 'right', hideMobile: true, render: o => offersFor(o.id).length },
    { key: 'status', header: 'Estado', value: o => orderStatusMeta[o.status]?.label ?? o.status, render: o => <StatusBadge label={orderStatusMeta[o.status]?.label ?? o.status} color={orderStatusMeta[o.status]?.color ?? C.gris} /> },
  ];

  return (
    <div>
      <SectionHeader title="Mercado" subtitle="Solicitudes de transporte y negociaciones activas" />
      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No hay solicitudes activas" description="Cuando un ganadero publica una solicitud de transporte (desde su panel), aparece acá con sus ofertas y el historial de negociación en tiempo real." />
      ) : (
        <DataTable columns={columns} rows={orders} getRowId={o => o.id} onRowClick={setSel} searchKeys={['id', 'origin', 'destination', 'rancherName']} searchPlaceholder="Buscar solicitud, ruta o ganadero…" />
      )}

      {sel && (
        <DetailSheet open={!!sel} onClose={() => setSel(null)} title={sel.id} subtitle={`${sel.origin} → ${sel.destination}`} statusNode={<StatusBadge label={orderStatusMeta[sel.status]?.label ?? sel.status} color={orderStatusMeta[sel.status]?.color ?? C.gris} />} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Ganadero" value={sel.rancherName} />
              <Field label="Cabezas" value={`${sel.heads} ${sel.cattleTypeLabel}`} />
              <Field label="Distancia" value={`${sel.distance} km`} />
              <Field label="Ref. mercado" value={<span style={{ fontWeight: 700, color: C.verde }}>{formatGs(sel.marketPrice)}</span>} />
              <Field label="Retiro" value={sel.pickupDate} />
              <Field label="Publicada" value={timeAgo(sel.createdAt)} />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: C.texto, marginBottom: 10 }}>Ofertas ({offersFor(sel.id).length})</div>
              {offersFor(sel.id).length === 0 ? (
                <div style={{ fontSize: 13, color: C.gris, padding: '10px 0' }}>Sin ofertas todavía.</div>
              ) : offersFor(sel.id).map(off => <OfferCard key={off.id} offer={off} />)}
            </div>
          </div>
        </DetailSheet>
      )}
    </div>
  );
}

function OfferCard({ offer }: { offer: DemoOffer }) {
  return (
    <Card style={{ padding: '13px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div><div style={{ fontSize: 13.5, fontWeight: 700, color: C.texto }}>{offer.transporterName}</div><div style={{ fontSize: 11.5, color: C.gris }}>{offer.transporterType === 'empresa' ? 'Empresa' : 'Transportista'}</div></div>
        <StatusBadge label={offerStatusMeta[offer.status]?.label ?? offer.status} color={offerStatusMeta[offer.status]?.color ?? C.gris} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.verde, marginTop: 8 }}>{formatGs(offer.amount)}</div>
      {offer.rounds.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borde}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.grisClaro, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Negociación</div>
          {offer.rounds.map(r => (
            <div key={r.round} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.gris, marginBottom: 3 }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', color: C.grisClaro }}>R{r.round}</span>
              <span style={{ fontWeight: 600, color: r.by === 'rancher' ? '#1D4ED8' : C.naranja }}>{r.by === 'rancher' ? 'Ganadero' : 'Transportista'}</span>
              <ArrowRight size={11} />
              <span style={{ fontWeight: 700, color: C.texto }}>{formatGs(r.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
