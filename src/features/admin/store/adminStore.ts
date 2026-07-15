import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════
//  Store de datos para el panel de Admin (demo, en memoria).
//  Mismo patrón subscribe/notify que demoStore: se resetea al refrescar,
//  pero persiste mientras dura la sesión y entre cambios de sección.
// ════════════════════════════════════════════════════════════════════

export type AdminUserRole =
  "ganadero" | "empresa" | "owner-operator" | "chofer";
export type AdminUserStatus = "pending" | "active" | "suspended" | "rejected";

export interface AdminUser {
  id: string;
  name: string; // nombre de contacto / display
  legalName: string; // razón social (para chequeo RUC ↔ nombre)
  role: AdminUserRole;
  subType?: string; // frigorífico / consignataria / estancia / etc.
  status: AdminUserStatus;
  email: string;
  phone: string;
  ruc?: string;
  cedula?: string;
  address: string;
  department: string;
  registeredAt: number;
  documents: Record<string, boolean>;
  // extras según rol
  fleetSize?: number;
  headCount?: number;
  vehiclePlate?: string;
  establishmentName?: string;
  metrics: { trips: number; gmv: number; rating?: number };
}

export type IncidentType =
  "retraso" | "disputa" | "documento" | "mecanico" | "otro";
export type IncidentPriority = "high" | "medium" | "low";
export type IncidentStatus = "open" | "in-progress" | "resolved";

export interface AdminIncident {
  id: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  tripId?: string;
  reportedBy: string;
  reportedPhone?: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  assignee?: string;
}

export type TxnType = "commission" | "payout" | "refund";
export type TxnStatus = "pending" | "paid" | "failed";

export interface AdminTransaction {
  id: string;
  type: TxnType;
  status: TxnStatus;
  tripId?: string;
  counterparty: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  date: number;
}

export interface KpiPoint {
  label: string; // mes
  revenue: number; // comisión TROPEX (₲)
  gmv: number; // volumen transado (₲)
  trips: number;
  signups: number;
}

export type ActivityKind =
  "signup" | "trip" | "offer" | "incident" | "payout" | "verification";
export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
  at: number;
}

export interface AdminConfig {
  commissionRate: number; // % sobre GMV
  pricePerKmPerHead: number; // ₲
  senacsaFat: number;
  senacsaWeaned: number;
  maxRounds: number;
  autoApproveVerified: boolean;
  notifyIncidents: boolean;
  notifyPayouts: boolean;
}

