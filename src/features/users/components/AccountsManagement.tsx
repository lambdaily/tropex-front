import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Star, Search, Loader2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  useUsers,
  useSuspendUser,
  useReactivateUser,
  ROLE_META,
  STATUS_META,
  ROLE_LABELS,
  STATUS_LABELS,
  getUserRole,
  getUserStatus,
  type User,
  type UserRole,
  type UserStatus,
} from '@/features/users';

export function AccountsManagement() {
  const { data: users = [], isLoading, isError, error, refetch } = useUsers();
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && !u.roles.includes(roleFilter)) return false;
      const userStatus = getUserStatus(u);
      if (statusFilter !== 'all' && userStatus !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = getUserDisplayName(u).toLowerCase();
        const matches = fullName.includes(query) ||
          (u.email ?? '').toLowerCase().includes(query) ||
          (u.legal_name ?? '').toLowerCase().includes(query) ||
          String(u.id).includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const roleCounts = useMemo(() => {
    const roles: UserRole[] = ['ganadero', 'empresa', 'owner-operator', 'chofer'];
    return roles.map((r) => ({
      role: r,
      count: users.filter((u) => u.roles.includes(r)).length,
    }));
  }, [users]);

  const handleSuspend = (user: User) => {
    suspendMutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(`${getUserDisplayName(user)} fue suspendido.`);
        setSelectedUser(null);
      },
      onError: () => {
        toast.error('No se pudo suspender al usuario.');
      },
    });
  };

  const handleReactivate = (user: User) => {
    reactivateMutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(`${getUserDisplayName(user)} fue reactivado.`);
        setSelectedUser(null);
      },
      onError: () => {
        toast.error('No se pudo reactivar al usuario.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E5126]" />
      </div>
    );
  }

  if (isError) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[AccountsManagement] Renderizando error:', { error, errorMsg });
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-semibold">Error al cargar usuarios</p>
        <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
        <pre className="text-xs text-red-500 mt-2 overflow-auto max-h-40">
          {error instanceof Error ? error.stack : String(error)}
        </pre>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-[#1E5126] text-white rounded-lg text-sm hover:bg-[#1E5126]/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header totalUsers={users.length} />

      <RoleCountCards
        counts={roleCounts}
        onCardClick={(role) => {
          setRoleFilter(role);
          setStatusFilter('all');
        }}
      />

      <Filters
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      <UsersTable
        users={filteredUsers}
        onRowClick={setSelectedUser}
      />

      {selectedUser && (
        <UserDetailSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
          isPending={suspendMutation.isPending || reactivateMutation.isPending}
        />
      )}
    </div>
  );
}

/* ─── Sub-componentes ─── */

function Header({ totalUsers }: { totalUsers: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#08221A]">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalUsers} {totalUsers === 1 ? 'cuenta registrada' : 'cuentas registradas'}
        </p>
      </div>
    </div>
  );
}

function RoleCountCards({
  counts,
  onCardClick,
}: {
  counts: { role: UserRole; count: number }[];
  onCardClick: (role: UserRole) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {counts.map(({ role, count }) => (
        <button
          key={role}
          onClick={() => onCardClick(role)}
          className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1E5126] hover:shadow-sm transition-all"
        >
          <div
            className="text-2xl font-bold"
            style={{ color: ROLE_META[role].color }}
          >
            {count}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {ROLE_META[role].label}s registrados
          </div>
        </button>
      ))}
    </div>
  );
}

