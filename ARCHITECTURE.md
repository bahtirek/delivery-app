# Architecture Overview

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo |
| Routing | React Native Navigation (not Expo Router) |
| Server State | React Query (TanStack Query v5) |
| Client/UI State | Zustand v4 |
| Mock Backend | JSON Server (`mock/db.json`, port 3001) |
| Language | TypeScript (strict mode) |

---

## Folder Structure

```
/
├── app.json
├── package.json
├── babel.config.js         # @/ path alias via babel-plugin-module-resolver
├── tsconfig.json           # Strict mode + @/ alias paths
├── SETUP.md                # Getting started guide
├── app/
│   └── index.tsx           # Entry point — QueryClientProvider + RootNavigator
├── mock/
│   ├── db.json             # JSON Server database (stores, products, orders, users)
│   └── package.json        # Run with: cd mock && npm start
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── src/
    ├── navigation/
    │   ├── RootNavigator.tsx     # Switches between Auth and App based on token
    │   ├── AuthNavigator.tsx     # Splash → Login → Register → SetAddress
    │   ├── AppNavigator.tsx      # Wraps the tab navigator
    │   └── TabNavigator.tsx      # Bottom tabs: Home, Search, Orders, Profile
    ├── screens/
    │   ├── Splash/
    │   ├── Login/
    │   ├── Register/
    │   ├── SetAddress/
    │   ├── Home/
    │   ├── Store/
    │   ├── ProductDetail/
    │   ├── Search/
    │   ├── CategoryResults/
    │   ├── Cart/
    │   ├── Checkout/
    │   ├── OrderTracking/
    │   ├── OrderHistory/
    │   ├── Profile/
    │   ├── Addresses/
    │   └── Payment/
    │       # Each screen folder: [Name]Screen.tsx + [Name]Screen.styles.ts
    ├── components/               # Shared UI components
    │   ├── Badge/
    │   ├── BottomSheet/
    │   ├── Button/
    │   ├── Card/
    │   ├── CartItem/
    │   ├── EmptyState/
    │   ├── Header/
    │   ├── LoadingSpinner/
    │   ├── ProductCard/
    │   ├── StoreCard/
    │   └── StoreMapView/       # MapView + pins + radius circle + animated store card
    │       # Each component folder: [Name].tsx + [Name].styles.ts
    ├── store/                    # Zustand stores (client state only)
    │   ├── useAuthStore.ts
    │   ├── useCartStore.ts
    │   ├── useLocationStore.ts
    │   ├── useUIStore.ts
    │   └── index.ts
    ├── queries/                  # React Query hooks (server state)
    │   ├── queryKeys.ts
    │   ├── useStoreQueries.ts
    │   ├── useProductQueries.ts
    │   ├── useOrderQueries.ts
    │   └── useUserQueries.ts
    ├── services/                 # Raw API functions — no React Query here
    │   ├── apiClient.ts          # Base fetch wrapper
    │   ├── authService.ts        # login + register (mock, swap for real API later)
    │   ├── storeService.ts
    │   ├── productService.ts
    │   ├── orderService.ts
    │   └── userService.ts
    ├── types/
    │   ├── models.ts             # Store, Product, Order, User, CartItem, etc.
    │   ├── navigation.ts         # All param lists and screen prop types
    │   └── index.ts
    ├── constants/
    │   ├── colors.ts             # full warm palette + category/gradient tokens
    │   ├── spacing.ts            # spacing, borderRadius, fontSize, fontWeight, shadow
    │   ├── typography.ts         # fontFamily, textStyles presets
    │   ├── config.ts             # API_BASE_URL, DELIVERY_RADIUS_MILES, poll interval
    │   └── index.ts
    ├── hooks/                    # Custom non-query hooks
    │   ├── useFonts.ts           # loads Inter via expo-font, hides splash when ready
    │   ├── useDebounce.ts
    │   ├── useLocation.ts
    │   └── useCart.ts
    └── utils/
    │   └── storeVisuals.ts       # getStoreVisual(), getCategoryVisual() for illustrated placeholders
```

---

## Routing (React Native Navigation)

- **We use React Native Navigation**, not Expo Router. Do NOT suggest file-based routing.
- All navigators live in `src/navigation/`.
- `RootNavigator` reads the auth token from `useAuthStore` and switches between `AuthNavigator` and `AppNavigator`.
- `AppNavigator` wraps `TabNavigator`. Each tab has its own stack navigator for nested screens.
- All screen param lists are typed in `src/types/navigation.ts`.
- Navigation is accessed via `useNavigation` typed with the correct navigator.

```typescript
// src/types/navigation.ts — actual param lists used in this project

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  SetAddress: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Store: { storeId: string };
  ProductDetail: { productId: string; storeId: string };
};

export type OrdersStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  CategoryResults: { category: string; storeId?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Addresses: undefined;
  Payment: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};
```

---

