# Keto-Tracker V2: Complete Design Specification

**Version:** 2.0.0  
**Date:** December 6, 2025  
**Status:** Design Phase  
**Target Stack:** React Native (Expo) + TypeScript + Zustand + TanStack Query + Tailwind v4

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Data Models & Schema](#data-models--schema)
5. [Component Architecture](#component-architecture)
6. [State Management Strategy](#state-management-strategy)
7. [API & Data Layer](#api--data-layer)
8. [Styling System](#styling-system)
9. [Testing Strategy](#testing-strategy)
10. [Approach A: Incremental Refactoring](#approach-a-incremental-refactoring)
11. [Approach B: Complete Rewrite](#approach-b-complete-rewrite)
12. [Migration Strategy](#migration-strategy)
13. [Performance Targets](#performance-targets)
14. [Security Considerations](#security-considerations)

---

## Executive Summary

### Current State Problems
- 826-line monolithic components
- No type safety (JavaScript)
- AsyncStorage as database
- Prop drilling everywhere
- Zero test coverage
- Inline styles (200+ lines per file)

### V2 Goals
- **Type Safety**: 100% TypeScript coverage
- **Maintainability**: Average component <150 lines
- **Performance**: <2s initial load, 60fps animations
- **Testability**: >80% code coverage
- **Scalability**: Support 10,000+ metric entries
- **Developer Experience**: Hot reload <1s, clear error messages

### Success Metrics
| Metric | V1 | V2 Target |
|--------|----|-----------| 
| Type Coverage | 0% | 100% |
| Test Coverage | 0% | 85% |
| Avg Component Size | 400 lines | 120 lines |
| Bundle Size | ~2MB | <800KB |
| Initial Load | ~4s | <2s |
| Build Time | ~45s | <20s |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │   Home     │  │    Log     │  │ Analytics  │  │  Settings │ │
│  │  Screen    │  │  Screen    │  │   Screen   │  │   Screen  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘ │
│        │               │               │               │        │
│        └───────────────┴───────────────┴───────────────┘        │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                    State Management Layer                        │
│  ┌──────────────────────────┴──────────────────────────┐        │
│  │              Zustand Global Store                    │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │        │
│  │  │   Auth   │  │  Theme   │  │   UI     │          │        │
│  │  │  Store   │  │  Store   │  │  Store   │          │        │
│  │  └──────────┘  └──────────┘  └──────────┘          │        │
│  └──────────────────────────────────────────────────────┘        │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                      Data Layer (TanStack Query)                 │
│  ┌──────────────────────────┴──────────────────────────┐        │
│  │         React Query Hooks & Cache                    │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │        │
│  │  │ useMetrics│ │useProfile│ │usePhases │          │        │
│  │  │   Query   │ │  Query   │ │  Query   │          │        │
│  │  └──────────┘  └──────────┘  └──────────┘          │        │
│  └──────────────────────────────────────────────────────┘        │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                      Service Layer                               │
│  ┌──────────────────────────┴──────────────────────────┐        │
│  │              API Services                            │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │        │
│  │  │ Metrics  │  │ Profile  │  │  Auth    │          │        │
│  │  │ Service  │  │ Service  │  │ Service  │          │        │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │        │
│  └───────┼─────────────┼─────────────┼─────────────────┘        │
│          │             │             │                          │
├──────────┼─────────────┼─────────────┼──────────────────────────┤
│                   Storage Layer                                  │
│  ┌───────┴─────────────┴─────────────┴─────────────────┐        │
│  │              SQLite Database (expo-sqlite)           │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │        │
│  │  │ metrics  │  │ profiles │  │  phases  │          │        │
│  │  │  table   │  │  table   │  │  table   │          │        │
│  │  └──────────┘  └──────────┘  └──────────┘          │        │
│  │                                                      │        │
│  │  Optional: Firebase Firestore (Cloud Sync)          │        │
│  └──────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
keto-tracker-v2/
├── src/
│   ├── app/                          # App entry & navigation
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   └── MainNavigator.tsx
│   │   └── providers/
│   │       ├── AppProviders.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── AuthButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useAuthForm.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── screens/
│   │   │       └── AuthScreen.tsx
│   │   │
│   │   ├── metrics/
│   │   │   ├── components/
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── MetricForm.tsx
│   │   │   │   ├── MetricsList.tsx
│   │   │   │   └── RatioDisplay.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMetrics.ts
│   │   │   │   ├── useTodayMetric.ts
│   │   │   │   └── useMetricForm.ts
│   │   │   ├── services/
│   │   │   │   └── metricsService.ts
│   │   │   ├── types/
│   │   │   │   └── metrics.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── calculations.ts
│   │   │   │   └── validation.ts
│   │   │   └── screens/
│   │   │       ├── HomeScreen.tsx
│   │   │       └── LogMetricsScreen.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── components/
│   │   │   │   ├── MetricsChart.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── TrendIndicator.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChartData.ts
│   │   │   │   └── useStatistics.ts
│   │   │   ├── types/
│   │   │   │   └── analytics.types.ts
│   │   │   └── screens/
│   │   │       └── AnalyticsScreen.tsx
│   │   │
│   │   ├── phases/
│   │   │   ├── components/
│   │   │   │   ├── PhaseCard.tsx
│   │   │   │   ├── PhaseProgress.tsx
│   │   │   │   └── PhaseList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCurrentPhase.ts
│   │   │   │   └── usePhaseAdvancement.ts
│   │   │   ├── services/
│   │   │   │   └── phaseService.ts
│   │   │   ├── types/
│   │   │   │   └── phases.types.ts
│   │   │   ├── constants/
│   │   │   │   └── phaseDefinitions.ts
│   │   │   └── screens/
│   │   │       └── PhaseInfoScreen.tsx
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── ThemeSelector.tsx
│   │       │   ├── SettingsItem.tsx
│   │       │   └── ExportButton.tsx
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       ├── types/
│   │       │   └── settings.types.ts
│   │       └── screens/
│   │           └── SettingsScreen.tsx
│   │
│   ├── shared/                       # Shared across features
│   │   ├── components/
│   │   │   ├── ui/                   # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Screen.tsx
│   │   │   │   ├── Container.tsx
│   │   │   │   └── ScrollView.tsx
│   │   │   └── feedback/
│   │   │       ├── ErrorMessage.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── LoadingState.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useAsync.ts
│   │   │   └── useKeyboard.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   └── config.ts
│   │   │
│   │   └── types/
│   │       ├── common.types.ts
│   │       └── api.types.ts
│   │
│   ├── lib/                          # Third-party integrations
│   │   ├── database/
│   │   │   ├── client.ts
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial.ts
│   │   │   │   ├── 002_add_indexes.ts
│   │   │   │   └── index.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   └── firestore.ts
│   │   │
│   │   └── query/
│   │       ├── client.ts
│   │       └── queryKeys.ts
│   │
│   ├── styles/                       # Global styles
│   │   ├── global.css
│   │   ├── themes.css
│   │   └── tailwind.config.js
│   │
│   └── types/                        # Global types
│       └── index.d.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── CONTRIBUTING.md
│
├── .env.example
├── app.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Technology Stack

### Core Framework
```json
{
  "runtime": "React Native 0.73+",
  "framework": "Expo SDK 50+",
  "language": "TypeScript 5.3+",
  "bundler": "Metro (Expo)"
}
```

### State Management
```json
{
  "global": "Zustand 4.4+",
  "server": "TanStack Query 5.0+",
  "forms": "React Hook Form 7.49+"
}
```

### Data Layer
```json
{
  "local": "expo-sqlite 13.0+",
  "cloud": "Firebase Firestore 10.7+",
  "validation": "Zod 3.22+"
}
```

### UI & Styling
```json
{
  "styling": "NativeWind 4.0+ (Tailwind v4)",
  "icons": "Heroicons (react-native-heroicons)",
  "charts": "Victory Native 36.9+",
  "animations": "Reanimated 3.6+"
}
```

### Testing
```json
{
  "unit": "Jest 29+",
  "component": "React Native Testing Library 12+",
  "e2e": "Detox 20+"
}
```

### Developer Tools
```json
{
  "linting": "ESLint 8+ with TypeScript",
  "formatting": "Prettier 3+",
  "git-hooks": "Husky 8+",
  "commits": "Commitlint 18+"
}
```

---

## Data Models & Schema

### TypeScript Types

```typescript
// src/features/metrics/types/metrics.types.ts

export interface DailyMetric {
  id: string;
  userId: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  glucose: number; // mg/dL
  ketones: number; // mmol/L
  drBozRatio: number; // Calculated: glucose / ketones
  weight?: number; // lbs or kg
  energy?: number; // 1-10 scale
  clarity?: number; // 1-10 scale
  notes?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  syncedAt?: string; // ISO 8601 timestamp
}

export interface MetricInput {
  glucose: number;
  ketones: number;
  weight?: number;
  energy?: number;
  clarity?: number;
  notes?: string;
}

export interface MetricStatistics {
  latest: number;
  average: number;
  best: number;
  worst: number;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
}
```

```typescript
// src/features/phases/types/phases.types.ts

export interface Phase {
  id: number;
  name: string;
  description: string;
  duration: number | null; // days, null for maintenance phase
  targetRatio: number;
  requirements: string[];
  tips: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  startDate: string; // ISO 8601 date
  currentPhase: number; // 1-12
  phaseStartDate: string; // ISO 8601 date
  targetDrBozRatio: number;
  preferences: {
    units: 'imperial' | 'metric';
    notifications: boolean;
    cloudSync: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PhaseProgress {
  currentPhase: Phase;
  daysInPhase: number;
  daysRemaining: number | null;
  progress: number; // 0-100
  canAdvance: boolean;
  nextPhase: Phase | null;
}
```

```typescript
// src/features/auth/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### SQLite Schema

```sql
-- src/lib/database/migrations/001_initial.ts

-- Users table (for offline support)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  phase_start_date TEXT NOT NULL,
  target_dr_boz_ratio REAL NOT NULL DEFAULT 80,
  units TEXT NOT NULL DEFAULT 'imperial',
  notifications INTEGER DEFAULT 1,
  cloud_sync INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily metrics
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  glucose REAL NOT NULL,
  ketones REAL NOT NULL,
  dr_boz_ratio REAL NOT NULL,
  weight REAL,
  energy INTEGER,
  clarity INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- Phases (static data, can be seeded)
CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER, -- NULL for maintenance
  target_ratio REAL NOT NULL,
  requirements TEXT NOT NULL, -- JSON array
  tips TEXT NOT NULL -- JSON array
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_user_date ON metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_user_created ON metrics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
```

### Zod Validation Schemas

```typescript
// src/features/metrics/utils/validation.ts

import { z } from 'zod';

export const MetricInputSchema = z.object({
  glucose: z
    .number()
    .positive('Glucose must be positive')
    .max(500, 'Glucose value seems too high')
    .min(20, 'Glucose value seems too low'),
  ketones: z
    .number()
    .positive('Ketones must be positive')
    .max(10, 'Ketones value seems too high')
    .min(0.1, 'Ketones value seems too low'),
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(1000, 'Weight value seems too high')
    .optional(),
  energy: z
    .number()
    .int()
    .min(1, 'Energy must be between 1-10')
    .max(10, 'Energy must be between 1-10')
    .optional(),
  clarity: z
    .number()
    .int()
    .min(1, 'Clarity must be between 1-10')
    .max(10, 'Clarity must be between 1-10')
    .optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type ValidatedMetricInput = z.infer<typeof MetricInputSchema>;
```

---

## Component Architecture

### Component Hierarchy

```
App
├── ErrorBoundary
│   └── AppProviders
│       ├── QueryClientProvider (TanStack Query)
│       ├── AuthProvider (Zustand)
│       └── ThemeProvider (Zustand)
│           └── NavigationContainer
│               ├── AuthNavigator (if not authenticated)
│               │   └── AuthScreen
│               │       ├── LoginForm
│               │       └── SignupForm
│               │
│               └── MainNavigator (if authenticated)
│                   ├── HomeScreen
│                   │   ├── PhaseCard
│                   │   ├── TodayMetricCard
│                   │   ├── QuickLogForm
│                   │   └── WeeklyChart
│                   │
│                   ├── LogMetricsScreen
│                   │   ├── MetricForm
│                   │   ├── DatePicker
│                   │   └── HistoryList
│                   │
│                   ├── AnalyticsScreen
│                   │   ├── MetricsChart
│                   │   ├── StatCards
│                   │   └── TrendIndicators
│                   │
│                   ├── PhaseInfoScreen
│                   │   ├── CurrentPhaseCard
│                   │   ├── PhaseProgress
│                   │   └── PhaseList
│                   │
│                   └── SettingsScreen
│                       ├── ProfileSection
│                       ├── ThemeSelector
│                       ├── CloudSyncToggle
│                       └── ExportButton
```

### Component Design Patterns

#### 1. Container/Presenter Pattern

```typescript
// src/features/metrics/screens/HomeScreen.tsx (Container)

import { HomeScreenView } from './HomeScreen.view';
import { useHomeData } from '../hooks/useHomeData';

export function HomeScreen() {
  const {
    profile,
    todayMetric,
    weeklyMetrics,
    isLoading,
    error,
    refetch,
  } = useHomeData();

  return (
    <HomeScreenView
      profile={profile}
      todayMetric={todayMetric}
      weeklyMetrics={weeklyMetrics}
      isLoading={isLoading}
      error={error}
      onRefresh={refetch}
    />
  );
}
```

```typescript
// src/features/metrics/screens/HomeScreen.view.tsx (Presenter)

interface HomeScreenViewProps {
  profile: UserProfile | null;
  todayMetric: DailyMetric | null;
  weeklyMetrics: DailyMetric[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export function HomeScreenView({
  profile,
  todayMetric,
  weeklyMetrics,
  isLoading,
  error,
  onRefresh,
}: HomeScreenViewProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorMessage error={error} onRetry={onRefresh} />;
  if (!profile) return <EmptyState />;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl onRefresh={onRefresh} />}>
        <PhaseCard phase={profile.currentPhase} />
        <TodayMetricCard metric={todayMetric} />
        <QuickLogForm />
        <WeeklyChart data={weeklyMetrics} />
      </ScrollView>
    </Screen>
  );
}
```

#### 2. Compound Components Pattern

```typescript
// src/shared/components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {children}
    </View>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <View className="mb-3">{children}</View>;
};

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text className="text-lg font-bold text-gray-900">{children}</Text>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <View className="space-y-2">{children}</View>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <View className="mt-4 pt-4 border-t border-gray-200">{children}</View>;
};

// Usage
<Card>
  <Card.Header>
    <Card.Title>Today's Ratio</Card.Title>
  </Card.Header>
  <Card.Body>
    <RatioDisplay value={85} />
  </Card.Body>
  <Card.Footer>
    <Button>Log New Metric</Button>
  </Card.Footer>
</Card>
```

#### 3. Render Props Pattern (for Charts)

```typescript
// src/features/analytics/components/MetricsChart.tsx

interface MetricsChartProps {
  data: DailyMetric[];
  renderTooltip?: (metric: DailyMetric) => React.ReactNode;
}

export function MetricsChart({ data, renderTooltip }: MetricsChartProps) {
  return (
    <VictoryChart>
      <VictoryLine
        data={data}
        x="date"
        y="drBozRatio"
        labels={({ datum }) => renderTooltip?.(datum) || datum.drBozRatio}
      />
    </VictoryChart>
  );
}

// Usage
<MetricsChart
  data={metrics}
  renderTooltip={(metric) => (
    <View>
      <Text>{metric.date}</Text>
      <Text>{metric.drBozRatio}</Text>
    </View>
  )}
/>
```

---

## State Management Strategy

### Zustand Stores

#### 1. Auth Store

```typescript
// src/features/auth/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, error: null }),
      
      setLoading: (isLoading) =>
        set({ isLoading }),
      
      setError: (error) =>
        set({ error, isLoading: false }),
      
      signOut: () =>
        set({ user: null, isAuthenticated: false, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

#### 2. Theme Store

```typescript
// src/shared/store/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'terminal' | 'naval';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
```

#### 3. UI Store (Ephemeral)

```typescript
// src/shared/store/uiStore.ts

import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIStore {
  toasts: Toast[];
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  
  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  isModalOpen: false,
  modalContent: null,

  showToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),

  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (content) =>
    set({ isModalOpen: true, modalContent: content }),

  closeModal: () =>
    set({ isModalOpen: false, modalContent: null }),
}));
```

### TanStack Query Hooks

#### 1. Metrics Queries

```typescript
// src/features/metrics/hooks/useMetrics.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsService } from '../services/metricsService';
import { queryKeys } from '@/lib/query/queryKeys';
import type { DailyMetric, MetricInput } from '../types/metrics.types';

export function useMetrics(userId: string) {
  return useQuery({
    queryKey: queryKeys.metrics.all(userId),
    queryFn: () => metricsService.getAll(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTodayMetric(userId: string) {
  return useQuery({
    queryKey: queryKeys.metrics.today(userId),
    queryFn: () => metricsService.getToday(userId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useRecentMetrics(userId: string, days: number = 7) {
  return useQuery({
    queryKey: queryKeys.metrics.recent(userId, days),
    queryFn: () => metricsService.getRecent(userId, days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; metric: MetricInput }) =>
      metricsService.save(data.userId, data.metric),
    
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.metrics.all(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.metrics.today(variables.userId),
      });
    },
    
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.metrics.today(variables.userId),
      });

      const previousMetric = queryClient.getQueryData(
        queryKeys.metrics.today(variables.userId)
      );

      queryClient.setQueryData(
        queryKeys.metrics.today(variables.userId),
        variables.metric
      );

      return { previousMetric };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousMetric) {
        queryClient.setQueryData(
          queryKeys.metrics.today(variables.userId),
          context.previousMetric
        );
      }
    },
  });
}
```

#### 2. Query Keys Factory

```typescript
// src/lib/query/queryKeys.ts

export const queryKeys = {
  metrics: {
    all: (userId: string) => ['metrics', userId] as const,
    today: (userId: string) => ['metrics', userId, 'today'] as const,
    recent: (userId: string, days: number) =>
      ['metrics', userId, 'recent', days] as const,
    byDate: (userId: string, date: string) =>
      ['metrics', userId, 'date', date] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
  },
  phases: {
    all: () => ['phases'] as const,
    current: (userId: string) => ['phases', 'current', userId] as const,
  },
} as const;
```

---

## API & Data Layer

### Service Layer Pattern

```typescript
// src/features/metrics/services/metricsService.ts

import { db } from '@/lib/database/client';
import { calculateDrBozRatio } from '../utils/calculations';
import type { DailyMetric, MetricInput } from '../types/metrics.types';
import { format } from 'date-fns';

class MetricsService {
  async getAll(userId: string): Promise<DailyMetric[]> {
    const result = await db.getAllAsync<DailyMetric>(
      'SELECT * FROM metrics WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    return result;
  }

  async getToday(userId: string): Promise<DailyMetric | null> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const result = await db.getFirstAsync<DailyMetric>(
      'SELECT * FROM metrics WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    return result || null;
  }

  async getRecent(userId: string, days: number): Promise<DailyMetric[]> {
    const result = await db.getAllAsync<DailyMetric>(
      `SELECT * FROM metrics 
       WHERE user_id = ? 
       ORDER BY date DESC 
       LIMIT ?`,
      [userId, days]
    );
    return result;
  }

  async getByDate(userId: string, date: string): Promise<DailyMetric | null> {
    const result = await db.getFirstAsync<DailyMetric>(
      'SELECT * FROM metrics WHERE user_id = ? AND date = ?',
      [userId, date]
    );
    return result || null;
  }

  async save(userId: string, input: MetricInput): Promise<DailyMetric> {
    const metric: DailyMetric = {
      id: `${userId}_${format(new Date(), 'yyyy-MM-dd')}`,
      userId,
      date: format(new Date(), 'yyyy-MM-dd'),
      glucose: input.glucose,
      ketones: input.ketones,
      drBozRatio: calculateDrBozRatio(input.glucose, input.ketones),
      weight: input.weight,
      energy: input.energy,
      clarity: input.clarity,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `INSERT OR REPLACE INTO metrics 
       (id, user_id, date, glucose, ketones, dr_boz_ratio, weight, energy, clarity, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metric.id,
        metric.userId,
        metric.date,
        metric.glucose,
        metric.ketones,
        metric.drBozRatio,
        metric.weight ?? null,
        metric.energy ?? null,
        metric.clarity ?? null,
        metric.notes ?? null,
        metric.createdAt,
        metric.updatedAt,
      ]
    );

    return metric;
  }

  async delete(userId: string, date: string): Promise<void> {
    await db.runAsync(
      'DELETE FROM metrics WHERE user_id = ? AND date = ?',
      [userId, date]
    );
  }
}

export const metricsService = new MetricsService();
```

### Database Client

```typescript
// src/lib/database/client.ts

import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

class DatabaseClient {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await SQLite.openDatabaseAsync('keto_tracker.db');
    await this.runMigrations();
    return this.db;
  }

  private async runMigrations() {
    if (!this.db) throw new Error('Database not initialized');

    // Check migration table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at TEXT NOT NULL
      );
    `);

    // Get executed migrations
    const executed = await this.db.getAllAsync<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = new Set(executed.map((m) => m.name));

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await this.db.execAsync(migration.sql);
        await this.db.runAsync(
          'INSERT INTO migrations (name, executed_at) VALUES (?, ?)',
          [migration.name, new Date().toISOString()]
        );
      }
    }
  }

  async getAllAsync<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllAsync<T>(sql, params);
  }

  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getFirstAsync<T>(sql, params);
  }

  async runAsync(sql: string, params?: any[]): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.runAsync(sql, params);
  }

  async execAsync(sql: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.execAsync(sql);
  }
}

export const db = new DatabaseClient();
```

---

## Styling System

### Tailwind v4 Configuration

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

```css
/* src/styles/global.css */

@import "tailwindcss";

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold;
    @apply hover:bg-primary-700 active:bg-primary-800;
    @apply disabled:bg-gray-300 disabled:cursor-not-allowed;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm p-4;
    @apply border border-gray-200;
  }

  .input {
    @apply border border-gray-300 rounded-lg px-3 py-2;
    @apply focus:border-primary-500 focus:ring-2 focus:ring-primary-200;
    @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
  }
}

/* Theme variants */
[data-theme="dark"] {
  --color-background: #0a0a0a;
  --color-card: #1a1a1a;
  --color-text: #f0f0f0;
}

[data-theme="terminal"] {
  --color-background: #1a1a1a;
  --color-card: #2a2a2a;
  --color-text: #cccccc;
  font-family: 'Courier New', Monaco, monospace;
}
```

### Component Styling Example

```typescript
// src/shared/components/ui/Button.tsx

import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/shared/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className,
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-semibold items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-primary-600 bg-transparent',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const textColorStyles = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-primary-600',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
      ) : (
        <Text className={cn('font-semibold', textColorStyles[variant])}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/features/metrics/utils/__tests__/calculations.test.ts

import { calculateDrBozRatio, getRatioStatus } from '../calculations';

describe('calculateDrBozRatio', () => {
  it('calculates ratio correctly', () => {
    expect(calculateDrBozRatio(85, 1.0)).toBe(85);
    expect(calculateDrBozRatio(80, 1.5)).toBeCloseTo(53.3, 1);
    expect(calculateDrBozRatio(75, 2.0)).toBe(37.5);
  });

  it('handles edge cases', () => {
    expect(calculateDrBozRatio(0, 1.0)).toBe(0);
    expect(calculateDrBozRatio(85, 0)).toBe(Infinity);
  });
});

describe('getRatioStatus', () => {
  it('returns correct status', () => {
    expect(getRatioStatus(35)).toBe('excellent');
    expect(getRatioStatus(60)).toBe('good');
    expect(getRatioStatus(90)).toBe('needs-work');
  });
});
```

### Component Tests

```typescript
// src/shared/components/ui/__tests__/Button.test.tsx

import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click me</Button>);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(<Button loading>Click me</Button>);
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('disables when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>Click me</Button>
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// src/features/metrics/__tests__/metrics.integration.test.ts

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMetrics, useSaveMetric } from '../hooks/useMetrics';
import { metricsService } from '../services/metricsService';

jest.mock('../services/metricsService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Metrics Integration', () => {
  it('fetches and saves metrics', async () => {
    const mockMetrics = [
      { id: '1', glucose: 85, ketones: 1.0, drBozRatio: 85 },
    ];
    
    (metricsService.getAll as jest.Mock).mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useMetrics('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMetrics);
  });
});
```

### E2E Tests (Detox)

```typescript
// e2e/metrics.e2e.ts

describe('Metrics Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should log a new metric', async () => {
    // Navigate to log screen
    await element(by.id('log-tab')).tap();

    // Fill in form
    await element(by.id('glucose-input')).typeText('85');
    await element(by.id('ketones-input')).typeText('1.0');

    // Submit
    await element(by.id('save-button')).tap();

    // Verify success
    await expect(element(by.text('Metrics saved'))).toBeVisible();
  });

  it('should display metrics on home screen', async () => {
    await element(by.id('home-tab')).tap();
    await expect(element(by.id('today-ratio'))).toBeVisible();
    await expect(element(by.text('85.0'))).toBeVisible();
  });
});
```

---

## Approach A: Incremental Refactoring

### Overview
Refactor the existing codebase incrementally while maintaining functionality. This approach minimizes risk and allows for continuous deployment.

### Timeline: 8 Weeks

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: TypeScript Migration
**Goal:** Convert all files to TypeScript

**Tasks:**
1. **Day 1-2: Setup**
   ```bash
   npm install --save-dev typescript @types/react @types/react-native
   npx tsc --init
   ```
   - Configure `tsconfig.json`
   - Install type definitions
   - Setup ESLint with TypeScript

2. **Day 3-4: Type Definitions**
   - Create `src/types/` directory
   - Define all interfaces and types
   - Create type files for each feature

3. **Day 5: Convert Utilities**
   - Convert `src/utils/storage.js` → `storage.ts`
   - Add type annotations
   - Fix type errors

**Deliverable:** All utility files converted to TypeScript

#### Week 2: State Management Setup
**Goal:** Setup Zustand and TanStack Query

**Tasks:**
1. **Day 1-2: Install Dependencies**
   ```bash
   npm install zustand @tanstack/react-query
   npm install --save-dev @tanstack/eslint-plugin-query
   ```

2. **Day 3-4: Create Stores**
   - Create `authStore.ts`
   - Create `themeStore.ts`
   - Create `uiStore.ts`
   - Migrate context logic to stores

3. **Day 5: Setup Query Client**
   - Create query client configuration
   - Setup query keys factory
   - Wrap app with QueryClientProvider

**Deliverable:** State management infrastructure ready

### Phase 2: Component Refactoring (Weeks 3-4)

#### Week 3: Break Down HomeScreen
**Goal:** Extract components from 826-line HomeScreen

**Tasks:**
1. **Day 1: Extract PhaseCard**
   ```typescript
   // Before: Lines 200-350 in HomeScreen.js
   // After: src/features/phases/components/PhaseCard.tsx
   ```

2. **Day 2: Extract TodayMetricCard**
   ```typescript
   // Before: Lines 350-450 in HomeScreen.js
   // After: src/features/metrics/components/TodayMetricCard.tsx
   ```

3. **Day 3: Extract QuickLogForm**
   ```typescript
   // Before: Lines 450-600 in HomeScreen.js
   // After: src/features/metrics/components/QuickLogForm.tsx
   ```

4. **Day 4: Extract WeeklyChart**
   ```typescript
   // Before: Lines 600-750 in HomeScreen.js
   // After: src/features/analytics/components/WeeklyChart.tsx
   ```

5. **Day 5: Create Custom Hooks**
   - `useHomeData.ts`
   - `usePhaseAdvancement.ts`
   - `useTodayMetric.ts`

**Deliverable:** HomeScreen reduced to <150 lines

#### Week 4: Refactor Other Screens
**Goal:** Apply same pattern to other screens

**Tasks:**
- Day 1: Refactor LogMetricsScreen
- Day 2: Refactor AnalyticsScreen
- Day 3: Refactor PhaseInfoScreen
- Day 4: Refactor SettingsScreen
- Day 5: Testing and bug fixes

**Deliverable:** All screens under 150 lines

### Phase 3: Data Layer (Weeks 5-6)

#### Week 5: SQLite Migration
**Goal:** Replace AsyncStorage with SQLite

**Tasks:**
1. **Day 1-2: Setup SQLite**
   ```bash
   npm install expo-sqlite
   ```
   - Create database client
   - Write migration scripts
   - Create schema

2. **Day 3-4: Migrate Services**
   - Create `metricsService.ts`
   - Create `profileService.ts`
   - Create `phaseService.ts`
   - Implement CRUD operations

3. **Day 5: Data Migration**
   - Write migration script from AsyncStorage to SQLite
   - Test migration with sample data
   - Add rollback capability

**Deliverable:** SQLite database operational

#### Week 6: TanStack Query Integration
**Goal:** Replace manual data fetching with React Query

**Tasks:**
1. **Day 1-2: Create Query Hooks**
   - `useMetrics.ts`
   - `useProfile.ts`
   - `usePhases.ts`

2. **Day 3-4: Replace Data Fetching**
   - Update all screens to use query hooks
   - Remove manual loading states
   - Implement optimistic updates

3. **Day 5: Cache Configuration**
   - Configure stale times
   - Setup refetch strategies
   - Add offline support

**Deliverable:** All data fetching through React Query

### Phase 4: Styling & Polish (Weeks 7-8)

#### Week 7: Tailwind Migration
**Goal:** Replace StyleSheet with Tailwind

**Tasks:**
1. **Day 1-2: Setup NativeWind**
   ```bash
   npm install nativewind
   npm install --save-dev tailwindcss
   ```
   - Configure Tailwind
   - Setup theme tokens

2. **Day 3-5: Convert Styles**
   - Convert one screen per day
   - Extract reusable components
   - Create design system

**Deliverable:** All styles using Tailwind

#### Week 8: Testing & Documentation
**Goal:** Add tests and documentation

**Tasks:**
1. **Day 1-2: Unit Tests**
   - Test utilities
   - Test calculations
   - Test services

2. **Day 3-4: Component Tests**
   - Test UI components
   - Test screens
   - Test hooks

3. **Day 5: Documentation**
   - Update README
   - Write API docs
   - Create component docs

**Deliverable:** 80% test coverage, complete docs

### Migration Checklist

```markdown
## Phase 1: Foundation
- [ ] TypeScript setup
- [ ] Convert all files to .tsx
- [ ] Fix all type errors
- [ ] Zustand stores created
- [ ] TanStack Query setup
- [ ] Remove old Context providers

## Phase 2: Components
- [ ] HomeScreen refactored (<150 lines)
- [ ] LogMetricsScreen refactored
- [ ] AnalyticsScreen refactored
- [ ] PhaseInfoScreen refactored
- [ ] SettingsScreen refactored
- [ ] All components extracted
- [ ] Custom hooks created

## Phase 3: Data Layer
- [ ] SQLite setup
- [ ] Migrations written
- [ ] Services created
- [ ] AsyncStorage data migrated
- [ ] Query hooks implemented
- [ ] All screens using React Query

## Phase 4: Polish
- [ ] Tailwind setup
- [ ] All styles converted
- [ ] Design system created
- [ ] Unit tests (>80% coverage)
- [ ] Component tests
- [ ] E2E tests
- [ ] Documentation complete
```

### Risk Mitigation

1. **Feature Flags**
   ```typescript
   const FEATURE_FLAGS = {
     USE_NEW_STORAGE: false, // Toggle SQLite
     USE_TAILWIND: false, // Toggle Tailwind
   };
   ```

2. **Parallel Development**
   - Keep old code alongside new code
   - Use feature branches
   - Gradual rollout

3. **Testing at Each Step**
   - Run tests after each refactor
   - Manual QA after each phase
   - User acceptance testing

---

## Approach B: Complete Rewrite

### Overview
Build V2 from scratch with proper architecture. This approach allows for clean implementation but requires more upfront time.

### Timeline: 8 Weeks

### Phase 1: Project Setup (Week 1)

#### Day 1-2: Initialize Project
```bash
# Create new Expo project with TypeScript
npx create-expo-app keto-tracker-v2 --template expo-template-blank-typescript

cd keto-tracker-v2

# Install dependencies
npm install zustand @tanstack/react-query expo-sqlite
npm install nativewind tailwindcss
npm install react-hook-form zod
npm install date-fns
npm install victory-native react-native-svg
npm install @heroicons/react

# Dev dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev jest @testing-library/react-native
npm install --save-dev detox
npm install --save-dev eslint prettier husky
```

#### Day 3: Project Structure
```bash
# Create folder structure
mkdir -p src/{app,features,shared,lib,styles,types}
mkdir -p src/features/{auth,metrics,analytics,phases,settings}
mkdir -p src/shared/{components,hooks,utils,constants}
mkdir -p src/lib/{database,query,firebase}

# Create initial files
touch src/app/App.tsx
touch src/lib/database/client.ts
touch src/lib/query/client.ts
```

#### Day 4-5: Configuration
- Setup `tsconfig.json`
- Configure Tailwind
- Setup ESLint & Prettier
- Configure Jest
- Setup Husky git hooks

**Deliverable:** Clean project structure ready

### Phase 2: Core Infrastructure (Week 2)

#### Day 1-2: Database Layer
```typescript
// src/lib/database/client.ts
// src/lib/database/migrations/001_initial.ts
// src/lib/database/schema.ts
```
- Implement SQLite client
- Write all migrations
- Create seed data
- Test database operations

#### Day 3-4: State Management
```typescript
// src/features/auth/store/authStore.ts
// src/shared/store/themeStore.ts
// src/shared/store/uiStore.ts
```
- Create all Zustand stores
- Setup persistence
- Write store tests

#### Day 5: Query Setup
```typescript
// src/lib/query/client.ts
// src/lib/query/queryKeys.ts
```
- Configure TanStack Query
- Setup query keys factory
- Configure cache strategies

**Deliverable:** Core infrastructure complete

### Phase 3: Feature Development (Weeks 3-5)

#### Week 3: Auth & Profile
**Day 1-2: Auth Feature**
```typescript
// src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts
├── types/
│   └── auth.types.ts
└── screens/
    └── AuthScreen.tsx
```

**Day 3-4: Profile Feature**
```typescript
// src/features/profile/
├── services/
│   └── profileService.ts
├── hooks/
│   └── useProfile.ts
└── types/
    └── profile.types.ts
```

**Day 5: Testing**
- Unit tests for auth logic
- Component tests for forms
- Integration tests

**Deliverable:** Auth system complete

#### Week 4: Metrics Feature
**Day 1-2: Metrics Service**
```typescript
// src/features/metrics/services/metricsService.ts
// src/features/metrics/utils/calculations.ts
// src/features/metrics/utils/validation.ts
```

**Day 3-4: Metrics Components**
```typescript
// src/features/metrics/components/
├── MetricCard.tsx
├── MetricForm.tsx
├── RatioDisplay.tsx
└── MetricsList.tsx
```

**Day 5: Metrics Screens**
```typescript
// src/features/metrics/screens/
├── HomeScreen.tsx
└── LogMetricsScreen.tsx
```

**Deliverable:** Metrics feature complete

#### Week 5: Analytics & Phases
**Day 1-2: Analytics Feature**
```typescript
// src/features/analytics/
├── components/
│   ├── MetricsChart.tsx
│   ├── StatCard.tsx
│   └── TrendIndicator.tsx
├── hooks/
│   ├── useChartData.ts
│   └── useStatistics.ts
└── screens/
    └── AnalyticsScreen.tsx
```

**Day 3-4: Phases Feature**
```typescript
// src/features/phases/
├── components/
│   ├── PhaseCard.tsx
│   ├── PhaseProgress.tsx
│   └── PhaseList.tsx
├── hooks/
│   ├── useCurrentPhase.ts
│   └── usePhaseAdvancement.ts
├── constants/
│   └── phaseDefinitions.ts
└── screens/
    └── PhaseInfoScreen.tsx
```

**Day 5: Testing**
- Test all features
- Integration testing
- Bug fixes

**Deliverable:** All core features complete

### Phase 4: UI Components (Week 6)

#### Day 1-3: Base Components
```typescript
// src/shared/components/ui/
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Select.tsx
├── Modal.tsx
├── Toast.tsx
└── Spinner.tsx
```
- Implement all base components
- Add Tailwind styling
- Write component tests
- Create Storybook stories

#### Day 4-5: Layout Components
```typescript
// src/shared/components/layout/
├── Screen.tsx
├── Container.tsx
└── ScrollView.tsx
```
- Implement layout components
- Add responsive behavior
- Test on different screen sizes

**Deliverable:** Complete UI component library

### Phase 5: Navigation & Polish (Week 7)

#### Day 1-2: Navigation
```typescript
// src/app/navigation/
├── RootNavigator.tsx
├── AuthNavigator.tsx
└── MainNavigator.tsx
```
- Setup React Navigation
- Implement all navigators
- Add navigation types
- Test navigation flows

#### Day 3-4: Error Handling
```typescript
// src/app/providers/
├── ErrorBoundary.tsx
└── AppProviders.tsx
```
- Implement error boundaries
- Add error logging
- Create error screens
- Test error scenarios

#### Day 5: Performance
- Add code splitting
- Optimize bundle size
- Implement lazy loading
- Add performance monitoring

**Deliverable:** Navigation and error handling complete

### Phase 6: Testing & Deployment (Week 8)

#### Day 1-2: Comprehensive Testing
- Run all unit tests
- Run all integration tests
- Run E2E tests
- Fix all bugs

#### Day 3: Data Migration
```typescript
// scripts/migrate-v1-to-v2.ts
```
- Write migration script
- Test migration with sample data
- Create migration documentation
- Test rollback procedure

#### Day 4: Documentation
- Write README
- Create API documentation
- Write user guide
- Create developer guide

#### Day 5: Deployment
- Build production app
- Test on real devices
- Deploy to app stores
- Monitor for issues

**Deliverable:** V2 ready for production

### File Structure Example

```typescript
// src/features/metrics/screens/HomeScreen.tsx

import React from 'react';
import { Screen, ScrollView } from '@/shared/components/layout';
import { PhaseCard } from '@/features/phases/components/PhaseCard';
import { TodayMetricCard } from '../components/TodayMetricCard';
import { QuickLogForm } from '../components/QuickLogForm';
import { WeeklyChart } from '@/features/analytics/components/WeeklyChart';
import { useHomeData } from '../hooks/useHomeData';
import { LoadingState, ErrorMessage } from '@/shared/components/feedback';

export function HomeScreen() {
  const {
    profile,
    todayMetric,
    weeklyMetrics,
    isLoading,
    error,
    refetch,
  } = useHomeData();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!profile) return null;

  return (
    <Screen>
      <ScrollView onRefresh={refetch}>
        <PhaseCard phase={profile.currentPhase} />
        <TodayMetricCard metric={todayMetric} />
        <QuickLogForm />
        <WeeklyChart data={weeklyMetrics} />
      </ScrollView>
    </Screen>
  );
}
```

```typescript
// src/features/metrics/components/TodayMetricCard.tsx

import React from 'react';
import { Card } from '@/shared/components/ui';
import { RatioDisplay } from './RatioDisplay';
import type { DailyMetric } from '../types/metrics.types';

interface TodayMetricCardProps {
  metric: DailyMetric | null;
}

export function TodayMetricCard({ metric }: TodayMetricCardProps) {
  return (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title>Today's Dr. Boz Ratio</Card.Title>
      </Card.Header>
      <Card.Body>
        {metric ? (
          <RatioDisplay value={metric.drBozRatio} />
        ) : (
          <Text className="text-gray-500">No data logged today</Text>
        )}
      </Card.Body>
    </Card>
  );
}
```

```typescript
// src/features/metrics/hooks/useHomeData.ts

import { useAuthStore } from '@/features/auth/store/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useTodayMetric } from './useTodayMetric';
import { useRecentMetrics } from './useMetrics';

export function useHomeData() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || '';

  const profileQuery = useProfile(userId);
  const todayMetricQuery = useTodayMetric(userId);
  const weeklyMetricsQuery = useRecentMetrics(userId, 7);

  const isLoading =
    profileQuery.isLoading ||
    todayMetricQuery.isLoading ||
    weeklyMetricsQuery.isLoading;

  const error =
    profileQuery.error ||
    todayMetricQuery.error ||
    weeklyMetricsQuery.error;

  const refetch = () => {
    profileQuery.refetch();
    todayMetricQuery.refetch();
    weeklyMetricsQuery.refetch();
  };

  return {
    profile: profileQuery.data,
    todayMetric: todayMetricQuery.data,
    weeklyMetrics: weeklyMetricsQuery.data || [],
    isLoading,
    error,
    refetch,
  };
}
```

### Comparison: Refactor vs Rewrite

| Aspect | Refactor | Rewrite |
|--------|----------|---------|
| **Time** | 8 weeks | 8 weeks |
| **Risk** | Lower | Higher |
| **Learning Curve** | Gradual | Steep |
| **Code Quality** | Incremental improvement | Clean slate |
| **Feature Parity** | Maintained throughout | Achieved at end |
| **Testing** | Continuous | At end |
| **Deployment** | Can deploy incrementally | Big bang |
| **Team Size** | 1-2 developers | 2-3 developers |
| **User Impact** | Minimal | None until launch |

---

## Migration Strategy

### Data Migration Plan

#### Step 1: Export V1 Data
```typescript
// scripts/export-v1-data.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

async function exportV1Data() {
  const profile = await AsyncStorage.getItem('user_profile');
  const metrics = await AsyncStorage.getItem('daily_metrics');
  const theme = await AsyncStorage.getItem('user_theme');

  const exportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    profile: profile ? JSON.parse(profile) : null,
    metrics: metrics ? JSON.parse(metrics) : [],
    theme: theme || 'Modern Minimal',
  };

  const filePath = `${FileSystem.documentDirectory}keto-tracker-v1-export.json`;
  await FileSystem.writeAsStringAsync(
    filePath,
    JSON.stringify(exportData, null, 2)
  );

  return filePath;
}
```

#### Step 2: Import to V2
```typescript
// scripts/import-to-v2.ts

import { db } from '@/lib/database/client';
import * as FileSystem from 'expo-file-system';

async function importV1Data(filePath: string) {
  const content = await FileSystem.readAsStringAsync(filePath);
  const data = JSON.parse(content);

  // Import profile
  if (data.profile) {
    await db.runAsync(
      `INSERT INTO profiles (id, user_id, start_date, current_phase, phase_start_date, target_dr_boz_ratio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'migrated-profile',
        'migrated-user',
        data.profile.startDate,
        data.profile.currentPhase,
        data.profile.phaseStartDate,
        data.profile.targetDrBozRatio,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
  }

  // Import metrics
  for (const metric of data.metrics) {
    await db.runAsync(
      `INSERT INTO metrics (id, user_id, date, glucose, ketones, dr_boz_ratio, weight, energy, clarity, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `migrated-${metric.date}`,
        'migrated-user',
        metric.date,
        metric.glucose,
        metric.ketones,
        metric.drBozRatio,
        metric.weight || null,
        metric.energy || null,
        metric.clarity || null,
        metric.notes || null,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
  }

  console.log(`Imported ${data.metrics.length} metrics`);
}
```

#### Step 3: Validation
```typescript
// scripts/validate-migration.ts

async function validateMigration() {
  // Check record counts
  const profileCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM profiles'
  );
  const metricsCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM metrics'
  );

  console.log(`Profiles: ${profileCount?.count}`);
  console.log(`Metrics: ${metricsCount?.count}`);

  // Validate data integrity
  const invalidMetrics = await db.getAllAsync(
    'SELECT * FROM metrics WHERE glucose <= 0 OR ketones <= 0'
  );

  if (invalidMetrics.length > 0) {
    console.error('Found invalid metrics:', invalidMetrics);
  }

  return {
    profileCount: profileCount?.count || 0,
    metricsCount: metricsCount?.count || 0,
    invalidMetrics: invalidMetrics.length,
  };
}
```

---

## Performance Targets

### Load Time Targets
- **Initial Load**: <2 seconds
- **Screen Transition**: <300ms
- **Data Fetch**: <500ms
- **Chart Render**: <200ms

### Bundle Size Targets
- **Total Bundle**: <800KB
- **JavaScript**: <500KB
- **Assets**: <300KB

### Memory Targets
- **Idle Memory**: <50MB
- **Active Memory**: <100MB
- **Peak Memory**: <150MB

### Performance Monitoring

```typescript
// src/lib/performance/monitor.ts

import { Performance } from 'react-native-performance';

export function measureScreenLoad(screenName: string) {
  const startTime = Performance.now();
  
  return () => {
    const endTime = Performance.now();
    const duration = endTime - startTime;
    
    console.log(`${screenName} loaded in ${duration}ms`);
    
    // Send to analytics
    if (duration > 2000) {
      console.warn(`${screenName} load time exceeded target`);
    }
  };
}

// Usage
const endMeasure = measureScreenLoad('HomeScreen');
// ... screen loads
endMeasure();
```

---

## Security Considerations

### Data Security
1. **Local Storage Encryption**
   ```typescript
   import * as SecureStore from 'expo-secure-store';
   
   async function saveSecure(key: string, value: string) {
     await SecureStore.setItemAsync(key, value);
   }
   ```

2. **Input Sanitization**
   ```typescript
   import { z } from 'zod';
   
   const sanitizeInput = (input: string) => {
     return input.trim().slice(0, 500); // Max 500 chars
   };
   ```

3. **SQL Injection Prevention**
   ```typescript
   // Always use parameterized queries
   await db.runAsync(
     'SELECT * FROM metrics WHERE user_id = ?',
     [userId] // Never concatenate strings
   );
   ```

### Authentication Security
1. **Firebase Auth** (if using cloud sync)
   - Email verification required
   - Strong password requirements
   - Rate limiting on auth attempts

2. **Local Auth** (biometric)
   ```typescript
   import * as LocalAuthentication from 'expo-local-authentication';
   
   async function authenticateWithBiometrics() {
     const result = await LocalAuthentication.authenticateAsync({
       promptMessage: 'Authenticate to access your data',
       fallbackLabel: 'Use passcode',
     });
     return result.success;
   }
   ```

---

## Conclusion

### Recommendation

**For this project, I recommend Approach A: Incremental Refactoring**

**Reasons:**
1. **Lower Risk**: Maintain functionality throughout
2. **Continuous Deployment**: Can deploy improvements incrementally
3. **Learning Opportunity**: Team learns new patterns gradually
4. **User Impact**: Minimal disruption to users
5. **Flexibility**: Can pause/resume at any phase

**However, consider Approach B (Rewrite) if:**
- You have 2+ developers available
- You can afford 8 weeks without new features
- You want to completely rethink the UX
- You're planning major feature additions

### Next Steps

1. **Week 0: Preparation**
   - Review this spec with team
   - Setup development environment
   - Create project board
   - Assign tasks

2. **Week 1: Start Phase 1**
   - Begin TypeScript migration
   - Setup CI/CD pipeline
   - Create test environment

3. **Ongoing**
   - Daily standups
   - Weekly demos
   - Continuous testing
   - Regular code reviews

### Success Criteria

✅ **Technical**
- 100% TypeScript coverage
- >80% test coverage
- All components <150 lines
- Bundle size <800KB
- Load time <2s

✅ **User Experience**
- No data loss during migration
- Improved performance
- Better error messages
- Smoother animations

✅ **Developer Experience**
- Clear code structure
- Easy to add features
- Fast hot reload
- Good documentation

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Next Review:** After Phase 1 completion