function Filters({
  roleFilter,
  statusFilter,
  searchQuery,
  onRoleChange,
  onStatusChange,
  onSearchChange,
}: {
  roleFilter: string;
  statusFilter: string;
  searchQuery: string;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}) {
  const roles: (UserRole | 'all')[] = ['all', 'ganadero', 'empresa', 'owner-operator', 'chofer'];
  const statuses: (UserStatus | 'all')[] = ['all', 'active', 'pending', 'suspended', 'rejected'];

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, email o ID…"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-transparent"
        />
      </div>
      <select
        value={roleFilter}
        onChange={(e) => onRoleChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

function UsersTable({
  users,
  onRowClick,
}: {
  users: User[];
  onRowClick: (user: User) => void;
}) {
  if (users.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Usuario</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Rol</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Departamento</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Viajes</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">GMV</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Rating</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} onClick={() => onRowClick(user)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user, onClick }: { user: User; onClick: () => void }) {
  const fullName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const role = ROLE_META[getUserRole(user)];
  const status = STATUS_META[getUserStatus(user)];

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: role.color }}
          >
            {initials}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{fullName}</div>
            <div className="text-xs text-gray-500 font-mono">USR-{String(user.id).padStart(4, '0')}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: `${role.color}20`, color: role.color }}
        >
          {role.label}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-gray-700">{getUserDepartment(user)}</td>
      <td className="px-4 py-3 hidden md:table-cell text-right text-gray-700">
        {getUserTrips(user) || '—'}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-right text-gray-700">
        {getUserTrips(user) > 0 ? formatGs(getUserTrips(user) * 1_500_000) : '—'}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-right">
        {getUserRating(user) > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Star className="w-3 h-3 text-[#F58718] fill-[#F58718]" />
            {getUserRating(user).toFixed(1)}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: `${status.color}20`, color: status.color }}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-12 text-center">
      <UsersIcon className="w-12 h-12 text-gray-300 mx-auto" />
      <p className="text-gray-500 mt-3">No hay usuarios que coincidan con los filtros</p>
    </div>
  );
}

function UserDetailSheet({
  user,
  onClose,
  onSuspend,
  onReactivate,
  isPending,
}: {
  user: User;
  onClose: () => void;
  onSuspend: (user: User) => void;
  onReactivate: (user: User) => void;
  isPending: boolean;
}) {
  const fullName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const role = ROLE_META[getUserRole(user)];
  const status = STATUS_META[getUserStatus(user)];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: role.color }}
            >
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500">{user.legal_name || user.email}</p>
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${status.color}20`, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <DetailRow label="Rol" value={role.label} />
          {user.sub_type && <DetailRow label="Subtipo" value={user.sub_type} />}
          <DetailRow label="Email" value={user.email || '—'} />
          <DetailRow label="Teléfono" value={user.phone || '—'} />
          {user.ruc && <DetailRow label="RUC" value={user.ruc} />}
          {user.cedula && <DetailRow label="Cédula" value={user.cedula} />}
          {user.address && <DetailRow label="Dirección" value={user.address} />}
          <DetailRow label="Departamento" value={getUserDepartment(user)} />

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
            <MetricBox label="Viajes" value={String(getUserTrips(user))} />
            <MetricBox label="GMV" value={getUserTrips(user) > 0 ? formatGs(getUserTrips(user) * 1_500_000) : '—'} />
            <MetricBox label="Rating" value={getUserRating(user) > 0 ? getUserRating(user).toFixed(1) : '—'} />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <a
            href={`tel:${user.phone}`}
            className="flex-1 py-2.5 border-2 border-[#1E5126] text-[#1E5126] rounded-lg font-bold text-center text-sm hover:bg-[#1E5126]/5"
          >
            Llamar
          </a>
          <a
            href={`mailto:${user.email}`}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold text-center text-sm hover:bg-gray-50"
          >
            Email
          </a>
          {user.status === 'active' && (
            <button
              onClick={() => onSuspend(user)}
              disabled={isPending}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? 'Suspendiendo…' : 'Suspender'}
            </button>
          )}
          {user.status === 'suspended' && (
            <button
              onClick={() => onReactivate(user)}
              disabled={isPending}
              className="flex-1 py-2.5 bg-[#1E5126] text-white rounded-lg font-bold text-sm hover:bg-[#1E5126]/90 disabled:opacity-50"
            >
              {isPending ? 'Reactivando…' : 'Reactivar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-[#1E5126]">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function formatGs(amount: number): string {
  return `₲ ${amount.toLocaleString('es-PY')}`;
}

function getUserDisplayName(user: User): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.legal_name || user.email || `USR-${String(user.id).padStart(4, '0')}`;
}

function getUserInitials(user: User): string {
  const initials = getUserDisplayName(user)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || 'US';
}

function getUserDepartment(user: User): string {
  return user.establishments?.[0]?.department || user.department || '—';
}

function getUserTrips(user: User): number {
  return Number(user.trips_completed ?? 0);
}

function getUserRating(user: User): number {
  return Number(user.rating ?? 0);
}
