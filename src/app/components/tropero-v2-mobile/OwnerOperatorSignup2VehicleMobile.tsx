import { useState } from 'react';
import { Beef, ChevronLeft, Plus, Minus } from 'lucide-react';

import type { SignupData } from '../../types/signup';
import { TruckTypeIcon } from '../TruckTypeIcon';
interface OwnerOperatorSignup2MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

interface UnitItem {
  id: string;
  typeId: string;
  typeName: string;
  unitNumber: number;
  capacityAdult: number;
  capacityYoung: number;
}

const TRUCK_TYPES = [
  { id: 'chico', name: 'Camión chico', subtitle: 'Eje simple' },
  { id: 'mediano', name: 'Camión mediano', subtitle: 'Doble eje' },
  { id: 'acoplado', name: 'Con acoplado', subtitle: '' },
  { id: 'semirremolque', name: 'Semirremolque', subtitle: '' },
];

export function OwnerOperatorSignup2VehicleMobile({ onNext, onSkip, onBack }: OwnerOperatorSignup2MobileProps) {
  const [units, setUnits] = useState<UnitItem[]>([]);

  const getUnitsOfType = (typeId: string) => units.filter((u) => u.typeId === typeId);
  const getCount = (typeId: string) => getUnitsOfType(typeId).length;

  const addUnit = (typeId: string, typeName: string) => {
    const existing = getUnitsOfType(typeId);
    const newUnit: UnitItem = {
      id: `${typeId}-${Date.now()}`,
      typeId, typeName,
      unitNumber: existing.length + 1,
      capacityAdult: 0,
      capacityYoung: 0,
    };
    setUnits([...units, newUnit]);
  };

  const removeUnit = (typeId: string) => {
    const existing = getUnitsOfType(typeId);
    if (existing.length > 0) {
      const last = existing[existing.length - 1];
      setUnits(units.filter((u) => u.id !== last.id));
    }
  };

  const updateUnit = (unitId: string, field: 'capacityAdult' | 'capacityYoung', value: number) => {
    setUnits(units.map((u) => u.id === unitId ? { ...u, [field]: value } : u));
  };

  const isValid = units.length > 0 && units.every((u) => u.capacityAdult > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext({ units });
  };

  const totals = {
    units: units.length,
    adults: units.reduce((s, u) => s + u.capacityAdult, 0),
    young: units.reduce((s, u) => s + u.capacityYoung, 0),
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 pb-3 pt-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <Beef className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">TROPEX</span>
          <button onClick={onSkip} className="ml-auto text-white/80 text-sm">Omitir</button>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 2 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 2 de 5 — Tu flota</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tu flota</h1>
        <p className="text-gray-500 text-sm mb-7">Seleccioná los tipos de camión que tenés</p>

        {/* Truck type grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {TRUCK_TYPES.map((type) => {
            const count = getCount(type.id);
            const selected = count > 0;
            return (
              <div key={type.id}>
                <button
                  type="button"
                  onClick={() => count === 0 ? addUnit(type.id, type.name) : removeUnit(type.id)}
                  className="w-full border-2 rounded-2xl p-4 text-center transition-all"
                  style={{
                    borderColor: selected ? '#1E5126' : '#e5e7eb',
                    backgroundColor: selected ? '#f0fdf4' : 'white',
                  }}
                >
                  <div className="flex items-center justify-center mb-2" style={{ height: 36 }}>
                    <TruckTypeIcon type={type.id} height={34} />
                  </div>
                  {selected && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-white text-xs font-bold mb-1" style={{ backgroundColor: '#1E5126' }}>
                      {count}
                    </span>
                  )}
                  <p className="font-semibold text-sm text-gray-900">{type.name}</p>
                  {type.subtitle && <p className="text-xs text-gray-400 mt-0.5">{type.subtitle}</p>}
                </button>

                {selected && (
                  <div className="flex items-center gap-2 mt-2 justify-center">
                    <button
                      type="button"
                      onClick={() => removeUnit(type.id)}
                      className="flex items-center gap-1 px-3 py-2 border-2 rounded-xl text-xs font-semibold"
                      style={{ borderColor: '#1E5126', color: '#1E5126' }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addUnit(type.id, type.name)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{ backgroundColor: '#1E5126' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Capacity per unit */}
        {units.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="font-bold text-gray-900">Capacidad por unidad</h2>
            {units.map((unit) => (
              <div key={unit.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#1E5126' }}>
                    {unit.unitNumber}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{unit.typeName} — Unidad {unit.unitNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adultos *</label>
                    <input
                      type="number"
                      min="0"
                      max="45"
                      value={unit.capacityAdult || ''}
                      onChange={(e) => updateUnit(unit.id, 'capacityAdult', Math.max(0, Math.min(45, parseInt(e.target.value) || 0)))}
                      placeholder="Ej: 40"
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Máx. 45</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jóvenes *</label>
                    <input
                      type="number"
                      min="0"
                      max="80"
                      value={unit.capacityYoung || ''}
                      onChange={(e) => updateUnit(unit.id, 'capacityYoung', Math.max(0, Math.min(80, parseInt(e.target.value) || 0)))}
                      placeholder="Ej: 70"
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Máx. 80</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {units.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center mb-6">
            <p className="text-gray-400 text-sm">Seleccioná al menos un tipo de camión</p>
          </div>
        )}

        {/* Summary */}
        {units.length > 0 && (
          <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: '#f0fdf4', borderColor: '#1E5126' }}>
            <h3 className="font-bold text-gray-900 mb-3">Resumen de flota</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Unidades', value: totals.units },
                { label: 'Adultos', value: totals.adults },
                { label: 'Jóvenes', value: totals.young },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button
          onClick={(e) => { e.preventDefault(); if (isValid) onNext({ units }); }}
          disabled={!isValid}
          className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40"
          style={{ backgroundColor: '#1E5126' }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
