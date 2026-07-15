# Auth Feature Module

Estructura feature-based para autenticación.

## Estructura

```
features/auth/
├── api/
│   └── authApi.ts          # Funciones de API (login, register, logout, etc.)
├── hooks/
│   ├── useAuth.ts          # Hook principal (inicialización + estado global)
│   ├── useLogin.ts         # Mutation para login
│   ├── useRegister.ts      # Mutation para registro
│   └── useLogout.ts        # Mutation para logout
├── stores/
│   └── authStore.ts        # Zustand store (user, isAuthenticated, etc.)
├── types/
│   └── auth.types.ts       # Tipos TypeScript (UserData, Tokens, etc.)
└── index.ts                # Barrel export
```

## Uso

```tsx
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, error } = useAuth();
  
  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'pass' });
  };
  
  return <div>{user?.email}</div>;
}
```

## Patrón para nuevos módulos

1. Crear carpeta en `features/{module-name}/`
2. Definir tipos en `types/`
3. Crear funciones de API en `api/`
4. Crear Zustand store si hay estado local
5. Crear hooks con TanStack Query para mutations/queries
6. Exportar todo desde `index.ts`
7. Importar desde `@/features/{module-name}`

## Stack

- **Zustand**: Estado global síncrono (user, isAuthenticated)
- **TanStack Query**: Estado asíncrono (API calls, cache, loading states)
- **apiClient**: Cliente HTTP base con auto-refresh de tokens
