import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { DollarSign, Wallet, Clock, TrendingUp } from 'lucide-react';
import { useAdminStore, type AdminTransaction } from '../../../../data/admin-data';
import {
  C, BODY, DISPLAY, formatGs, formatGsShort, SectionHeader, DataTable, StatCard, ChartCard, StatusBadge, Card,
  txnStatusMeta, type Column,
} from '../kit';

const txnTypeMeta: Record<string, { label: string; color: string }> = {
  commission: { label: 'Comisión', color: C.verde },
  payout: { label: 'Payout', color: C.naranja },
  refund: { label: 'Reembolso', color: C.gris },
};

export function FinanceSection() {
  const { transactions, kpiSeries, config } = useAdminStore();
  const last = kpiSeries[kpiSeries.length - 1];

  const commissionMonth = transactions.filter(t => t.type === 'commission').reduce((s, t) => s + t.commissionAmount, 0);
  const payoutsPending = transactions.filter(t => t.type === 'payout' && t.status === 'pending').reduce((s, t) => s + t.netAmount, 0);
  const gmvTotal = transactions.reduce((s, t) => s + t.grossAmount, 0);

  // Ranking por transportista (payouts)
  const byTransporter = Object.values(transactions.filter(t => t.type === 'payout').reduce((acc, t) => {
    acc[t.counterparty] = acc[t.counterparty] || { name: t.counterparty, gross: 0, net: 0, trips: 0 };
    acc[t.counterparty].gross += t.grossAmount; acc[t.counterparty].net += t.netAmount; acc[t.counterparty].trips += 1;
    return acc;
  }, {} as Record<string, { name: string; gross: number; net: number; trips: number }>)).sort((a, b) => b.gross - a.gross);

  const txColumns: Column<AdminTransaction>[] = [
    { key: 'id', header: 'ID', value: t => t.id, render: t => <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{t.id}</span> },
    { key: 'type', header: 'Tipo', value: t => txnTypeMeta[t.type].label, render: t => <StatusBadge label={txnTypeMeta[t.type].label} color={txnTypeMeta[t.type].color} /> },
    { key: 'counterparty', header: 'Contraparte', value: t => t.counterparty, hideMobile: true },
    { key: 'tripId', header: 'Viaje', value: t => t.tripId || '', hideMobile: true, render: t => <span style={{ fontFamily: 'ui-monospace, monospace', color: C.gris }}>{t.tripId || '—'}</span> },
    { key: 'gross', header: 'Bruto', align: 'right', value: t => t.grossAmount, hideMobile: true, render: t => formatGs(t.grossAmount) },
    { key: 'commission', header: 'Comisión', align: 'right', value: t => t.commissionAmount, render: t => <span style={{ fontWeight: 700, color: C.verde }}>{t.commissionAmount ? formatGs(t.commissionAmount) : '—'}</span> },
    { key: 'status', header: 'Estado', value: t => txnStatusMeta[t.status].label, render: t => <StatusBadge label={txnStatusMeta[t.status].label} color={txnStatusMeta[t.status].color} /> },
  ];

  const tooltipStyle = { background: C.noche, border: 'none', borderRadius: 10, fontSize: 12, color: '#fff', fontFamily: BODY };

  return (
    <div>
      <SectionHeader title="Finanzas" subtitle={`Comisión TROPEX al ${config.commissionRate}% sobre GMV`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="GMV del mes" value={formatGsShort(last.gmv)} icon={TrendingUp} accent={C.verde} trend={kpiSeries.map(k => k.gmv)} />
        <StatCard label="Comisión acumulada" value={formatGsShort(commissionMonth)} icon={DollarSign} accent={C.naranja} />
        <StatCard label="Payouts pendientes" value={formatGsShort(payoutsPending)} icon={Clock} accent={C.naranja} delta={{ text: `${transactions.filter(t => t.type === 'payout' && t.status === 'pending').length} por pagar`, dir: 'flat' }} />
        <StatCard label="Procesado (total)" value={formatGsShort(gmvTotal)} icon={Wallet} accent={C.verde} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 14, marginBottom: 20 }} className="fin-grid">
        <ChartCard title="Comisión por mes" subtitle="Evolución de ingresos TROPEX">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kpiSeries} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.gris }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatGs(v), 'Comisión']} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="revenue" radius={[5, 5, 0, 0]} maxBarSize={42}>
                {kpiSeries.map((_, i) => <Cell key={i} fill={i === kpiSeries.length - 1 ? C.naranja : C.verde} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card style={{ padding: '18px' }}>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: C.texto, margin: '0 0 14px' }}>Top transportistas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byTransporter.slice(0, 5).map((t, i) => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: i === 0 ? C.naranja : `${C.verde}14`, color: i === 0 ? '#fff' : C.verde, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: C.texto, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div><div style={{ fontSize: 11.5, color: C.gris }}>{t.trips} viaje{t.trips !== 1 ? 's' : ''}</div></div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13.5, color: C.texto }}>{formatGsShort(t.gross)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 16, color: C.texto, margin: 0 }}>Transacciones</h3>
      </div>
      <DataTable columns={txColumns} rows={transactions} getRowId={t => t.id} searchKeys={['id', 'counterparty', 'tripId']} searchPlaceholder="Buscar transacción o contraparte…" pageSize={10} />
      <style>{`@media (max-width: 900px){ .fin-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