## Auth Pattern

- Auth state lives entirely in `useAuthStore` (Zustand) — token, userId, and the user object.
- `RootNavigator` reads `token` from `useAuthStore` to decide which navigator to show. No manual navigation needed after login or logout — changing the token is enough.
- On login/register: call `authService`, then call `setAuth(token, userId)` and `setUser(user)`. The navigator switches automatically.
- On logout: call `useAuthStore.getState().logout()` and `useCartStore.getState().clearCart()`.
- The user object is stored directly in `useAuthStore` after login (set via `setUser`). It is NOT re-fetched via React Query on every mount — it comes from the auth response.

**Auth flow sequence:**
```
App open → Splash (1.8s auto-advance) → Login
Login success  → setAuth + setUser → RootNavigator renders AppNavigator
Register       → setAuth + setUser → navigate('SetAddress') → same token switch
SetAddress     → setDeliveryAddress in useLocationStore → app is ready
Logout         → logout() + clearCart() → RootNavigator renders AuthNavigator
```

**Swapping to a real backend:** only `src/services/authService.ts` changes. The mock `login` finds a user by email in JSON Server; a real implementation would `POST /auth/login` and receive a JWT. Everything else stays the same.

```typescript
// src/store/useAuthStore.ts
interface AuthState {
  token:   string | null;
  userId:  string | null;
  user:    User | null;       // set from auth response, not re-fetched
  setAuth: (token: string, userId: string) => void;
  setUser: (user: User) => void;
  logout:  () => void;
}

// src/services/authService.ts — shape that screens depend on
export interface AuthResponse {
  token: string;
  userId: string;
  user: User;
}
```

---

## State Management

### The Split

| Type of State | Tool | Actual examples in this project |
|---|---|---|
| Server data | React Query | stores, products, orders, user profile |
| Client / UI state | Zustand | auth token, cart items, delivery address, toasts |

**Never put server data in Zustand.** React Query owns anything that comes from the API.
**Never use React Query for pure UI state.** Zustand owns anything local to the app.

### Zustand stores in this project

| Store | Owns |
|---|---|
| `useAuthStore` | token, userId, cached user object, setAuth, logout |
| `useCartStore` | cart items, storeId, add/remove/update/clear, subtotal, itemCount |
| `useLocationStore` | selected delivery address |
| `useUIStore` | toast messages (auto-dismiss after 3s) |

---

## React Query

- All query hooks live in `src/queries/`, one file per domain.
- Query keys are centralized in `src/queries/queryKeys.ts` — never hardcode strings inline.
- Service functions live in `src/services/` — query hooks call services, never `fetch` directly.
- `QueryClient` is set up once in the app root with `QueryClientProvider`.
- Use `useQuery` for reads, `useMutation` for writes, `useInfiniteQuery` for paginated lists.
- Invalidate related queries in `onSuccess` of mutations.
- For live order tracking, use `refetchInterval: ORDER_POLL_INTERVAL_MS` (15s, set in `config.ts`).

```typescript
// src/queries/queryKeys.ts — actual keys used in this project
export const queryKeys = {
  stores:   { all: ['stores'], detail: (id) => ['stores', id] },
  products: { byStore: (storeId) => ['products', 'store', storeId], detail: (id) => ['products', id] },
  orders:   { byUser: (userId) => ['orders', 'user', userId], detail: (id) => ['orders', id] },
  user:     { detail: (id) => ['user', id] },
};

// src/queries/useOrderQueries.ts — live polling example
export const useOrder = (id: string, live = false) =>
  useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn:  () => orderService.getById(id),
    enabled:  !!id,
    refetchInterval: live ? ORDER_POLL_INTERVAL_MS : false,
  });
```

---

## API / Data Layer

- `src/services/apiClient.ts` is a thin typed `fetch` wrapper — the single place where the base URL and headers are set.
- Each service (`storeService`, `productService`, `orderService`, `userService`) calls `apiClient` with typed return types.
- **Never call `apiClient` or `fetch` directly from components or stores.**
- `API_BASE_URL` lives in `src/constants/config.ts`. Change it to your machine's local IP when testing on a physical device.

```typescript
// src/services/apiClient.ts
export const apiClient = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
};
```

### Mock API routes (JSON Server)

| Method | Route | Used by |
|---|---|---|
| GET | `/stores` | `useStores` |
| GET | `/stores/:id` | `useStore` |
| GET | `/products?storeId=` | `useStoreProducts` |
| GET | `/products/:id` | `useProduct` |
| GET | `/orders?userId=` | `useOrderHistory` |
| GET | `/orders/:id` | `useOrder` |
| POST | `/orders` | `usePlaceOrder` |
| PATCH | `/orders/:id` | order status updates |
| GET | `/users/:id` | `useUser` |
| PATCH | `/users/:id` | profile updates |

---

## Cart Logic

The cart lives entirely in `useCartStore` (Zustand) — it is never persisted to the API until checkout.

