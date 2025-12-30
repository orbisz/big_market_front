# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 + React 19 frontend for a lottery/raffle marketing platform ("幸运营销汇"). Users can spin wheels, play grid lotteries, sign in daily for rewards, and exchange credits for draw tickets.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build (outputs to standalone)
npm run start    # Run production server
npm run lint     # Run ESLint
```

**Docker build:**
```bash
./build.sh       # Builds docker image orbiszx/big-market-front-app:3.4
```

## Required URL Parameters

The app requires query parameters to function:
- `userId` - User identifier
- `activityId` - Activity/campaign ID

Example: `http://localhost:3000/?userId=user123&activityId=100301`

## Environment Configuration

Set `API_HOST_URL` in `.env.local` (default: `http://127.0.0.1:8091`). This backend API handles all lottery, user account, and product exchange operations.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) with standalone output
- **UI**: React 19 + Tailwind CSS 4
- **Lottery Components**: `@lucky-canvas/react` for wheel and grid animations
- **Path alias**: `@/*` maps to `./src/*`

### Source Structure

- `src/apis/index.tsx` - All API client functions (fetch-based)
- `src/app/page.tsx` - Main landing page with dynamic component loading
- `src/app/components/` - UI components (MemberCard, CalendarSign, SkuProduct, etc.)
- `src/app/pages/lucky/` - Lottery game components (wheel and grid)
- `src/types/` - TypeScript interfaces for API responses

### Key API Functions (src/apis/index.tsx)

| Function | Purpose |
|----------|---------|
| `activityStrategyArmory()` | Initialize lottery (required before play) |
| `queryRaffleAwardList()` | Get available prizes |
| `draw()` | Execute lottery draw |
| `queryUserActivityAccount()` | Get user's draw quotas |
| `queryUserCreditAccount()` | Get user credits balance |
| `calendarSignRebate()` | Daily sign-in for rewards |
| `creditPayExchangeSku()` | Exchange credits for draw tickets |
| `queryRaffleStrategyRuleWeight()` | Get tier/rule information |

### Component Flow

1. **StrategyArmory** - User must initialize lottery strategy first
2. **MemberCard** - Displays credits, daily draws, sign-in status
3. **LuckyWheel/LuckyGrid** - Interactive lottery games
4. **StrategyRuleWeight** - Shows progress toward guaranteed prizes
5. **SkuProduct** - Credit exchange shop

## Known Issues

- The `@lucky-canvas/react` library has TypeScript type issues; multiple `@ts-expect-error` comments are used to suppress these
- All interactive components use `"use client"` directive (React client components)
