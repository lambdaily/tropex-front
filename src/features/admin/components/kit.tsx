import { useMemo, useState, type ReactNode, type CSSProperties } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/app/components/ui/use-mobile";

// ════════════ Tokens de marca ════════════
export const C = {
  verde: "#1E5126",
  naranja: "#F58718",
  noche: "#08221A",
  neutro: "#F6F1E8",
  verde2: "#2d6b38",
  rojo: "#d4183d",
  amarillo: "#EAB308",
  verdeClaro: "#22C55E",
  gris: "#6b7280",
  grisClaro: "#9CA3AF",
  borde: "rgba(0,0,0,0.07)",
  card: "#ffffff",
  texto: "#0c1f17",
};
export const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
export const BODY = "'IBM Plex Sans', system-ui, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

// ════════════ utils ════════════
export const formatGs = (n: number) =>
  "₲ " + Math.round(n).toLocaleString("es-PY");
export const formatGsShort = (n: number) => {
  if (n >= 1_000_000_000) return "₲ " + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "₲ " + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "₲ " + Math.round(n / 1_000) + "k";
  return "₲ " + n;
};
export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "hace instantes";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

// ════════════ Card base ════════════
export function Card({
  children,
  style,
  className,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: C.card,
        borderRadius: 16,
        border: `1px solid ${C.borde}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ════════════ SectionHeader ════════════
export function SectionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 22,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 30px)",
            letterSpacing: "-0.02em",
            color: C.texto,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: C.gris, margin: "5px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

// ════════════ StatusBadge ════════════
export function StatusBadge({
  label,
  color,
  soft = true,
}: {
  label: string;
  color: string;
  soft?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
        padding: "3px 10px",
        borderRadius: 99,
        color: soft ? color : "#fff",
        background: soft ? `${color}18` : color,
        border: soft ? `1px solid ${color}33` : "none",
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: color }}
      />
      {label}
    </span>
  );
}

// ════════════ StatCard ════════════
export function StatCard({
  label,
  value,
  icon: Icon,
  accent = C.verde,
  delta,
  trend,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  delta?: { text: string; dir: "up" | "down" | "flat" };
  trend?: number[];
  onClick?: () => void;
}) {
  const deltaColor =
    delta?.dir === "up"
      ? C.verdeClaro
      : delta?.dir === "down"
        ? C.rojo
        : C.grisClaro;
  return (
    <Card
      onClick={onClick}
      style={{
        padding: "16px 18px",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .15s ease, box-shadow .15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: `${accent}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={19} color={accent} />
        </div>
        {trend && trend.length > 1 && <Sparkline data={trend} color={accent} />}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 24,
          color: C.texto,
          marginTop: 12,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}
      >
        <span style={{ fontSize: 12.5, color: C.gris }}>{label}</span>
        {delta && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: deltaColor }}>
            {delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : "→"}{" "}
            {delta.text}
          </span>
        )}
      </div>
    </Card>
  );
}