Key behaviour to preserve:
- Adding a product from a **different store** than the current cart clears the cart and starts a new one (to enforce single-store orders).
- `subtotal()` and `itemCount()` are computed functions on the store, not stored values.
- On successful order placement, call `useCartStore.getState().clearCart()`.

---

## App Entry Point

`app/index.tsx` is the root — it sets up `QueryClientProvider` with a shared `QueryClient` and renders `RootNavigator`. Nothing else goes here.

```typescript
// app/index.tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
```

---

## Path Alias

All internal imports use `@/` instead of relative paths. This is configured in `babel.config.js` (via `babel-plugin-module-resolver`) and `tsconfig.json`. `@/` maps to `src/`.

```typescript
// ✅ Always use this
import { useAuthStore } from '@/store';
import type { Store } from '@/types';

// ❌ Never use relative paths for src/ imports
import { useAuthStore } from '../../store';
```

---

## Map View (Search screen)

The Search screen has a **List / Map toggle** in the header. In map mode:

- `react-native-maps` (`MapView`, `Marker`, `Circle`) renders the map.
- A semi-transparent orange `Circle` shows the 0.5-mile delivery radius, centered on `useLocationStore.deliveryAddress`.
- Each store is a custom `Marker` — colored by type (orange = convenience, green = grocery, red = restaurant), greyed out if closed.
- Tapping a pin springs up a `StoreCalloutCard` from the bottom with store name, rating, ETA, delivery fee, and a "View store" button.
- Tapping the map background dismisses the card.
- A recenter button (top-right) animates back to the user's delivery address.
- A legend (top-left) explains the pin colors.
- The blue user location dot uses `showsUserLocation` on `MapView`.

**Install:**
```bash
npx expo install react-native-maps
```

**Android:** Add your Google Maps API key to `app.json` under `android.config.googleMaps.apiKey`.
**iOS:** Works with Apple Maps by default (`PROVIDER_DEFAULT`). Optionally add a Google Maps key for Google Maps on iOS.

**`StoreMapView` component** lives in `src/components/StoreMapView/` and takes:
- `stores: Store[]` — all stores to pin
- `userLat / userLng` — center of the radius circle (from `useLocationStore`)
- `onStorePress: (store: Store) => void` — called when "View store" is tapped

---

## Screen Build Status

| Screen | Status | Notes |
|---|---|---|
| Splash | ✅ Built | Auto-advances to Login after 1.8s |
| Login | ✅ Built | Email + password, inline validation |
| Register | ✅ Built | 5-field form, navigates to SetAddress |
| SetAddress | ✅ Built | Quick-pick chips + manual form, sets useLocationStore |
| Home | ✅ Built | Orange header, floating search, filter chips, open/closed store list |
| Store | ✅ Built | Orange hero, sticky category tabs, popular row, product grid, floating cart bar |
| ProductDetail | ✅ Built | Hero illustration, quantity selector, add-to-cart CTA, cross-store alert |
| Search | ✅ Built | Live store search, browse-by-category grid, List/Map toggle |
| CategoryResults | ✅ Built | Products by category across all relevant stores |
| Cart | ✅ Built | Item list, tip selector, order summary, min-order guard |
| Checkout | ✅ Built | Address, payment, items, tip, place order via usePlaceOrder |
| OrderTracking | ✅ Built | Live polling, animated stepper, driver info, order summary |
| OrderHistory | ✅ Built | Sorted orders list, status pills, tap to track |
| AddAddress | ✅ Built | Add or edit address — label picker, street/city/ZIP, set-as-delivery toggle, delete |
| AddPayment | ✅ Built | Add or edit card — live card preview, brand picker, set-default toggle, remove |
| Profile | ✅ Built | Avatar, address, account links, sign out |
| Addresses | ✅ Built | Saved addresses, tap to set active, Edit button per row, ＋ Add in header |
| Payment | ✅ Built | Saved cards, default badge, Edit per card, ＋ Add in header |

---

- Screens live in `src/screens/[ScreenName]/[ScreenName]Screen.tsx`.
- Shared components live in `src/components/[ComponentName]/[ComponentName].tsx`.
- Components consume React Query hooks for server data, Zustand selectors for client state.
- Components never call services or `fetch` directly.
- Styles are co-located in `[Name].styles.ts` using `StyleSheet.create`.

---

## Key Constraints (always follow these)

- **No Expo Router** — React Native Navigation only.
- **No Redux** — Zustand for client state, React Query for server state.
- **No API calls in components** — always go through `src/queries/`.
- **No server data in Zustand** — React Query cache owns it.
- **No inline styles** — always use `StyleSheet.create`.
- **TypeScript strict mode** — no `any` without an explanatory comment.
- **Query keys from `queryKeys.ts` only** — never hardcode strings.
- **Single-store cart rule** — adding from a different store clears the cart first.
