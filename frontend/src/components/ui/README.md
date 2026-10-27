# UI Primitives

## Overview
Re-usable design system UI primitive components built with Tailwind CSS, Lucide icons, and Radix UI primitives.

## Interface
- `Button` / `buttonVariants`: Configurable button component with multiple style and size variants.
- `Badge` / `badgeVariants`: Tag and label badge indicator component.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: Card container layout primitives.
- `Input`: Standardized form text input with focus rings and disabled styling.
- `ScrollArea` / `ScrollBar`: Custom accessible scrollable container.
- `Select`: Dropdown selection primitives.
- `Sheet`: Sliding drawer modal container.

## Invariants
- Visual styling adheres to design tokens and responsive utility classes.
- UI components accept `className` overrides merged via `cn()`.

## Side Effects
- DOM event dispatching and keyboard focus trap management in interactive primitives (Select, Sheet).

## Verification
- Run: `cd frontend && npx tsc --noEmit`