// Sparkline SVG simple (sin libs) para StatCard
export function Sparkline({
  data,
  color,
  width = 64,
  height = 26,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ════════════ ChartCard ════════════
export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Card style={{ padding: "18px 18px 8px", ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 15,
              color: C.texto,
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: 12.5, color: C.gris, margin: "3px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}

// ════════════ EmptyState ════════════
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "54px 20px" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${C.verde}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Icon size={26} color={C.verde} />
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 17,
          color: C.texto,
        }}
      >
        {title}
      </div>
      {description && (
        <p
          style={{
            fontSize: 14,
            color: C.gris,
            maxWidth: 380,
            margin: "6px auto 0",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

// ════════════ Botones ════════════
export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled,
  style,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md";
  icon?: LucideIcon;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const pad = size === "sm" ? "7px 12px" : "10px 16px";
  const fs = size === "sm" ? 12.5 : 14;
  const variants: Record<string, CSSProperties> = {
    primary: { background: C.verde, color: "#fff", border: "none" },
    danger: { background: C.rojo, color: "#fff", border: "none" },
    outline: {
      background: "#fff",
      color: C.verde,
      border: `1.5px solid ${C.verde}`,
    },
    soft: { background: `${C.verde}12`, color: C.verde, border: "none" },
    ghost: { background: "transparent", color: C.gris, border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: fs,
        padding: pad,
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        transition: "opacity .15s",
        ...variants[variant],
        ...style,
      }}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

// ════════════ DetailSheet (slide-over derecho) ════════════
export function DetailSheet({
  open,
  onClose,
  title,
  subtitle,
  statusNode,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  statusNode?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const isMobile = useIsMobile();
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(8,34,26,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? "100%" : width,
          maxWidth: "100%",
          background: C.neutro,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.2)",
          animation: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 20px",
            background: "#fff",
            borderBottom: `1px solid ${C.borde}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 19,
                  color: C.texto,
                  margin: 0,
                }}
              >
                {title}
              </h2>
              {statusNode}
            </div>
            {subtitle && (
              <p style={{ fontSize: 13, color: C.gris, margin: "4px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: "none",
              background: "#F3F4F6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={18} color={C.gris} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: "14px 20px",
              background: "#fff",
              borderTop: `1px solid ${C.borde}`,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Pequeño bloque etiqueta/valor para detalles
export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          color: C.grisClaro,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 700,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: C.texto, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

// ════════════ DataTable genérico ════════════
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number; // para sort y búsqueda
  align?: "left" | "right" | "center";
  width?: number | string;
  hideMobile?: boolean;
}
export interface TableFilter {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  searchKeys,
  searchPlaceholder = "Buscar…",
  filters,
  rightActions,
  pageSize = 12,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (r: T) => string;
  onRowClick?: (r: T) => void;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  filters?: TableFilter[];
  rightActions?: ReactNode;
  pageSize?: number;
}) {
  const isMobile = useIsMobile();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let r = rows;
    if (q.trim() && searchKeys) {
      const needle = q.toLowerCase();
      r = r.filter((row) =>
        searchKeys.some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(needle),
        ),
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.value) {
        r = [...r].sort((a, b) => {
          const va = col.value!(a),
            vb = col.value!(b);
          const cmp =
            typeof va === "number" && typeof vb === "number"
              ? va - vb
              : String(va).localeCompare(String(vb));
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return r;
  }, [rows, q, sortKey, sortDir, columns, searchKeys]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toolbar = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 14,
      }}
    >
      {searchKeys && (
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
          <Search
            size={15}
            color={C.grisClaro}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 12px 9px 32px",
              borderRadius: 10,
              border: `1px solid ${C.borde}`,
              background: "#fff",
              fontSize: 13.5,
              fontFamily: BODY,
              outline: "none",
              color: C.texto,
            }}
          />
        </div>
      )}
      {filters?.map((f) => (
        <select
          key={f.id}
          value={f.value}
          onChange={(e) => {
            f.onChange(e.target.value);
            setPage(0);
          }}
          style={{
            padding: "9px 10px",
            borderRadius: 10,
            border: `1px solid ${C.borde}`,
            background: "#fff",
            fontSize: 13,
            fontFamily: BODY,
            color: C.texto,
            cursor: "pointer",
          }}
        >
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      <div style={{ flex: 1 }} />
      {rightActions}
    </div>
  );

  const pager = pageCount > 1 && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
      }}
    >
      <span style={{ fontSize: 12.5, color: C.gris }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={safePage === 0}
          style={pagerBtn(safePage === 0)}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.texto,
            minWidth: 64,
            textAlign: "center",
          }}
        >
          {safePage + 1} / {pageCount}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={safePage >= pageCount - 1}
          style={pagerBtn(safePage >= pageCount - 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // ── Vista mobile: cards ──
  if (isMobile) {
    return (
      <div>
        {toolbar}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pageRows.map((row) => (
            <Card
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                padding: "13px 14px",
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {columns
                .filter((c) => !c.hideMobile)
                .map((c, i) => (
                  <div
                    key={c.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: i === 0 ? "0 0 6px" : "6px 0 0",
                      borderTop: i === 0 ? "none" : `1px solid ${C.borde}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        color: C.grisClaro,
                        fontWeight: 600,
                      }}
                    >
                      {c.header}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        color: C.texto,
                        textAlign: "right",
                      }}
                    >
                      {c.render
                        ? c.render(row)
                        : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </span>
                  </div>
                ))}
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: C.gris,
              fontSize: 14,
            }}
          >
            Sin resultados
          </div>
        )}
        {pager}
      </div>
    );
  }

  // ── Vista desktop: tabla ──
  return (
    <div>
      {toolbar}
      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#FAFAF8",
                  borderBottom: `1px solid ${C.borde}`,
                }}
              >
                {columns.map((c) => (
                  <th
                    key={c.key}
                    onClick={c.value ? () => toggleSort(c.key) : undefined}
                    style={{
                      textAlign: c.align || "left",
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.gris,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      cursor: c.value ? "pointer" : "default",
                      width: c.width,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        justifyContent:
                          c.align === "right" ? "flex-end" : "flex-start",
                      }}
                    >
                      {c.header}
                      {sortKey === c.key &&
                        (sortDir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className="admin-row"
                  style={{
                    borderBottom: `1px solid ${C.borde}`,
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "12px 16px",
                        fontSize: 13.5,
                        color: C.texto,
                        textAlign: c.align || "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.render
                        ? c.render(row)
                        : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: C.gris,
              fontSize: 14,
            }}
          >
            Sin resultados
          </div>
        )}
      </Card>
      {pager}
      <style>{`.admin-row:hover { background: #FAFAF8; }`}</style>
    </div>
  );
}

function pagerBtn(disabled: boolean): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${C.borde}`,
    background: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: C.texto,
  };
}

// ════════════ Mapas de estado → color/label ════════════
export const userStatusMeta: Record<string, { label: string; color: string }> =
  {
    pending: { label: "Pendiente", color: C.naranja },
    active: { label: "Activo", color: C.verdeClaro },
    suspended: { label: "Suspendido", color: C.amarillo },
    rejected: { label: "Rechazado", color: C.rojo },
  };
export const roleMeta: Record<string, { label: string; color: string }> = {
  ganadero: { label: "Ganadero", color: C.verde },
  empresa: { label: "Empresa", color: "#1D4ED8" },
  "owner-operator": { label: "Transportista", color: C.naranja },
  chofer: { label: "Chofer", color: C.verde2 },
};
export const incidentStatusMeta: Record<
  string,
  { label: string; color: string }
> = {
  open: { label: "Abierta", color: C.rojo },
  "in-progress": { label: "En curso", color: C.naranja },
  resolved: { label: "Resuelta", color: C.verdeClaro },
};
export const priorityMeta: Record<string, { label: string; color: string }> = {
  high: { label: "Alta", color: C.rojo },
  medium: { label: "Media", color: C.naranja },
  low: { label: "Baja", color: C.grisClaro },
};
export const txnStatusMeta: Record<string, { label: string; color: string }> = {
  paid: { label: "Pagado", color: C.verdeClaro },
  pending: { label: "Pendiente", color: C.naranja },
  failed: { label: "Fallido", color: C.rojo },
};
