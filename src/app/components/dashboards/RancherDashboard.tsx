import { useState, useEffect } from "react";
import {
  Package,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  History,
  BarChart3,
  HelpCircle,
  X,
  User,
  LogOut,
  Truck,
  MapPin,
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../ui/button";
import { NewShipmentFlow } from "./NewShipmentFlow";
import { NewShipmentWizardRefactored } from "./NewShipmentWizardRefactored";
import {
  useDemoStore,
  counterOfferByRancher,
  rejectOffer,
  acceptOffer,
  cancelOrder,
} from "../../store/demoStore";
import { RancherOffersView } from "./RancherOffersView";
import { GanaderoAccount } from "@/features/account";
import { TripCancelFlow } from "../TripCancelFlow";
import { MisEnviosView } from "./MisEnviosView";
import { RancherTripDetailModal } from "./RancherTripDetailModal";
import { RancherOfferDetailModal } from "./RancherOfferDetailModal";
import {
  baseActiveShipments,
  offersData,
  progressByShipment,
} from "../../data/rancher-dashboard-data";
import { formatPrice, calculateSavings } from "../../utils/format";
import { MapView, type MapMarker } from "../MapView";
import { shipmentStatusColor } from "../../config/colors";
import { coordsForCity, interpolate } from "../../data/paraguay-locations";
import type { GanaderoAccountInitialData } from "@/features/account";

interface RancherDashboardProps {
  userName: string;
  onLogout: () => void;
  subTypeLabel?: string;
  accountInitialData?: GanaderoAccountInitialData;
}

import { toast } from "sonner";
export function RancherDashboard({
  userName,
  onLogout,
  subTypeLabel = "Ganadero",
  accountInitialData,
}: RancherDashboardProps) {
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [showShipmentSelector, setShowShipmentSelector] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "envios"
    | "history"
    | "reports"
    | "support"
    | "offers"
    | "cuenta"
  >("dashboard");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showGanaderoCancel, setShowGanaderoCancel] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [activeShipmentsExpanded, setActiveShipmentsExpanded] = useState(true);
  const [offersExpanded, setOffersExpanded] = useState(true);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [
    selectedTransporterForVerification,
    setSelectedTransporterForVerification,
  ] = useState<string | null>(null);
  const [showDeliveryProofModal, setShowDeliveryProofModal] = useState(false);
  const [driverRating, setDriverRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [storeCounterInput, setStoreCounterInput] = useState<{
    [offerId: string]: string;
  }>({});
  const [storeOrdersExpanded, setStoreOrdersExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "En Ruta" | "Ofertas" | "Mis Envíos" | "Actividad"
  >("En Ruta");
  const [etaTripIndex, setEtaTripIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setEtaTripIndex((i) => (i + 1) % 2), 6000);
    return () => clearInterval(t);
  }, []);
  const [showMapDetail, setShowMapDetail] = useState(false);
  const [selectedActiveShipmentId, setSelectedActiveShipmentId] =
    useState("ENV-001");

  const { orders: storeOrders, offers: storeOffers } = useDemoStore();

  const fullyAcceptedStoreOrders = storeOrders.filter(
    (o) => o.status === "accepted",
  );

  const activeShipments = [
    ...baseActiveShipments.filter(
      (s) => !(fullyAcceptedStoreOrders.length > 0 && s.id === "ENV-003"),
    ),
    ...fullyAcceptedStoreOrders.map((o) => ({
      id: o.id,
      status: "accepted",
      statusText: "Transportista asignado",
      origin: o.origin,
      destination: o.destination,
      cattleCount: o.heads,
      cattleType: o.cattleTypeLabel,
      distance: o.distance,
      driver: "Demo Transportista",
      estimatedArrival: "A confirmar",
      isStoreOrder: true,
    })),
  ];

  const getStatusColor = shipmentStatusColor;

  const tripDetailsData: { [key: string]: any } = {
    "ENV-001": {
      id: "ENV-001",
      status: "en-transito",
      origin: "Filadelfia",
      originEstancia: "Estancia Don Pedro - SENACSA 12345",
      destination: "Asunción - Frigorífico Central",
      cattleType: "Gordos",
      heads: 45,
      pickupDate: "24/03/2026",
      pickupTime: "06:00",
      deliveryDate: "24/03/2026 14:00",
      distance: 480,
      agreedPrice: 2800000,
      transporter: {
        name: "Transporte González S.A.",
        type: "empresa",
        phone: "+595 981 234567",
        rating: 4.8,
      },
      driver: {
        name: "Roberto Díaz",
        phone: "+595 981 123456",
        currentLocation: "Ruta 9 Km 300",
        estimatedArrival: "2 horas",
      },
      documents: {
        guia: {
          uploaded: true,
          canUpload: false,
          uploadDate: "24/03/2026 06:15",
        },
        cota: {
          checkpoints: [
            {
              name: "Control Filadelfia",
              location: "Ruta 9 Km 450",
              passed: true,
              time: "06:30",
            },
            {
              name: "Control Mariscal Estigarribia",
              location: "Ruta 9 Km 300",
              passed: true,
              time: "09:15",
            },
            {
              name: "Control Villa Hayes",
              location: "Ruta Transchaco Km 50",
              passed: false,
            },
          ],
        },
      },
    },
    "ENV-002": {
      id: "ENV-002",
      status: "chofer-asignado",
      origin: "Loma Plata",
      originEstancia: "Rancho San Miguel - SENACSA 23456",
      destination: "Villa Hayes - Matadero Municipal",
      cattleType: "Novillos",
      heads: 30,
      pickupDate: "25/03/2026",
      pickupTime: "08:00",
      deliveryDate: "25/03/2026 13:00",
      distance: 320,
      agreedPrice: 1900000,
      transporter: {
        name: "Carlos Méndez",
        type: "owner-operator",
        phone: "+595 981 345678",
        rating: 4.6,
      },
      driver: { name: "Carlos Méndez", phone: "+595 981 345678" },
      documents: {
        guia: { uploaded: false, canUpload: true },
        cota: { checkpoints: [] },
      },
    },
    "ENV-003": {
      id: "ENV-003",
      status: "esperando-chofer",
      origin: "Neuland",
      originEstancia: "Ganadera La Esperanza - SENACSA 34567",
      destination: "Concepción - Frigorífico Norte",
      cattleType: "Vaquillonas",
      heads: 52,
      pickupDate: "26/03/2026",
      pickupTime: "05:30",
      deliveryDate: "26/03/2026 12:00",
      distance: 380,
      agreedPrice: 2300000,
      transporter: {
        name: "Flota del Chaco",
        type: "empresa",
        phone: "+595 981 456789",
        rating: 4.9,
      },
      documents: {
        guia: { uploaded: false, canUpload: false },
        cota: { checkpoints: [] },
      },
    },
    "ENV-005": {
      id: "ENV-005",
      status: "en-transito",
      origin: "Filadelfia",
      originEstancia: "Estancia San Rafael - SENACSA 56789",
      destination: "Puerto Casado - Frigorífico Norte",
      cattleType: "Novillos",
      heads: 32,
      pickupDate: "24/03/2026",
      pickupTime: "05:00",
      deliveryDate: "24/03/2026 18:00",
      distance: 448,
      agreedPrice: 2500000,
      transporter: {
        name: "Torres Transporte",
        type: "owner-operator",
        phone: "+595 981 567890",
        rating: 4.7,
      },
      driver: {
        name: "Ana Torres",
        phone: "+595 981 567890",
        currentLocation: "Ruta al norte del Chaco",
        estimatedArrival: "4 horas",
      },
      documents: {
        guia: {
          uploaded: true,
          canUpload: false,
          uploadDate: "24/03/2026 05:15",
        },
        cota: {
          checkpoints: [
            {
              name: "Control Filadelfia",
              location: "Ruta 9 Km 450",
              passed: true,
              time: "05:30",
            },
            { name: "Control Pozo Hondo", location: "Km 220", passed: false },
            { name: "Puerto Casado", location: "Destino", passed: false },
          ],
        },
      },
    },
  };

  const handleAcceptOffer = (offerId: string) => {
    setSelectedOfferId(null);
    setCurrentView("dashboard");
  };

  if (showNewShipment) {
    return <NewShipmentFlow onClose={() => setShowNewShipment(false)} />;
  }
  if (showShipmentSelector) {
    return <NewShipmentWizardRefactored onClose={() => setShowShipmentSelector(false)} />;
  }

  const inTransitShipments = activeShipments.filter(
    (s) => s.status === "in-transit",
  );
  const activeShipment = activeShipments.find(
    (s) => s.id === selectedActiveShipmentId,
  ) ||
    activeShipments.find((s) => s.status === "in-transit") ||
    activeShipments.find((s) => s.status === "accepted") ||
    activeShipments[0] || {
      id: "ENV-—",
      status: "waiting",
      statusText: "Sin viajes activos",
      origin: "Filadelfia",
      destination: "Asunción",
      cattleCount: 0,
      cattleType: "—",
      distance: 0,
      driver: "—",
      estimatedArrival: "—",
    };

  const pendingStoreOffers = storeOffers.filter(
    (o) => o.status !== "rejected" && o.status !== "accepted",
  );
  const pendingOffersCount = pendingStoreOffers.length + 3;
  const activeEnviosCount = activeShipments.filter(
    (s) => s.status === "in-transit" || s.status === "accepted",
  ).length;

  // ── Sidebar nav items ──────────────────────────────────────────────────────
  const navItems = [
    {
      key: "dashboard",
      icon: LayoutDashboard,
      hasDot: false,
      label: "Panel Principal",
    },
    {
      key: "offers",
      icon: Bell,
      hasDot: pendingOffersCount > 0,
      label: "Ofertas",
    },
    { key: "envios", icon: Package, hasDot: false, label: "Mis envíos" },
    { key: "history", icon: History, hasDot: false, label: "Historial" },
    { key: "reports", icon: BarChart3, hasDot: false, label: "Reportes" },
  ] as const;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F6F1E8",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        position: "relative",
      }}
    >
      <style>{`
        @keyframes mapPing {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          75%, 100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        .map-ping { animation: mapPing 1.6s cubic-bezier(0,0,0.2,1) infinite; }
        .map-ping-delay { animation: mapPing 1.6s cubic-bezier(0,0,0.2,1) infinite; animation-delay: 0.5s; }
        @keyframes etaSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .eta-slide { animation: etaSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {selectedTripId && (
        <RancherTripDetailModal
          tripId={selectedTripId}
          onClose={() => setSelectedTripId(null)}
        />
      )}
      {showGanaderoCancel && (
        <TripCancelFlow
          tripId={activeShipment.id}
          route={`${activeShipment.origin} → ${activeShipment.destination}`}
          who="ganadero"
          onClose={() => setShowGanaderoCancel(false)}
          onConfirmed={() => {}}
        />
      )}
      {selectedOfferId && (
        <RancherOfferDetailModal
          offerId={selectedOfferId}
          onClose={() => setSelectedOfferId(null)}
          onAccept={handleAcceptOffer}
        />
      )}

      {showVerifiedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md md:max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Transportista Verificado
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowVerifiedModal(false);
                  setSelectedTransporterForVerification(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="font-semibold text-lg text-gray-900 mb-2">
              {selectedTransporterForVerification}
            </p>
            <div
              className="rounded-lg p-4 mb-4"
              style={{
                backgroundColor: "#1E512615",
                border: "1px solid #1E512630",
              }}
            >
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#1E5126" }}
              >
                ✓ Transportista 100% verificado
              </p>
              <p className="text-xs" style={{ color: "#1E5126" }}>
                Verificado por TROPEX
              </p>
            </div>
            {[
              [
                "Habilitación SENACSA",
                "Permiso de transporte verificado y vigente",
              ],
              [
                "Licencia de conducir",
                "Licencia profesional verificada y vigente",
              ],
              [
                "Documentación del vehículo",
                "Cédula verde y seguro verificados",
              ],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeliveryProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg z-10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                Viaje completado
              </h3>
              <button
                onClick={() => setShowDeliveryProofModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "#1E512615",
                  border: "1px solid #1E512630",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: "#1E5126" }}
                  />
                  <span className="font-bold" style={{ color: "#1E5126" }}>
                    Entrega exitosa
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Viaje", "ENV-004"],
                    ["Fecha", "18/03/2026 14:30"],
                    ["Conductor", "Carlos Méndez"],
                    ["Cabezas", "38"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#1E5126" }}
                      >
                        {l}
                      </div>
                      <div className="font-bold text-gray-900">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-3">
                  Calificar conductor
                </h4>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDriverRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= (hoverRating || driverRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                {driverRating > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-4">
                      Calificaste con{" "}
                      <strong>
                        {driverRating} estrella{driverRating !== 1 ? "s" : ""}
                      </strong>
                    </p>
                    <Button style={{ backgroundColor: "#1E5126" }}>
                      Enviar calificación
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar overlay (click to collapse) ─────────────────────────── */}
      {sidebarExpanded && (
        <div
          onClick={() => setSidebarExpanded(false)}
          style={{
            position: "absolute",
            left: 60,
            top: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 40,
            cursor: "pointer",
          }}
        />
      )}

      {/* ── 60px ghost spacer — keeps main content from shifting ─────────── */}
      <div style={{ width: 60, flexShrink: 0 }} />

      {/* ── Sidebar (position:absolute so it overlays content when expanded) */}
      <aside
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarExpanded ? 220 : 60,
          background: "#1E5126",
          transition: "width 250ms ease-in-out",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "14px 0",
          gap: 4,
          zIndex: 50,
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px",
            marginBottom: 10,
            minHeight: 36,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src="/tropex-isotipo.png"
              alt="TROPEX"
              style={{ width: 26, height: 26, objectFit: "contain" }}
            />
          </div>
          {sidebarExpanded && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                whiteSpace: "nowrap",
                opacity: 1,
              }}
            >
              TROPEX
            </span>
          )}
        </div>

        {/* Nav items */}
        {navItems.map(({ key, icon: Icon, hasDot, label }) => {
          const active = currentView === key;
          return sidebarExpanded ? (
            <button
              key={key}
              onClick={() => {
                setCurrentView(key);
                setSidebarExpanded(false);
              }}
              style={{
                width: "calc(100% - 16px)",
                margin: "0 8px",
                height: 38,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: active ? "rgba(255,255,255,0.18)" : "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Icon
                size={18}
                color={active ? "#fff" : "rgba(255,255,255,0.6)"}
                strokeWidth={active ? 2.2 : 1.8}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "rgba(255,255,255,0.75)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
              {hasDot && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 24,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#F58718",
                    border: "1.5px solid #1E5126",
                  }}
                />
              )}
            </button>
          ) : (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              title={label}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: "none",
                background: active ? "rgba(255,255,255,0.18)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 150ms",
                position: "relative",
                margin: "0 auto",
              }}
            >
              <Icon
                size={18}
                color={active ? "#fff" : "rgba(255,255,255,0.55)"}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {hasDot && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#F58718",
                    border: "1.5px solid #1E5126",
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div
          style={{
            width: sidebarExpanded ? "calc(100% - 24px)" : 24,
            height: 1,
            background: "rgba(255,255,255,0.15)",
            margin: "8px auto",
          }}
        />

        {/* Support */}
        {sidebarExpanded ? (
          <button
            onClick={() => {
              setCurrentView("support");
              setSidebarExpanded(false);
            }}
            style={{
              width: "calc(100% - 16px)",
              margin: "0 8px",
              height: 38,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background:
                currentView === "support"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <HelpCircle
              size={18}
              color={
                currentView === "support" ? "#fff" : "rgba(255,255,255,0.6)"
              }
              strokeWidth={1.8}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: currentView === "support" ? 700 : 500,
                color:
                  currentView === "support" ? "#fff" : "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              Soporte
            </span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentView("support")}
            title="Soporte"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background:
                currentView === "support"
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              margin: "0 auto",
            }}
          >
            <HelpCircle
              size={18}
              color={
                currentView === "support" ? "#fff" : "rgba(255,255,255,0.55)"
              }
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Toggle button */}
        {sidebarExpanded ? (
          <button
            onClick={() => setSidebarExpanded(false)}
            style={{
              width: "calc(100% - 16px)",
              margin: "0 8px",
              height: 38,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <ChevronLeft
              size={18}
              color="rgba(255,255,255,0.6)"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                whiteSpace: "nowrap",
              }}
            >
              Colapsar
            </span>
          </button>
        ) : (
          <button
            onClick={() => setSidebarExpanded(true)}
            title="Expandir menú"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              margin: "0 auto",
            }}
          >
            <ChevronRight size={18} color="rgba(255,255,255,0.55)" />
          </button>
        )}

        {/* Logout */}
        {sidebarExpanded ? (
          <button
            onClick={onLogout}
            style={{
              width: "calc(100% - 16px)",
              margin: "0 8px",
              height: 38,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <LogOut
              size={18}
              color="rgba(255,255,255,0.6)"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                whiteSpace: "nowrap",
              }}
            >
              Cerrar sesión
            </span>
          </button>
        ) : (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              margin: "0 auto",
            }}
          >
            <LogOut
              size={18}
              color="rgba(255,255,255,0.55)"
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* User avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: sidebarExpanded ? "4px 12px 0" : "4px 0 0",
            justifyContent: sidebarExpanded ? "flex-start" : "center",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={15} color="#fff" />
          </div>
          {sidebarExpanded && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap",
                }}
              >
                {subTypeLabel}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* ── DASHBOARD VIEW ─────────────────────────────────────────────── */}
        {currentView === "dashboard" &&
          (() => {
            const progressPercent =
              progressByShipment[activeShipment.id] ??
              (activeShipment.status === "in-transit"
                ? 60
                : activeShipment.status === "accepted"
                  ? 25
                  : activeShipment.status === "waiting"
                    ? 5
                    : 100);
            const otherShipments = activeShipments.filter(
              (s) => s.id !== activeShipment.id,
            );

            // Map route geometry — adjust these coordinates to fine-tune route positions
            const mapRoutes = {
              "ENV-001": {
                pathCompleted:
                  "M 21 53 C 34 53 44 53 52 53 C 62 53 70 53.5 78 54",
                pathRemaining: "M 78 54 C 86 54.5 90 55 94 56",
                truckX: 78,
                truckY: 54,
                destX: 94,
                destY: 56,
                destLabel: "Asunción",
                truckLabel: "Villa Hayes",
                cp: [
                  { x: 34, y: 53, passed: true, label: "✓ Km 450" },
                  { x: 52, y: 53, passed: true, label: "✓ Km 300" },
                ],
                cota: [
                  { label: "Fila.", sub: "Km 450", done: true },
                  { label: "Mariscal", sub: "Km 300", done: true },
                  {
                    label: "V.Hayes",
                    sub: "Km 50",
                    done: false,
                    current: true,
                  },
                  { label: "Asunc.", sub: "Destino", done: false },
                ],
                price: "₲ 2.8M",
              },
              "ENV-005": {
                pathFull: "M 21 53 C 22 47 24 42 27 39 C 29 36 30 34 31 32",
                truckX: 27,
                truckY: 39,
                destX: 31,
                destY: 32,
                destLabel: "Puerto Casado",
                truckLabel: "En ruta",
                cp: [] as {
                  x: number;
                  y: number;
                  passed: boolean;
                  label: string;
                }[],
                cota: [
                  { label: "Fila.", sub: "Km 448", done: true },
                  {
                    label: "P.Hondo",
                    sub: "Km 224",
                    done: false,
                    current: true,
                  },
                  { label: "P.Casado", sub: "Destino", done: false },
                ],
                price: "₲ 2.5M",
              },
            } as const;
            const recentActivity = [
              {
                color: "#F58718",
                text: "Carlos M. ofertó ₲ 2.7M en SOL-001",
                time: "hace 12 min",
              },
              {
                color: "#1E5126",
                text: `${activeShipment.id} cruzó Mariscal Estigarribia`,
                time: "hace 2 h",
              },
              {
                color: "#1E5126",
                text: "Pago de ₲ 1.65M confirmado · ENV-045",
                time: "ayer",
              },
              {
                color: "#F58718",
                text: "Flota del Chaco ofertó ₲ 1.8M",
                time: "hace 3 h",
              },
            ];

            const upcomingPickups = [
              {
                id: "ENV-002",
                day: "25",
                month: "MAR",
                time: "08:00",
                route: "Loma Plata → Villa Hayes",
              },
              {
                id: "ENV-003",
                day: "26",
                month: "MAR",
                time: "05:30",
                route: "Neuland → Concepción",
              },
            ];

            const offerCards = [
              {
                id: "OFFER-SOL-001-1",
                name: "Transporte González S.A.",
                rating: 4.8,
                sub: "SOL-001 · 45 cab",
                price: 2800000,
                savings: "12% mercado",
                round: 1,
                badge: "NUEVA",
              },
              {
                id: "OFFER-SOL-001-2",
                name: "Carlos Méndez",
                rating: 4.6,
                sub: "SOL-001 · 45 cab",
                price: 2700000,
                savings: "16% mercado",
                round: 3,
                badge: "CONTRA",
              },
              {
                id: "OFFER-SOL-002-1",
                name: "Flota del Chaco",
                rating: 4.9,
                sub: "SOL-002 · 32 cab",
                price: 1800000,
                savings: "14% mercado",
                round: 1,
                badge: "NUEVA",
              },
            ];

            const etaTrips = [
              {
                id: "ENV-001",
                origin: "Filadelfia",
                destination: "Asunción",
                h: 1,
                m: 58,
              },
              {
                id: "ENV-005",
                origin: "Filadelfia",
                destination: "Puerto Casado",
                h: 3,
                m: 42,
              },
            ];

            const shipmentActivity: Record<
              string,
              Array<{
                time: string;
                event: string;
                done: boolean;
                current?: boolean;
              }>
            > = {
              "ENV-001": [
                {
                  time: "06:00",
                  event: "Recogió el pedido en Filadelfia",
                  done: true,
                },
                {
                  time: "06:15",
                  event: "Guía de traslado cargada",
                  done: true,
                },
                {
                  time: "06:30",
                  event: "Control COTA · Filadelfia Km 450",
                  done: true,
                },
                {
                  time: "09:15",
                  event: "Control COTA · Mariscal Estigarribia Km 300",
                  done: true,
                },
                {
                  time: "~11:30",
                  event: "Control COTA · Villa Hayes Km 50",
                  done: false,
                  current: true,
                },
                { time: "~14:00", event: "Entrega en Asunción", done: false },
              ],
              "ENV-005": [
                {
                  time: "05:00",
                  event: "Recogió el pedido en Filadelfia",
                  done: true,
                },
                {
                  time: "05:15",
                  event: "Guía de traslado cargada",
                  done: true,
                },
                {
                  time: "05:30",
                  event: "Control COTA · Filadelfia Km 448",
                  done: true,
                },
                {
                  time: "~12:00",
                  event: "Control COTA · Pozo Hondo Km 224",
                  done: false,
                  current: true,
                },
                {
                  time: "~18:00",
                  event: "Entrega en Puerto Casado",
                  done: false,
                },
              ],
            };

            return (
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "3fr 2fr",
                  gridTemplateRows: "auto auto 1fr",
                  gap: 8,
                  padding: 8,
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                {/* ── WELCOME HEADER ───────────────────────────────────────── */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "2px 4px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111111",
                        lineHeight: 1.2,
                      }}
                    >
                      Bienvenido, {userName}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "#6B7280",
                        marginTop: 3,
                      }}
                    >
                      {activeEnviosCount} envíos activos · {pendingOffersCount}{" "}
                      ofertas sin respuesta
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      onClick={() => setCurrentView("offers")}
                      style={{
                        position: "relative",
                        width: 36,
                        height: 36,
                        background: "rgba(30,81,38,0.07)",
                        border: "none",
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Bell size={17} color="#1E5126" />
                      {pendingOffersCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#F58718",
                          }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentView("cuenta")}
                      aria-label="Cuenta"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#1E5126",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <User size={16} color="#fff" />
                    </button>
                  </div>
                </div>

                {/* ── STATS ROW ────────────────────────────────────────────── */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {/* Tile 1: Nuevo Envío CTA */}
                  <button
                    onClick={() => setShowNewShipment(true)}
                    style={{
                      background: "#F58718",
                      borderRadius: 10,
                      padding: "10px 16px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      textAlign: "left",
                      boxShadow: "0 4px 14px rgba(245,135,24,0.35)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        right: -24,
                        width: 88,
                        height: 88,
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Plus size={18} color="#fff" strokeWidth={2.5} />
                      Nuevo Envío
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginTop: 5,
                      }}
                    >
                      Crear solicitud
                    </div>
                  </button>

                  {/* Tile 1b: Nuevo Envío (API Real) CTA */}
                  <button
                    onClick={() => setShowShipmentSelector(true)}
                    style={{
                      background: "#F58718",
                      borderRadius: 10,
                      padding: "10px 16px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      textAlign: "left",
                      boxShadow: "0 4px 14px rgba(245,135,24,0.35)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        right: -24,
                        width: 88,
                        height: 88,
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Plus size={18} color="#fff" strokeWidth={2.5} />
                      Nuevo Envío
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginTop: 5,
                      }}
                    >
                      Crear (API real)
                    </div>
                  </button>

                  {/* Tile 2: Ofertas nuevas */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      padding: "10px 16px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 10,
                        opacity: 0.22,
                      }}
                    >
                      <Bell size={26} color="#F58718" strokeWidth={2.4} />
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#111",
                        lineHeight: 1,
                      }}
                    >
                      5
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginTop: 3,
                      }}
                    >
                      Ofertas nuevas
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#F58718",
                        marginTop: 4,
                      }}
                    >
                      ↑ 2 sin responder
                    </div>
                  </div>

                  {/* Tile 3: Solicitudes abiertas */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      padding: "10px 16px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 10,
                        opacity: 0.22,
                      }}
                    >
                      <Package size={26} color="#F58718" strokeWidth={2.4} />
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#111",
                        lineHeight: 1,
                      }}
                    >
                      2
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginTop: 3,
                      }}
                    >
                      Solicitudes abiertas
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#F58718",
                        marginTop: 4,
                      }}
                    >
                      2 esperando oferta
                    </div>
                  </div>

                  {/* Tile 4: Próximos retiros */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 10,
                      padding: "10px 16px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 10,
                        opacity: 0.22,
                      }}
                    >
                      <Calendar size={26} color="#1E5126" strokeWidth={2.4} />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 32,
                          borderRadius: 5,
                          background:
                            "linear-gradient(180deg, #1E5126 50%, #2d6b38 50%)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: "#fff",
                            opacity: 0.85,
                            lineHeight: "11px",
                          }}
                        >
                          {upcomingPickups[0]?.month ?? "MAR"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#1E5126",
                            background: "#fff",
                            width: "100%",
                            textAlign: "center",
                            lineHeight: "21px",
                          }}
                        >
                          {upcomingPickups[0]?.day ?? "25"}
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#111",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {upcomingPickups[0]?.route?.split("→")[0]?.trim() ??
                            "Loma Pla..."}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#aaa",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginTop: 2,
                          }}
                        >
                          Próximo retiro
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#1E5126",
                        marginTop: 6,
                      }}
                    >
                      {upcomingPickups.length} retiros pendientes
                    </div>
                  </div>

                  {/* Tile 5: ETA cycling */}
                  {(() => {
                    const eta = etaTrips[etaTripIndex];
                    return (
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          padding: "12px 16px",
                          border: "1px solid rgba(0,0,0,0.08)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 10,
                            opacity: 0.15,
                          }}
                        >
                          <Clock size={28} color="#1E5126" strokeWidth={2} />
                        </div>

                        {/* Animated content block — key forces remount → CSS animation plays fresh */}
                        <div key={etaTripIndex} className="eta-slide">
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#aaa",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              marginBottom: 5,
                            }}
                          >
                            Tiempo estimado
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-end",
                              gap: 2,
                              lineHeight: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: "#111",
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {eta.h}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#555",
                                marginBottom: 3,
                              }}
                            >
                              h
                            </span>
                            <span
                              style={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: "#111",
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "-0.02em",
                                marginLeft: 4,
                              }}
                            >
                              {String(eta.m).padStart(2, "0")}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#555",
                                marginBottom: 3,
                              }}
                            >
                              m
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#1E5126",
                              marginTop: 5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {eta.origin} → {eta.destination}
                          </div>
                        </div>

                        {/* Dot indicators */}
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            marginTop: 8,
                            alignItems: "center",
                          }}
                        >
                          {etaTrips.map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 4,
                                borderRadius: 99,
                                background:
                                  i === etaTripIndex ? "#1E5126" : "#E5E7EB",
                                width: i === etaTripIndex ? 18 : 6,
                                transition:
                                  "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ── LEFT: Map + tabs ─────────────────────────────────────── */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 13,
                    border: "2px solid rgba(0,0,0,0.22)",
                    boxShadow: "0 6px 28px rgba(0,0,0,0.16)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    height: "100%",
                    minHeight: 0,
                  }}
                >
                  {/* Panel title — Uber Freight style */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 16px 0",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#111",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Resumen de envíos
                    </span>
                    <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                      Actualizado hace 1 min
                    </span>
                  </div>
                  {/* Tab bar */}
                  <div
                    style={{
                      display: "flex",
                      borderBottom: "1.5px solid rgba(0,0,0,0.10)",
                      padding: "0 10px",
                      flexShrink: 0,
                      overflowX: "hidden",
                      overflowY: "hidden",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      background: "#fff",
                      marginTop: 2,
                    }}
                  >
                    {(
                      ["En Ruta", "Ofertas", "Mis Envíos", "Actividad"] as const
                    ).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "10px 13px",
                          fontSize: 11.5,
                          fontWeight: activeTab === tab ? 700 : 500,
                          color: activeTab === tab ? "#1E5126" : "#6B7280",
                          background: "none",
                          border: "none",
                          borderBottom:
                            activeTab === tab
                              ? "2.5px solid #1E5126"
                              : "2.5px solid transparent",
                          cursor: "pointer",
                          marginBottom: -1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          letterSpacing: activeTab === tab ? "0.01em" : 0,
                        }}
                      >
                        {tab}
                        {tab === "Ofertas" && pendingOffersCount > 0 && (
                          <span
                            style={{
                              background: "#F58718",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 800,
                              padding: "1px 5px",
                              borderRadius: 99,
                            }}
                          >
                            {pendingOffersCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* En Ruta */}
                  {activeTab === "En Ruta" &&
                    (() => {
                      const r001 = mapRoutes["ENV-001"];
                      const r005 = mapRoutes["ENV-005"];
                      const sel = selectedActiveShipmentId;
                      const selShipment =
                        activeShipments.find((s) => s.id === sel) ||
                        activeShipment;
                      const selRoute = sel === "ENV-005" ? r005 : r001;
                      const selectTruck = (id: string) => {
                        setSelectedActiveShipmentId(id);
                        setShowMapDetail(true);
                      };
                      return (
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            minHeight: 0,
                          }}
                        >
                          {/* Map area */}
                          <div
                            style={{
                              flex: 1,
                              position: "relative",
                              overflow: "hidden",
                              background: "#eef0eb",
                              minHeight: 0,
                            }}
                          >
                            {(() => {
                              const origin = coordsForCity("Filadelfia");
                              const mapMarkers: MapMarker[] = [];
                              const mapRoutesGeo: [number, number][][] = [];
                              if (origin) {
                                mapMarkers.push({
                                  id: "origin",
                                  lat: origin[0],
                                  lng: origin[1],
                                  type: "origin",
                                  label: "Filadelfia",
                                });
                                [
                                  {
                                    id: "ENV-001",
                                    dest: coordsForCity(r001.destLabel),
                                    label: r001.destLabel,
                                    prog: progressByShipment["ENV-001"] ?? 60,
                                  },
                                  {
                                    id: "ENV-005",
                                    dest: coordsForCity(r005.destLabel),
                                    label: r005.destLabel,
                                    prog: progressByShipment["ENV-005"] ?? 60,
                                  },
                                ].forEach((t) => {
                                  if (!t.dest) return;
                                  const pos = interpolate(
                                    origin,
                                    t.dest,
                                    t.prog,
                                  );
                                  mapMarkers.push({
                                    id: t.id,
                                    lat: pos[0],
                                    lng: pos[1],
                                    type: "truck",
                                    color: "#1E5126",
                                    label: `${t.id} · en ruta`,
                                  });
                                  mapMarkers.push({
                                    id: `dest-${t.id}`,
                                    lat: t.dest[0],
                                    lng: t.dest[1],
                                    type: "destination",
                                    label: t.label,
                                  });
                                  mapRoutesGeo.push([origin, t.dest]);
                                });
                              }
                              return (
                                <MapView
                                  height="100%"
                                  markers={mapMarkers}
                                  routes={mapRoutesGeo}
                                  onMarkerClick={(id) => {
                                    if (id.startsWith("ENV-")) selectTruck(id);
                                  }}
                                />
                              );
                            })()}

                            {/* Hint */}
                            {!showMapDetail && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 8,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  zIndex: 500,
                                  background: "rgba(0,0,0,0.52)",
                                  borderRadius: 99,
                                  padding: "4px 10px",
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: "#fff",
                                  whiteSpace: "nowrap",
                                  pointerEvents: "none",
                                }}
                              >
                                Toca un camión para ver detalles
                              </div>
                            )}
                          </div>

                          {/* Inline detail strip */}
                          {showMapDetail && (
                            <div
                              style={{
                                flexShrink: 0,
                                background: "#fff",
                                borderTop: "1.5px solid rgba(0,0,0,0.10)",
                                padding: "7px 14px 9px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 6,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 6,
                                      background: "#1E512615",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Truck size={11} color="#1E5126" />
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: "#111",
                                      }}
                                    >
                                      {selShipment.id} · En tránsito
                                    </div>
                                    <div style={{ fontSize: 9, color: "#888" }}>
                                      {selShipment.origin} →{" "}
                                      {selShipment.destination} ·{" "}
                                      {selShipment.distance} km
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setShowMapDetail(false)}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 5,
                                    background: "rgba(0,0,0,0.06)",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <X size={10} color="#666" />
                                </button>
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 7,
                                  alignItems: "start",
                                }}
                              >
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: 4,
                                  }}
                                >
                                  {(
                                    [
                                      ["Conductor", selShipment.driver],
                                      ["ETA", selShipment.estimatedArrival],
                                      [
                                        "Cabezas",
                                        `${selShipment.cattleCount} ${selShipment.cattleType}`,
                                      ],
                                      ["Precio", selRoute.price],
                                      ["Origen", selShipment.origin],
                                      ["Destino", selShipment.destination],
                                    ] as [string, string][]
                                  ).map(([label, value]) => (
                                    <div
                                      key={label}
                                      style={{
                                        background: "#F6F1E8",
                                        borderRadius: 5,
                                        padding: "4px 5px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 10,
                                          fontWeight: 700,
                                          color: "#bbb",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.04em",
                                        }}
                                      >
                                        {label}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 9,
                                          fontWeight: 700,
                                          color: "#111",
                                          marginTop: 1,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {value}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: "#bbb",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.04em",
                                      marginBottom: 4,
                                    }}
                                  >
                                    COTA
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {selRoute.cota.map((cp, i, arr) => (
                                      <div
                                        key={cp.label}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          flex: i < arr.length - 1 ? 1 : 0,
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            flexShrink: 0,
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: 15,
                                              height: 15,
                                              borderRadius: "50%",
                                              background: cp.done
                                                ? "#1E5126"
                                                : (cp as any).current
                                                  ? "#F58718"
                                                  : "#e5e7eb",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            {cp.done && (
                                              <CheckCircle2
                                                size={8}
                                                color="#fff"
                                                strokeWidth={3}
                                              />
                                            )}
                                            {(cp as any).current && (
                                              <div
                                                style={{
                                                  width: 4,
                                                  height: 4,
                                                  borderRadius: "50%",
                                                  background: "#fff",
                                                }}
                                              />
                                            )}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              color: cp.done
                                                ? "#1E5126"
                                                : (cp as any).current
                                                  ? "#F58718"
                                                  : "#bbb",
                                              marginTop: 1,
                                              textAlign: "center",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {cp.label}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 10,
                                              color: "#ccc",
                                              textAlign: "center",
                                            }}
                                          >
                                            {cp.sub}
                                          </div>
                                        </div>
                                        {i < arr.length - 1 && (
                                          <div
                                            style={{
                                              flex: 1,
                                              height: 2,
                                              background: cp.done
                                                ? "#1E5126"
                                                : "#e5e7eb",
                                              margin: "0 2px",
                                              marginBottom: 16,
                                            }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  setSelectedTripId(selShipment.id)
                                }
                                style={{
                                  width: "100%",
                                  marginTop: 7,
                                  padding: "6px 0",
                                  borderRadius: 6,
                                  background: "#1E5126",
                                  color: "#fff",
                                  border: "none",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 5,
                                }}
                              >
                                <FileText size={10} />
                                Ver documentos y detalles completos
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {/* Ofertas */}
                  {activeTab === "Ofertas" && (
                    <div
                      style={{ flex: 1, overflow: "hidden", padding: "4px 0" }}
                    >
                      {pendingStoreOffers.map((offer) => {
                        const order = storeOrders.find(
                          (o) => o.id === offer.orderId,
                        );
                        const currentAmount =
                          offer.status === "rancher-countered"
                            ? offer.rounds[offer.rounds.length - 1]?.amount
                            : offer.amount;
                        const initials = offer.transporterName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();
                        return (
                          <div
                            key={offer.id}
                            style={{
                              padding: "10px 16px",
                              borderBottom: "1px solid rgba(0,0,0,0.04)",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#F58718",
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#111",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {offer.transporterName}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#888",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <span style={{ fontFamily: "monospace" }}>
                                  {offer.orderId}
                                </span>
                                <span>·</span>
                                <span>Ronda {offer.rounds.length}/3</span>
                                {order && (
                                  <>
                                    <span>·</span>
                                    <span>{order.heads} cab</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: "#1E5126",
                                }}
                              >
                                ₲ {currentAmount.toLocaleString("es-PY")}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: "#F58718",
                                  textTransform: "uppercase",
                                }}
                              >
                                {offer.status === "rancher-countered"
                                  ? "CONTRA"
                                  : "NUEVA"}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                onClick={() => acceptOffer(offer.id)}
                                title="Aceptar"
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: 6,
                                  background: "#1E5126",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <button
                                onClick={() => rejectOffer(offer.id)}
                                title="Rechazar"
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: 6,
                                  background: "#fff",
                                  color: "#666",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {offerCards.map((o) => {
                        const initials = o.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();
                        const isCounter = o.badge === "CONTRA";
                        return (
                          <button
                            key={o.id}
                            onClick={() => setSelectedOfferId(o.id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              background: "transparent",
                              border: "none",
                              padding: "10px 16px",
                              borderBottom: "1px solid rgba(0,0,0,0.04)",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: isCounter ? "#1E5126" : "#F58718",
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#111",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {o.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#888",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Star
                                  size={10}
                                  fill="#F58718"
                                  color="#F58718"
                                />
                                <span
                                  style={{ fontWeight: 700, color: "#666" }}
                                >
                                  {o.rating}
                                </span>
                                <span>·</span>
                                <span style={{ fontFamily: "monospace" }}>
                                  {o.sub}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: "#1E5126",
                                }}
                              >
                                ₲ {o.price.toLocaleString("es-PY")}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: isCounter ? "#1E5126" : "#F58718",
                                  textTransform: "uppercase",
                                }}
                              >
                                {o.badge}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentView("offers")}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "transparent",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1E5126",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Ver todas las ofertas →
                      </button>
                    </div>
                  )}

                  {/* Mis Envíos */}
                  {activeTab === "Mis Envíos" && (
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      {activeShipments.map((shipment) => (
                        <div
                          key={shipment.id}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: getStatusColor(shipment.status),
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#111",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {shipment.origin} → {shipment.destination}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#888",
                                marginTop: 2,
                              }}
                            >
                              <span style={{ fontFamily: "monospace" }}>
                                {shipment.id}
                              </span>{" "}
                              · {shipment.cattleCount} cab. ·{" "}
                              {shipment.cattleType}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 99,
                                background: `${getStatusColor(shipment.status)}15`,
                                color: getStatusColor(shipment.status),
                              }}
                            >
                              {shipment.statusText}
                            </div>
                            {shipment.estimatedArrival &&
                              shipment.estimatedArrival !== "-" && (
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "#aaa",
                                    marginTop: 3,
                                  }}
                                >
                                  ETA: {shipment.estimatedArrival}
                                </div>
                              )}
                          </div>
                          {shipment.isStoreOrder && (
                            <button
                              onClick={() =>
                                toast("¿Cancelar esta solicitud?", {
                                  action: {
                                    label: "Confirmar",
                                    onClick: () => {
                                      cancelOrder(shipment.id);
                                      toast.success("Solicitud cancelada");
                                    },
                                  },
                                })
                              }
                              style={{
                                fontSize: 10,
                                padding: "5px 11px",
                                borderRadius: 6,
                                border: "1px solid rgba(212,24,61,0.3)",
                                background: "#fff",
                                color: "#d4183d",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTripId(shipment.id)}
                            style={{
                              fontSize: 10,
                              padding: "5px 11px",
                              borderRadius: 6,
                              border: "1px solid rgba(0,0,0,0.12)",
                              background: "#fff",
                              color: "#1E5126",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Ver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actividad */}
                  {activeTab === "Actividad" && (
                    <div
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          paddingBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111",
                          }}
                        >
                          Actividad reciente
                        </span>
                        <Clock size={13} color="#aaa" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {recentActivity.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: 8,
                              padding: "8px 0",
                              borderBottom:
                                i < recentActivity.length - 1
                                  ? "1px solid rgba(0,0,0,0.04)"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: item.color,
                                flexShrink: 0,
                                marginTop: 6,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#333",
                                  lineHeight: 1.4,
                                }}
                              >
                                {item.text}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#888",
                                  marginTop: 2,
                                }}
                              >
                                {item.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: hero card ─────────────────────────────────────── */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    height: "100%",
                    minHeight: 0,
                    overflowY: "auto",
                  }}
                >
                  {/* Green hero card */}
                  <div
                    style={{
                      background:
                        "linear-gradient(140deg, #1E5126 0%, #2d6b38 55%, #1E5126 100%)",
                      borderRadius: 13,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 auto",
                      minHeight: 0,
                      border: "1px solid rgba(0,0,0,0.10)",
                      boxShadow: "0 6px 24px rgba(30,81,38,0.22)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 200,
                        height: 200,
                        background:
                          "radial-gradient(circle, rgba(245,135,24,0.18) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          Tu envío activo
                        </div>
                        {inTransitShipments.length > 1 && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.4)",
                              }}
                            >
                              {inTransitShipments.findIndex(
                                (s) => s.id === activeShipment.id,
                              ) + 1}
                              /{inTransitShipments.length}
                            </span>
                            <button
                              onClick={() => {
                                const idx = inTransitShipments.findIndex(
                                  (s) => s.id === activeShipment.id,
                                );
                                setSelectedActiveShipmentId(
                                  inTransitShipments[
                                    (idx + 1) % inTransitShipments.length
                                  ].id,
                                );
                              }}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: "#F5BF00",
                                border: "1px solid rgba(0,0,0,0.12)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Ver siguiente envío activo"
                            >
                              <ChevronRight size={13} color="#fff" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {activeShipment.origin}
                        </span>
                        <ArrowRight size={16} color="rgba(255,255,255,0.4)" />
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#fff",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {activeShipment.destination}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 11,
                          color: "rgba(255,255,255,0.55)",
                          marginBottom: 14,
                        }}
                      >
                        <span style={{ fontFamily: "monospace" }}>
                          {activeShipment.id}
                        </span>
                        <span>·</span>
                        <span>{activeShipment.distance} km</span>
                        <span>·</span>
                        <span>ETA {activeShipment.estimatedArrival}</span>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            height: 4,
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 99,
                              background: "#F58718",
                              width: `${progressPercent}%`,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {activeShipment.origin}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: "#F58718",
                              fontWeight: 700,
                            }}
                          >
                            {progressPercent}% completado
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {activeShipment.destination}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 7,
                          marginBottom: 14,
                        }}
                      >
                        {(
                          [
                            ["Cabezas", String(activeShipment.cattleCount)],
                            ["Tipo", activeShipment.cattleType],
                            ["Conductor", activeShipment.driver],
                            ["Distancia", `${activeShipment.distance} km`],
                          ] as Array<[string, string]>
                        ).map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              background: "rgba(0,0,0,0.18)",
                              borderRadius: 8,
                              padding: "8px 10px",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "rgba(255,255,255,0.5)",
                                fontWeight: 700,
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#fff",
                                marginTop: 2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(activeShipment.status === "in-transit" ||
                        activeShipment.status === "accepted") && (
                        <button
                          onClick={() => setShowGanaderoCancel(true)}
                          style={{
                            width: "100%",
                            marginBottom: 14,
                            padding: "9px 0",
                            borderRadius: 9,
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "transparent",
                            color: "#FCA5A5",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Cancelar viaje
                        </button>
                      )}

                      {/* Activity feed */}
                      {shipmentActivity[activeShipment.id] && (
                        <div style={{ marginBottom: 14 }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "rgba(255,255,255,0.4)",
                              marginBottom: 10,
                            }}
                          >
                            Actividad del viaje
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0,
                            }}
                          >
                            {shipmentActivity[activeShipment.id].map(
                              (ev, i, arr) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    position: "relative",
                                  }}
                                >
                                  {/* Timeline line */}
                                  {i < arr.length - 1 && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        left: 15,
                                        top: 22,
                                        width: 1.5,
                                        height: "calc(100% - 8px)",
                                        background: ev.done
                                          ? "rgba(255,255,255,0.22)"
                                          : "rgba(255,255,255,0.08)",
                                      }}
                                    />
                                  )}
                                  {/* Dot */}
                                  <div
                                    style={{
                                      width: 31,
                                      display: "flex",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      paddingTop: 2,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                        background: ev.done
                                          ? "#1E5126"
                                          : ev.current
                                            ? "#F58718"
                                            : "rgba(255,255,255,0.1)",
                                        border: `2px solid ${ev.done ? "rgba(255,255,255,0.35)" : ev.current ? "#F58718" : "rgba(255,255,255,0.15)"}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {ev.done && (
                                        <CheckCircle2
                                          size={9}
                                          color="#fff"
                                          strokeWidth={3}
                                        />
                                      )}
                                      {ev.current && (
                                        <div
                                          style={{
                                            width: 5,
                                            height: 5,
                                            borderRadius: "50%",
                                            background: "#fff",
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  {/* Content */}
                                  <div
                                    style={{
                                      flex: 1,
                                      paddingBottom:
                                        i < arr.length - 1 ? 14 : 0,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: ev.current
                                          ? "#F58718"
                                          : ev.done
                                            ? "rgba(255,255,255,0.6)"
                                            : "rgba(255,255,255,0.28)",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                        marginBottom: 1,
                                      }}
                                    >
                                      {ev.time}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: ev.current ? 700 : 500,
                                        color: ev.current
                                          ? "#fff"
                                          : ev.done
                                            ? "rgba(255,255,255,0.78)"
                                            : "rgba(255,255,255,0.28)",
                                        lineHeight: 1.35,
                                        display: "block",
                                      }}
                                    >
                                      {ev.event}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {otherShipments.length > 0 && (
                        <div
                          style={{
                            marginTop: "auto",
                            paddingTop: 12,
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.4)",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 8,
                            }}
                          >
                            Otros envíos ({otherShipments.length})
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                            }}
                          >
                            {otherShipments.slice(0, 3).map((s) => (
                              <button
                                key={s.id}
                                onClick={() =>
                                  s.status === "in-transit"
                                    ? setSelectedActiveShipmentId(s.id)
                                    : setSelectedTripId(s.id)
                                }
                                style={{
                                  background: "rgba(0,0,0,0.18)",
                                  borderRadius: 7,
                                  padding: "8px 10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  border: "1px solid rgba(255,255,255,0.04)",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <div
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: getStatusColor(s.status),
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.8)",
                                    flex: 1,
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {s.origin} → {s.destination}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.45)",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {s.id}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.55)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {s.cattleCount}c
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedTripId(activeShipment.id)}
                        style={{
                          marginTop: 12,
                          padding: "10px 0",
                          borderRadius: 9,
                          border: "1px solid rgba(255,255,255,0.18)",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Ver detalles del envío
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ── OTHER VIEWS ──────────────────────────────────────────────── */}
        {currentView !== "dashboard" && (
          <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
            <div className="max-w-7xl mx-auto">
              {currentView === "envios" && <MisEnviosView />}

              {currentView === "history" && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Historial de Transportes
                  </h1>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {[
                              "Fecha",
                              "Origen",
                              "Destino",
                              "Cabezas",
                              "Precio",
                              "Estado",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            [
                              "15/03/2026",
                              "Filadelfia",
                              "Asunción",
                              "45",
                              "₲ 2.800.000",
                              "Completado",
                              "#1E5126",
                            ],
                            [
                              "10/03/2026",
                              "Loma Plata",
                              "Concepción",
                              "32",
                              "₲ 1.950.000",
                              "Completado",
                              "#1E5126",
                            ],
                            [
                              "05/03/2026",
                              "Neuland",
                              "Villa Hayes",
                              "28",
                              "₲ 1.650.000",
                              "Cancelado",
                              "#ef4444",
                            ],
                            [
                              "28/02/2026",
                              "Asunción",
                              "Filadelfia",
                              "52",
                              "₲ 3.200.000",
                              "Completado",
                              "#1E5126",
                            ],
                            [
                              "22/02/2026",
                              "Mariscal Estigarribia",
                              "Concepción",
                              "38",
                              "₲ 2.400.000",
                              "Completado",
                              "#1E5126",
                            ],
                          ].map(
                            ([
                              fecha,
                              orig,
                              dest,
                              cab,
                              precio,
                              estado,
                              color,
                            ]) => (
                              <tr
                                key={fecha + orig}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 text-gray-900">
                                  {fecha}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                  {orig}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                  {dest}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                  {cab}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                  {precio}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                    style={{ backgroundColor: color }}
                                  >
                                    {estado}
                                  </span>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {currentView === "reports" && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Reportes y Estadísticas
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      {
                        icon: Truck,
                        bg: "#1E512615",
                        color: "#1E5126",
                        value: "142",
                        label: "Total transportado este año",
                      },
                      {
                        icon: TrendingUp,
                        bg: "#F5871815",
                        color: "#F58718",
                        value: "₲ 89.500.000",
                        label: "Gasto total",
                      },
                      {
                        icon: CheckCircle2,
                        bg: "#1E512615",
                        color: "#1E5126",
                        value: "Transp. González",
                        label: "Transportista más usado",
                      },
                      {
                        icon: MapPin,
                        bg: "#F5871815",
                        color: "#F58718",
                        value: "Filadelfia - Asunción",
                        label: "Ruta más frecuente",
                      },
                    ].map(({ icon: Icon, bg, color, value, label }) => (
                      <div
                        key={label}
                        className="bg-white rounded-lg border border-gray-200 p-6"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {value}
                        </div>
                        <div className="text-sm text-gray-600">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-gray-700">
                      Reportes detallados disponibles próximamente
                    </p>
                  </div>
                </div>
              )}

              {currentView === "support" && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Soporte
                  </h1>
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Opciones de contacto
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a
                        href="https://wa.me/595211234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center"
                      >
                        <div
                          className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          WhatsApp
                        </h3>
                        <p className="text-sm text-gray-600">
                          +595 21 123 4567
                        </p>
                      </a>
                      <a
                        href="mailto:soporte@tropero.com.py"
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center"
                      >
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-sm text-gray-600">
                          soporte@tropero.com.py
                        </p>
                      </a>
                      <a
                        href="#"
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center"
                      >
                        <div
                          className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "#1E512615" }}
                        >
                          <ExternalLink
                            className="w-6 h-6"
                            style={{ color: "#1E5126" }}
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Centro de ayuda
                        </h3>
                        <p className="text-sm text-gray-600">
                          Documentación y guías
                        </p>
                      </a>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Preguntas frecuentes
                    </h2>
                    <div className="space-y-3">
                      {[
                        [
                          "¿Cómo funciona TROPEX?",
                          "TROPEX conecta ganaderos con transportistas verificados. Creás una solicitud de transporte, recibís ofertas de transportistas y elegís la mejor opción.",
                        ],
                        [
                          "¿Cuándo pago por el transporte?",
                          "Los ganaderos no pagan comisión a TROPEX. El pago al transportista se coordina directamente según lo acordado.",
                        ],
                        [
                          "¿Qué documentos necesito?",
                          "Se requiere la Guía de Traslado (SENACSA) y el Certificado de Tránsito Animal (COTA). La plataforma te permite verificar que todos los documentos estén en orden.",
                        ],
                      ].map(([q, a]) => (
                        <details
                          key={q}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <summary className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50">
                            {q}
                          </summary>
                          <div className="px-6 py-4 border-t border-gray-200 text-gray-700">
                            {a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentView === "offers" && (
                <RancherOffersView
                  onBack={() => setCurrentView("dashboard")}
                  onAcceptOffer={handleAcceptOffer}
                />
              )}

              {currentView === "cuenta" && (
                <GanaderoAccount
                  userName={userName}
                  onLogout={onLogout}
                  onBack={() => setCurrentView("dashboard")}
                  subTypeLabel={subTypeLabel}
                  initialData={accountInitialData}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Offer Detail Modal ────────────────────────────────────────────── */}
      {selectedOfferId &&
        offersData[selectedOfferId] &&
        (() => {
          const offer = offersData[selectedOfferId];
          const savings = calculateSavings(
            offer.currentPrice,
            offer.marketPrice,
          );
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-2xl text-gray-900">
                      {offer.solId}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          offer.status === "nueva-oferta"
                            ? "#3b82f6"
                            : "#10b981",
                      }}
                    >
                      {offer.status === "nueva-oferta"
                        ? "Nueva oferta"
                        : "Contraoferta recibida"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOfferId(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-3">
                    <Truck className="w-6 h-6 text-gray-600 mt-1" />
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {offer.transporterName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ★ {offer.transporterRating} • {offer.transporterTrips}{" "}
                        viajes
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {offer.origin}
                      </span>
                      <span className="text-gray-400">→</span>
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-gray-900">
                        {offer.destination}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {offer.cattleType} • {offer.heads} cabezas •{" "}
                      {offer.distance} km
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      Historial de negociación
                    </h3>
                    <div className="space-y-2">
                      {offer.negotiationHistory.map(
                        (entry: any, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${entry.from === "transportista" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                style={{
                                  backgroundColor:
                                    entry.from === "transportista"
                                      ? "#3b82f6"
                                      : "#6b7280",
                                }}
                              >
                                {entry.round}
                              </div>
                              <span className="text-sm text-gray-700">
                                {entry.label}
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {formatPrice(entry.price)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                    <div className="mt-4 bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">
                          Precio de mercado de referencia
                        </div>
                        <div className="font-bold text-gray-700">
                          {formatPrice(offer.marketPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tu ahorro</div>
                        <div className="font-bold" style={{ color: "#1E5126" }}>
                          ↓{" "}
                          {formatPrice(offer.marketPrice - offer.currentPrice)}{" "}
                          ({savings}%)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-5"
                    style={{ backgroundColor: "#1E5126" }}
                  >
                    <div className="text-sm font-medium text-green-100 mb-2">
                      Precio actual
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">
                      {formatPrice(offer.currentPrice)}
                    </div>
                    <div className="text-sm text-green-100">
                      Ahorrás {savings}% vs mercado
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        toast.success(
                          `Aceptando oferta de ${offer.transporterName} por ${formatPrice(offer.currentPrice)}`,
                        );
                        setSelectedOfferId(null);
                      }}
                      className="w-full h-12 rounded-lg font-bold text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#1E5126" }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Aceptar oferta
                    </button>
                    {offer.currentRound < offer.maxRounds && (
                      <button
                        onClick={() => {
                          toast.info("Abriendo pantalla de contraoferta...");
                          setSelectedOfferId(null);
                        }}
                        className="w-full h-12 rounded-lg font-semibold border-2 transition-colors"
                        style={{
                          borderColor: "#1E5126",
                          color: "#1E5126",
                          backgroundColor: "white",
                        }}
                      >
                        Contraofertar
                      </button>
                    )}
                    <div className="text-center text-xs text-gray-500">
                      Ronda {offer.currentRound} de {offer.maxRounds}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
