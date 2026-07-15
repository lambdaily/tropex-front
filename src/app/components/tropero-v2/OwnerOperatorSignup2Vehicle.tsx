import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {ChevronDown, ChevronUp, Plus, Minus} from 'lucide-react';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface OwnerOperatorSignup2VehicleProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

interface UnitItem {
  id: string; // unique ID for each unit
  typeId: string;
  typeName: string;
  unitNumber: number; // unit number within this type
  capacityAdult: number;
  capacityYoung: number;
  youngManuallyEdited: boolean; // track if user manually edited young capacity
}

const PREDEFINED_TYPES = [
  { id: 'chico', name: 'Camión chico', subtitle: '(Eje simple)' },
  { id: 'mediano', name: 'Camión mediano', subtitle: '(Doble eje)' },
  { id: 'acoplado', name: 'Camión con acoplado', subtitle: '' },
  { id: 'semirremolque', name: 'Semirremolque', subtitle: '' },
];

export function OwnerOperatorSignup2Vehicle({ onNext, onSkip, onBack }: OwnerOperatorSignup2VehicleProps) {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const getTruckIcon = (typeId: string) => {
    const color = "#1E5126";
    const strokeWidth = 2.5;

    switch (typeId) {
      case 'chico':
        // Camión chico - single short truck
        return (
          <svg width="70" height="45" viewBox="0 0 70 45" className="mx-auto">
            {/* Cabina */}
            <rect x="10" y="18" width="12" height="14" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Caja corta */}
            <rect x="24" y="16" width="28" height="16" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Ruedas delanteras */}
            <circle cx="18" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            {/* Ruedas traseras */}
            <circle cx="46" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'mediano':
        // Camión mediano - longer truck with double rear axle
        return (
          <svg width="80" height="45" viewBox="0 0 80 45" className="mx-auto">
            {/* Cabina */}
            <rect x="8" y="17" width="13" height="15" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Caja más larga */}
            <rect x="22" y="15" width="45" height="17" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Ruedas delanteras */}
            <circle cx="16" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            {/* Doble eje trasero */}
            <circle cx="48" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="58" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'acoplado':
        // Camión con acoplado - truck + separate trailer
        return (
          <svg width="95" height="45" viewBox="0 0 95 45" className="mx-auto">
            {/* Camión cabina */}
            <rect x="5" y="18" width="11" height="13" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Camión caja */}
            <rect x="17" y="16" width="22" height="15" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Enganche/conexión visible */}
            <line x1="39" y1="23" x2="45" y2="23" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="42" cy="23" r="2" fill={color} />
            {/* Acoplado (remolque separado) */}
            <rect x="45" y="15" width="38" height="16" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Ruedas camión */}
            <circle cx="13" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="33" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            {/* Ruedas acoplado */}
            <circle cx="58" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="75" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      case 'semirremolque':
        // Semirremolque - tractor head + trailer (no front wheels on trailer)
        return (
          <svg width="95" height="45" viewBox="0 0 95 45" className="mx-auto">
            {/* Cabeza tractora */}
            <rect x="5" y="19" width="14" height="12" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Semirremolque apoyado sobre la tractora */}
            <rect x="18" y="13" width="65" height="18" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            {/* Línea que muestra apoyo del semirremolque sobre tractora */}
            <line x1="18" y1="25" x2="18" y2="31" stroke={color} strokeWidth={strokeWidth} />
            {/* Ruedas tractora */}
            <circle cx="13" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            {/* Ruedas semirremolque (solo atrás, no adelante) */}
            <circle cx="52" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="62" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="72" cy="33" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
      default:
        return (
          <svg width="70" height="45" viewBox="0 0 70 45" className="mx-auto">
            <rect x="10" y="18" width="12" height="14" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            <rect x="24" y="16" width="28" height="16" fill={color} stroke={color} strokeWidth={strokeWidth} rx="1" />
            <circle cx="18" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
            <circle cx="46" cy="34" r="4" fill="white" stroke={color} strokeWidth={strokeWidth} />
          </svg>
        );
    }
  };

  const getUnitsOfType = (typeId: string) => {
    return units.filter(u => u.typeId === typeId);
  };

  const getUnitCount = (typeId: string) => {
    return getUnitsOfType(typeId).length;
  };

  const isTypeSelected = (typeId: string) => {
    return getUnitCount(typeId) > 0;
  };

  const handleCardClick = (typeId: string, typeName: string) => {
    const count = getUnitCount(typeId);
    if (count === 0) {
      // Add first unit of this type
      addUnit(typeId, typeName);
    } else {
      // Remove all units of this type
      setUnits(units.filter(u => u.typeId !== typeId));
      // Clear expanded state for this type
      setExpandedUnits(new Set([...expandedUnits].filter(id => !id.startsWith(`${typeId}-`))));
    }
  };

  const addUnit = (typeId: string, typeName: string) => {
    const unitsOfType = getUnitsOfType(typeId);
    const newUnitNumber = unitsOfType.length + 1;
    const newUnit: UnitItem = {
      id: `${typeId}-${Date.now()}-${newUnitNumber}`,
      typeId,
      typeName,
      unitNumber: newUnitNumber,
      capacityAdult: 0,
      capacityYoung: 0,
      youngManuallyEdited: false,
    };
    setUnits([...units, newUnit]);
    // Auto-expand the newly added unit
    setExpandedUnits(new Set([...expandedUnits, newUnit.id]));
  };

  const removeUnit = (typeId: string) => {
    const unitsOfType = getUnitsOfType(typeId);
    if (unitsOfType.length > 0) {
      // Remove the last unit of this type
      const lastUnit = unitsOfType[unitsOfType.length - 1];
      setUnits(units.filter(u => u.id !== lastUnit.id));
      // Remove from expanded set
      const newExpanded = new Set(expandedUnits);
      newExpanded.delete(lastUnit.id);
      setExpandedUnits(newExpanded);
    }
  };

  const toggleUnitExpanded = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleCapacityAdultChange = (unitId: string, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, Math.min(45, parseInt(value) || 0));
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        // Auto-suggest young capacity if not manually edited
        const suggestedYoung = !unit.youngManuallyEdited
          ? Math.min(numValue * 2, 80)
          : unit.capacityYoung;
        return {
          ...unit,
          capacityAdult: numValue,
          capacityYoung: suggestedYoung,
        };
      }
      return unit;
    }));
  };

  const handleCapacityYoungChange = (unitId: string, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, Math.min(80, parseInt(value) || 0));
    setUnits(units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          capacityYoung: numValue,
          youngManuallyEdited: true, // Mark as manually edited
        };
      }
      return unit;
    }));
  };

  const calculateTotals = () => {
    const totalUnits = units.length;
    const totalAdults = units.reduce((sum, unit) => sum + unit.capacityAdult, 0);
    const totalYoung = units.reduce((sum, unit) => sum + unit.capacityYoung, 0);
    return { totalUnits, totalAdults, totalYoung };
  };

  const isValid = () => {
    return units.length > 0 && units.every(unit => unit.capacityAdult > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      onNext({ units });
    }
  };

  const totals = calculateTotals();

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Paso 2 de 5</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-sm hover:text-gray-600 mb-6"
            style={{ color: '#1E5126' }}
          >
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tu flota</h1>
            <p className="text-gray-600">
              Seleccioná los tipos de camión que tenés y configurá la capacidad de cada unidad
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Truck Type Selection Grid */}
            <div>
              <h2 className="text-lg font-semibold text-black mb-4">Tipos de camión</h2>
              <div className="grid grid-cols-2 gap-4">
                {PREDEFINED_TYPES.map((type) => {
                  const selected = isTypeSelected(type.id);
                  const count = getUnitCount(type.id);
                  return (
                    <div key={type.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => handleCardClick(type.id, type.name)}
                        className="relative border-2 rounded-xl p-4 bg-white hover:shadow-md transition-all"
                        style={{
                          borderColor: selected ? '#1E5126' : '#e5e7eb',
                          backgroundColor: selected ? '#f0fdf4' : 'white',
                        }}
                      >
                        {selected && count > 0 && (
                          <div
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-md"
                            style={{ backgroundColor: '#1E5126' }}
                          >
                            {count}
                          </div>
                        )}
                        <div className="mb-3">
                          {getTruckIcon(type.id)}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-black">
                            {type.name}
                          </div>
                          {type.subtitle && (
                            <div className="text-xs text-gray-500 mt-1">
                              {type.subtitle}
                            </div>
                          )}
                        </div>
                      </button>

                      {selected && (
                        <div className="flex items-center justify-center gap-3 mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUnit(type.id);
                            }}
                            disabled={count === 0}
                            className="flex items-center gap-1 px-3 py-2 border-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              borderColor: '#1E5126',
                              color: '#1E5126',
                            }}
                          >
                            <Minus className="w-4 h-4" />
                            <span className="hidden sm:inline">Quitar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addUnit(type.id, type.name);
                            }}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                            style={{
                              backgroundColor: '#1E5126',
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Agregar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capacity Configuration per Unit */}
            {units.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-black">Capacidad por unidad</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Agregá la capacidad real de cada unidad. Si tenés vehículos del mismo tipo con capacidades distintas, cargalos por separado.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {units.map((unit) => {
                    const isExpanded = expandedUnits.has(unit.id);
                    return (
                      <div
                        key={unit.id}
                        className="border-2 rounded-xl bg-white transition-all"
                        style={{
                          borderColor: isExpanded ? '#1E5126' : '#e5e7eb',
                        }}
                      >
                        {/* Unit Header - Always visible */}
                        <button
                          type="button"
                          onClick={() => toggleUnitExpanded(unit.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-t-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: '#1E5126' }}
                            >
                              {unit.unitNumber}
                            </div>
                            <div className="text-left">
                              <h3 className="text-sm font-semibold text-black">
                                {unit.typeName} — Unidad {unit.unitNumber}
                              </h3>
                              {!isExpanded && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {unit.capacityAdult > 0 || unit.capacityYoung > 0 ? (
                                    <>Adultos: {unit.capacityAdult} | Jóvenes: {unit.capacityYoung}</>
                                  ) : (
                                    <span className="text-amber-600">Capacidades pendientes</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {/* Unit Form - Collapsible */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Adultos */}
                              <div>
                                <Label htmlFor={`adult-${unit.id}`}>
                                  Capacidad Gordos / Adultos
                                  <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                  id={`adult-${unit.id}`}
                                  type="number"
                                  min="0"
                                  max="45"
                                  value={unit.capacityAdult || ''}
                                  onChange={(e) => handleCapacityAdultChange(unit.id, e.target.value)}
                                  placeholder="Ej: 40"
                                  className="mt-1.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Máximo 45 cabezas según SENACSA
                                </p>
                              </div>

                              {/* Jóvenes */}
                              <div>
                                <Label htmlFor={`young-${unit.id}`}>
                                  Capacidad Desmamantes / Jóvenes
                                  <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                  id={`young-${unit.id}`}
                                  type="number"
                                  min="0"
                                  max="80"
                                  value={unit.capacityYoung || ''}
                                  onChange={(e) => handleCapacityYoungChange(unit.id, e.target.value)}
                                  placeholder="Ej: 70"
                                  className="mt-1.5"
                                  style={{
                                    backgroundColor: unit.youngManuallyEdited ? 'white' : '#fefce8',
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {unit.youngManuallyEdited
                                    ? 'Editado manualmente'
                                    : 'Valor sugerido automáticamente. Podés editarlo.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {units.length === 0 && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 text-sm">
                  Seleccioná al menos un tipo de camión para continuar
                </p>
              </div>
            )}

            {/* Resumen de Flota */}
            {units.length > 0 && (
              <div
                className="border-2 rounded-xl p-6"
                style={{
                  backgroundColor: '#f0fdf4',
                  borderColor: '#1E5126',
                }}
              >
                <h3 className="text-lg font-bold text-black mb-4">Resumen de flota</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total de unidades</div>
                    <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>
                      {totals.totalUnits}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Capacidad total adultos</div>
                    <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>
                      {totals.totalAdults}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Capacidad total jóvenes</div>
                    <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>
                      {totals.totalYoung}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid()}
              className="w-full h-12 text-base"
              style={{
                backgroundColor: isValid() ? '#1E5126' : '#e5e7eb',
                opacity: isValid() ? 1 : 0.5,
                cursor: isValid() ? 'pointer' : 'not-allowed',
                color: 'white',
              }}
            >
              Continuar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