export interface GanaderoDocumentType {
  id: string;
  code: string;
  label: string;
  required: boolean;
  active: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface GanaderoDocumentTypeInput {
  label: string;
  code?: string;
  required?: boolean;
  active?: boolean;
}

// ── helpers de tiempo (relativos al load) ──
const NOW = Date.now();
const H = 3600_000;
const D = 24 * H;

// ════════════════ SEEDS ════════════════

const _seedUsers: AdminUser[] = [
  // Pendientes de verificación
  {
    id: "USR-1042",
    name: "Estancia La Joya S.A.",
    legalName: "ARREND. GANADERA LA JOYA S.A.",
    role: "ganadero",
    subType: "Estancia",
    status: "pending",
    email: "admin@lajoya.com.py",
    phone: "+595 981 445566",
    ruc: "80012345-7",
    address: "Ruta Transchaco Km 412",
    department: "Boquerón",
    registeredAt: NOW - 6 * H,
    documents: { ruc: true, senacsa: true, establishment: true, cedula: false },
    establishmentName: "LA JOYA",
    headCount: 3200,
    metrics: { trips: 0, gmv: 0 },
  },
  {
    id: "USR-1043",
    name: "Transportes del Chaco SRL",
    legalName: "TRANSPORTES DEL CHACO S.R.L.",
    role: "empresa",
    subType: "Flota",
    status: "pending",
    email: "flota@tchaco.com.py",
    phone: "+595 971 220011",
    ruc: "80098765-3",
    address: "Av. Artigas 2450, Asunción",
    department: "Central",
    registeredAt: NOW - 9 * H,
    documents: { ruc: true, transport: true, insurance: true, license: false },
    fleetSize: 8,
    metrics: { trips: 0, gmv: 0 },
  },
  {
    id: "USR-1044",
    name: "Ramón Acuña",
    legalName: "Ramón Acuña Benítez",
    role: "owner-operator",
    status: "pending",
    email: "racuna@gmail.com",
    phone: "+595 985 778899",
    cedula: "3.221.456",
    ruc: "3221456-9",
    address: "Concepción centro",
    department: "Concepción",
    registeredAt: NOW - 22 * H,
    documents: { ruc: true, cedula: true, transport: true, insurance: false },
    vehiclePlate: "BFG-447",
    metrics: { trips: 0, gmv: 0 },
  },
  {
    id: "USR-1045",
    name: "Diego Closs",
    legalName: "Diego Closs",
    role: "chofer",
    status: "pending",
    email: "dcloss@gmail.com",
    phone: "+595 983 112244",
    cedula: "4.556.778",
    address: "Loma Plata",
    department: "Boquerón",
    registeredAt: NOW - 28 * H,
    documents: { cedula: true, license: true, senacsa: false },
    metrics: { trips: 0, gmv: 0 },
  },
  {
    id: "USR-1046",
    name: "Frigorífico Norte",
    legalName: "FRIGONORTE S.A.",
    role: "ganadero",
    subType: "Frigorífico",
    status: "pending",
    email: "compras@frigonorte.com.py",
    phone: "+595 982 334455",
    ruc: "80055443-1",
    address: "Ruta 5 Km 12, Concepción",
    department: "Concepción",
    registeredAt: NOW - 2 * D,
    documents: { ruc: true, senacsa: true, establishment: true },
    metrics: { trips: 0, gmv: 0 },
  },

  // Activos — ganaderos
  {
    id: "USR-0188",
    name: "Estancia San Pedro",
    legalName: "GANADERA SAN PEDRO S.A.",
    role: "ganadero",
    subType: "Estancia",
    status: "active",
    email: "op@sanpedro.com.py",
    phone: "+595 981 456789",
    ruc: "80011222-5",
    address: "Filadelfia",
    department: "Boquerón",
    registeredAt: NOW - 120 * D,
    documents: { ruc: true, senacsa: true, establishment: true },
    establishmentName: "SAN PEDRO",
    headCount: 5400,
    metrics: { trips: 38, gmv: 64_500_000, rating: 4.9 },
  },
  {
    id: "USR-0204",
    name: "Estancia La Esperanza",
    legalName: "AGROGANADERA LA ESPERANZA S.A.",
    role: "ganadero",
    subType: "Estancia",
    status: "active",
    email: "admin@laesperanza.com.py",
    phone: "+595 981 667788",
    ruc: "80022111-9",
    address: "Pozo Colorado",
    department: "Presidente Hayes",
    registeredAt: NOW - 90 * D,
    documents: { ruc: true, senacsa: true, establishment: true },
    establishmentName: "LA ESPERANZA",
    headCount: 2800,
    metrics: { trips: 21, gmv: 33_200_000, rating: 4.7 },
  },
  {
    id: "USR-0233",
    name: "Cooperativa Neuland",
    legalName: "COOP. NEULAND LTDA.",
    role: "ganadero",
    subType: "Cooperativa",
    status: "active",
    email: "ganaderia@neuland.com.py",
    phone: "+595 985 101010",
    ruc: "80003344-2",
    address: "Neuland",
    department: "Boquerón",
    registeredAt: NOW - 200 * D,
    documents: { ruc: true, senacsa: true, establishment: true },
    establishmentName: "NEULAND",
    headCount: 9100,
    metrics: { trips: 52, gmv: 88_900_000, rating: 4.8 },
  },

  // Activos — empresas
  {
    id: "USR-0301",
    name: "Logística Paraguay SRL",
    legalName: "LOGÍSTICA PARAGUAY S.R.L.",
    role: "empresa",
    subType: "Flota",
    status: "active",
    email: "ops@logipar.com.py",
    phone: "+595 971 445566",
    ruc: "80044556-7",
    address: "Mariano Roque Alonso",
    department: "Central",
    registeredAt: NOW - 150 * D,
    documents: { ruc: true, transport: true, insurance: true, license: true },
    fleetSize: 14,
    metrics: { trips: 96, gmv: 142_000_000, rating: 4.6 },
  },
  {
    id: "USR-0312",
    name: "Transganado SA",
    legalName: "TRANSGANADO S.A.",
    role: "empresa",
    subType: "Flota",
    status: "active",
    email: "flota@transganado.com.py",
    phone: "+595 971 778899",
    ruc: "80066778-4",
    address: "Limpio",
    department: "Central",
    registeredAt: NOW - 80 * D,
    documents: { ruc: true, transport: true, insurance: true, license: true },
    fleetSize: 9,
    metrics: { trips: 61, gmv: 97_500_000, rating: 4.5 },
  },

  // Activos — owner-operators
  {
    id: "USR-0420",
    name: "Carlos Mendez",
    legalName: "Carlos Mendez Rojas",
    role: "owner-operator",
    status: "active",
    email: "cmendez@gmail.com",
    phone: "+595 981 123456",
    cedula: "2.118.334",
    ruc: "2118334-1",
    address: "Asunción",
    department: "Central",
    registeredAt: NOW - 110 * D,
    documents: { ruc: true, cedula: true, transport: true, insurance: true },
    vehiclePlate: "ABC-123",
    metrics: { trips: 142, gmv: 58_400_000, rating: 4.8 },
  },
  {
    id: "USR-0421",
    name: "María González",
    legalName: "María González Vera",
    role: "owner-operator",
    status: "active",
    email: "mgonzalez@gmail.com",
    phone: "+595 981 345678",
    cedula: "3.778.221",
    ruc: "3778221-0",
    address: "Concepción",
    department: "Concepción",
    registeredAt: NOW - 95 * D,
    documents: { ruc: true, cedula: true, transport: true, insurance: true },
    vehiclePlate: "GHI-789",
    metrics: { trips: 203, gmv: 81_200_000, rating: 4.9 },
  },
  {
    id: "USR-0422",
    name: "Roberto Silva",
    legalName: "Roberto Silva",
    role: "owner-operator",
    status: "suspended",
    email: "rsilva@gmail.com",
    phone: "+595 981 234567",
    cedula: "2.554.889",
    ruc: "2554889-3",
    address: "Loma Plata",
    department: "Boquerón",
    registeredAt: NOW - 70 * D,
    documents: { ruc: true, cedula: true, transport: true, insurance: false },
    vehiclePlate: "DEF-456",
    metrics: { trips: 87, gmv: 29_900_000, rating: 4.1 },
  },

  // Activos — choferes
  {
    id: "USR-0510",
    name: "Juan Pérez",
    legalName: "Juan Pérez",
    role: "chofer",
    status: "active",
    email: "jperez@gmail.com",
    phone: "+595 981 456789",
    cedula: "4.119.220",
    address: "Asunción",
    department: "Central",
    registeredAt: NOW - 60 * D,
    documents: { cedula: true, license: true, senacsa: true },
    metrics: { trips: 61, gmv: 0, rating: 4.5 },
  },
  {
    id: "USR-0511",
    name: "Ana López",
    legalName: "Ana López",
    role: "chofer",
    status: "active",
    email: "alopez@gmail.com",
    phone: "+595 981 567890",
    cedula: "4.880.112",
    address: "Villa Hayes",
    department: "Presidente Hayes",
    registeredAt: NOW - 45 * D,
    documents: { cedula: true, license: true, senacsa: true },
    metrics: { trips: 118, gmv: 0, rating: 4.7 },
  },

  // Rechazado
  {
    id: "USR-0399",
    name: "Transportes Fantasma",
    legalName: "TRANSP. FANTASMA",
    role: "empresa",
    subType: "Flota",
    status: "rejected",
    email: "info@fantasma.com",
    phone: "+595 900 000000",
    ruc: "00000000-0",
    address: "Sin dirección",
    department: "Central",
    registeredAt: NOW - 15 * D,
    documents: {
      ruc: false,
      transport: false,
      insurance: false,
      license: false,
    },
    fleetSize: 0,
    metrics: { trips: 0, gmv: 0 },
  },
];

const _seedIncidents: AdminIncident[] = [
  {
    id: "INC-3012",
    type: "retraso",
    priority: "high",
    status: "open",
    tripId: "VIA-2026-004",
    reportedBy: "Estancia San Pedro",
    reportedPhone: "+595 981 456789",
    title: "Retraso de 4h en control COTA",
    description:
      "El transportista reporta demora en el control de Villa Hayes por fila. El ganadero pide actualización de ETA.",
    createdAt: NOW - 2 * H,
    updatedAt: NOW - 1 * H,
  },
  {
    id: "INC-3011",
    type: "disputa",
    priority: "high",
    status: "in-progress",
    tripId: "VIA-2026-002",
    reportedBy: "Logística Paraguay SRL",
    reportedPhone: "+595 971 445566",
    title: "Disputa por monto final del flete",
    description:
      "Diferencia entre el monto acordado y el reclamado tras peaje extra. Requiere mediación.",
    createdAt: NOW - 8 * H,
    updatedAt: NOW - 3 * H,
    assignee: "Vos",
  },
  {
    id: "INC-3009",
    type: "documento",
    priority: "medium",
    status: "open",
    tripId: "VIA-2026-007",
    reportedBy: "Sistema",
    title: "COTA vencida en tránsito",
    description:
      "El certificado COTA del envío venció antes de la entrega. Verificar regularización.",
    createdAt: NOW - 26 * H,
    updatedAt: NOW - 26 * H,
  },
  {
    id: "INC-3004",
    type: "mecanico",
    priority: "medium",
    status: "resolved",
    tripId: "VIA-2026-001",
    reportedBy: "Carlos Mendez",
    reportedPhone: "+595 981 123456",
    title: "Desperfecto mecánico resuelto",
    description:
      "Pinchazo cubierta trasera; reemplazada en ruta. Sin afectación al ganado.",
    createdAt: NOW - 3 * D,
    updatedAt: NOW - 3 * D + 4 * H,
  },
  {
    id: "INC-2998",
    type: "otro",
    priority: "low",
    status: "resolved",
    reportedBy: "Cooperativa Neuland",
    title: "Consulta sobre facturación",
    description:
      "Pedido de detalle de comisiones del mes. Resuelto por soporte.",
    createdAt: NOW - 5 * D,
    updatedAt: NOW - 5 * D + 2 * H,
  },
];

const _seedTransactions: AdminTransaction[] = [
  {
    id: "TXN-9001",
    type: "commission",
    status: "paid",
    tripId: "VIA-2026-001",
    counterparty: "Logística Paraguay SRL",
    grossAmount: 1_750_000,
    commissionAmount: 140_000,
    netAmount: 1_610_000,
    date: NOW - 1 * D,
  },
  {
    id: "TXN-9002",
    type: "payout",
    status: "pending",
    tripId: "VIA-2026-002",
    counterparty: "Carlos Mendez",
    grossAmount: 1_350_000,
    commissionAmount: 108_000,
    netAmount: 1_242_000,
    date: NOW - 6 * H,
  },
  {
    id: "TXN-9003",
    type: "commission",
    status: "paid",
    tripId: "VIA-2026-003",
    counterparty: "Transganado SA",
    grossAmount: 2_200_000,
    commissionAmount: 176_000,
    netAmount: 2_024_000,
    date: NOW - 2 * D,
  },
  {
    id: "TXN-9004",
    type: "payout",
    status: "pending",
    tripId: "VIA-2026-004",
    counterparty: "María González",
    grossAmount: 1_580_000,
    commissionAmount: 126_400,
    netAmount: 1_453_600,
    date: NOW - 3 * H,
  },
  {
    id: "TXN-9005",
    type: "refund",
    status: "paid",
    tripId: "VIA-2026-005",
    counterparty: "Estancia La Esperanza",
    grossAmount: 900_000,
    commissionAmount: 0,
    netAmount: 900_000,
    date: NOW - 4 * D,
  },
  {
    id: "TXN-9006",
    type: "commission",
    status: "paid",
    tripId: "VIA-2026-006",
    counterparty: "Logística Paraguay SRL",
    grossAmount: 1_950_000,
    commissionAmount: 156_000,
    netAmount: 1_794_000,
    date: NOW - 5 * D,
  },
  {
    id: "TXN-9007",
    type: "payout",
    status: "failed",
    tripId: "VIA-2026-007",
    counterparty: "Roberto Silva",
    grossAmount: 1_200_000,
    commissionAmount: 96_000,
    netAmount: 1_104_000,
    date: NOW - 7 * H,
  },
];

const _kpiSeries: KpiPoint[] = [
  {
    label: "Oct",
    revenue: 7_200_000,
    gmv: 90_000_000,
    trips: 198,
    signups: 41,
  },
  {
    label: "Nov",
    revenue: 8_400_000,
    gmv: 105_000_000,
    trips: 231,
    signups: 53,
  },
  {
    label: "Dic",
    revenue: 9_900_000,
    gmv: 123_750_000,
    trips: 268,
    signups: 60,
  },
  {
    label: "Ene",
    revenue: 8_950_000,
    gmv: 111_875_000,
    trips: 242,
    signups: 48,
  },
  {
    label: "Feb",
    revenue: 11_300_000,
    gmv: 141_250_000,
    trips: 305,
    signups: 67,
  },
  {
    label: "Mar",
    revenue: 12_640_000,
    gmv: 158_000_000,
    trips: 342,
    signups: 72,
  },
];

const _seedActivity: ActivityItem[] = [
  {
    id: "ACT-1",
    kind: "verification",
    text: "Estancia La Joya S.A. solicitó verificación (Ganadero)",
    at: NOW - 6 * H,
  },
  {
    id: "ACT-2",
    kind: "incident",
    text: "Nueva incidencia de alta prioridad en VIA-2026-004",
    at: NOW - 2 * H,
  },
  {
    id: "ACT-3",
    kind: "trip",
    text: "Viaje VIA-2026-001 entregado · Filadelfia → Asunción",
    at: NOW - 1 * D,
  },
  {
    id: "ACT-4",
    kind: "offer",
    text: "Logística Paraguay ofertó ₲ 1.750.000 en SOL-8012",
    at: NOW - 30 * 60_000,
  },
  {
    id: "ACT-5",
    kind: "payout",
    text: "Payout pendiente de ₲ 1.242.000 a Carlos Mendez",
    at: NOW - 6 * H,
  },
  {
    id: "ACT-6",
    kind: "signup",
    text: "Diego Closs se registró como Chofer",
    at: NOW - 28 * H,
  },
];

const _seedGanaderoDocumentTypes: GanaderoDocumentType[] = [
  {
    id: "GDOC-1",
    code: "ruc",
    label: "RUC",
    required: true,
    active: true,
    order: 1,
    createdAt: NOW - 120 * D,
    updatedAt: NOW - 120 * D,
  },
  {
    id: "GDOC-2",
    code: "senacsa",
    label: "Registro SENACSA",
    required: true,
    active: true,
    order: 2,
    createdAt: NOW - 120 * D,
    updatedAt: NOW - 120 * D,
  },
  {
    id: "GDOC-3",
    code: "establishment",
    label: "Habilitación establecimiento",
    required: true,
    active: true,
    order: 3,
    createdAt: NOW - 120 * D,
    updatedAt: NOW - 120 * D,
  },
  {
    id: "GDOC-4",
    code: "access-map",
    label: "Mapa de acceso",
    required: false,
    active: true,
    order: 4,
    createdAt: NOW - 90 * D,
    updatedAt: NOW - 90 * D,
  },
];

let _config: AdminConfig = {
  commissionRate: 8,
  pricePerKmPerHead: 410,
  senacsaFat: 45,
  senacsaWeaned: 80,
  maxRounds: 3,
  autoApproveVerified: false,
  notifyIncidents: true,
  notifyPayouts: true,
};

// ════════════════ STORE ════════════════
let _users = [..._seedUsers];
let _incidents = [..._seedIncidents];
const _transactions = [..._seedTransactions];
let _ganaderoDocumentTypes = [..._seedGanaderoDocumentTypes];

type Listener = () => void;
let _listeners: Listener[] = [];
function notify() {
  _listeners.forEach((fn) => fn());
}
export function subscribeAdmin(fn: Listener): () => void {
  _listeners = [..._listeners, fn];
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export function getAdminUsers(): AdminUser[] {
  return _users;
}
export function getIncidents(): AdminIncident[] {
  return _incidents;
}
export function getTransactions(): AdminTransaction[] {
  return _transactions;
}
export function getKpiSeries(): KpiPoint[] {
  return _kpiSeries;
}
export function getActivity(): ActivityItem[] {
  return _seedActivity;
}
export function getAdminConfig(): AdminConfig {
  return _config;
}

export function getGanaderoDocumentTypes(): GanaderoDocumentType[] {
  return [..._ganaderoDocumentTypes].sort((a, b) => a.order - b.order);
}

function normalizeDocCode(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createGanaderoDocumentType(
  input: GanaderoDocumentTypeInput,
): GanaderoDocumentType {
  const baseCode = normalizeDocCode(input.code || input.label || "documento");
  const existingCodes = new Set(_ganaderoDocumentTypes.map((d) => d.code));

  let uniqueCode = baseCode || "documento";
  let index = 2;
  while (existingCodes.has(uniqueCode)) {
    uniqueCode = `${baseCode || "documento"}-${index}`;
    index += 1;
  }

  const now = Date.now();
  const nextOrder =
    _ganaderoDocumentTypes.length > 0
      ? Math.max(..._ganaderoDocumentTypes.map((d) => d.order)) + 1
      : 1;

  const doc: GanaderoDocumentType = {
    id: `GDOC-${now}`,
    code: uniqueCode,
    label: input.label.trim(),
    required: input.required ?? false,
    active: input.active ?? true,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  };

  _ganaderoDocumentTypes = [..._ganaderoDocumentTypes, doc];
  notify();
  return doc;
}

export function updateGanaderoDocumentType(
  id: string,
  patch: Partial<Pick<GanaderoDocumentType, "label" | "required" | "active">>,
): void {
  _ganaderoDocumentTypes = _ganaderoDocumentTypes.map((doc) =>
    doc.id === id
      ? {
          ...doc,
          ...patch,
          label: patch.label?.trim() ?? doc.label,
          updatedAt: Date.now(),
        }
      : doc,
  );
  notify();
}

export function setAdminConfig(patch: Partial<AdminConfig>): void {
  _config = { ..._config, ...patch };
  notify();
}

function setUserStatus(id: string, status: AdminUserStatus) {
  _users = _users.map((u) => (u.id === id ? { ...u, status } : u));
  notify();
}
export function approveUser(id: string): void {
  setUserStatus(id, "active");
}
export function rejectUser(id: string): void {
  setUserStatus(id, "rejected");
}
export function suspendUser(id: string): void {
  setUserStatus(id, "suspended");
}
export function reactivateUser(id: string): void {
  setUserStatus(id, "active");
}

export function updateIncidentStatus(id: string, status: IncidentStatus): void {
  _incidents = _incidents.map((i) =>
    i.id === id ? { ...i, status, updatedAt: Date.now() } : i,
  );
  notify();
}
export function assignIncident(id: string, assignee: string): void {
  _incidents = _incidents.map((i) =>
    i.id === id ? { ...i, assignee, updatedAt: Date.now() } : i,
  );
  notify();
}

// Chequeo RUC ↔ razón social (heurística demo): comparte alguna palabra significativa.
export function checkRucMatch(name: string, legalName: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-záéíóúñ ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  const a = norm(name);
  const b = norm(legalName);
  return a.some((w) => b.includes(w));
}

// Hook React — re-render ante cualquier cambio del store admin.
export function useAdminStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeAdmin(() => setTick((n) => n + 1)), []);
  return {
    users: getAdminUsers(),
    incidents: getIncidents(),
    transactions: getTransactions(),
    kpiSeries: getKpiSeries(),
    activity: getActivity(),
    config: getAdminConfig(),
    ganaderoDocumentTypes: getGanaderoDocumentTypes(),
    approveUser,
    rejectUser,
    suspendUser,
    reactivateUser,
    updateIncidentStatus,
    assignIncident,
    createGanaderoDocumentType,
    updateGanaderoDocumentType,
    setAdminConfig,
  };
}
