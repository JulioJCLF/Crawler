# React Context Providers

## Overview
React context providers managing global client-side state for shopping cart, pricing calculations, and visual theming.

## Interface
- `CartProvider({ children }: { children: ReactNode })`: Context provider for cart state.
- `useCart()`: Hook providing cart items, addition, quantity adjustments, removal, and checkout actions.
- `CartItem`: Contract holding product details, quantity, and calculated pricing within cart.
- `PricingProvider({ children }: { children: ReactNode })`: Context provider for currency and category markup configuration.
- `usePricing()`: Hook providing dynamic price calculation (`calculatePrice`), exchange rate, and category markups.
- `ThemeProvider({ children, defaultTheme, defaultLayout }: ThemeProviderProps)`: Context provider for UI themes and layout configurations.
- `useTheme()`: Hook exposing current theme, layout mode, and mutators.

## Invariants
- `useCart`, `usePricing`, and `useTheme` must be invoked within components wrapped by their corresponding Provider.
- Cart state automatically synchronizes with browser `localStorage`.
- Pricing calculations default to fallback defaults if remote `/api/pricing` is unreachable.

## Side Effects
- Reads and writes `localStorage` keys for persisting shopping cart items, theme preferences, and layout mode.
- Fetches pricing configuration from `/api/pricing` on mount in dynamic runtime environments.

## Verification
- Run: `cd frontend && npm test`
