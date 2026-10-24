# Contributing to MediCore HMS (Frontend)

Thank you for contributing to the **MediCore Hospital Management System (Frontend)**. This document sets out the team standards, code organization, branch workflows, and styling guidelines required for all contributions.

---

## 1. Branching & Git Workflow

### 1.1 Branch Naming Conventions
Always create feature and bug-fix branches from `dev` or your assigned feature lead:
* **Feature Branches**: `feat/<module>-<short-description>` (e.g. `feat/nurse-vitals-chart`, `feat/pharmacy-order-modal`)
* **Bug Fixes**: `fix/<module>-<issue>` (e.g. `fix/kpi-appointment-breakdown`, `fix/slot-picker-timezone`)
* **UI & Refactoring**: `refactor/<module>-<target>` (e.g. `refactor/sidebar-role-filtering`)

### 1.2 Commit Message Standards
Use clear, imperative commit messages adhering to Conventional Commits:
* `feat(nurse): add 5-rights verification dialog to MAR administration`
* `fix(admin): resolve date parameter mapping in kpi-overview service`
* `perf(appointments): optimize slot availability lookahead calculations`
* `docs(readme): add comprehensive technical architecture and setup guide`

---

## 2. Coding Standards & TypeScript Conventions

### 2.1 Strict Type Safety
* **No `any` Types**: Always define or import explicit interfaces from `src/types/`. If a backend payload is polymorphic or evolving, use `unknown` combined with type guards.
* **Service Signatures**: All async service functions in `src/services/` must explicitly state their return type:
  ```typescript
  // Recommended
  export const staffService = {
    getStaff: async (): Promise<StaffMember[]> => {
      const res = await apiClient.get<StaffMember[]>('/users/staff');
      return res.data;
    },
  };
  ```

### 2.2 Component Architecture
* **Directory Co-location**: Reusable UI primitives belong in `src/components/ui/`; complex, domain-specific widgets belong in `src/components/features/<domain>/`.
* **'use client' Directive**: Add `'use client';` only at the top of components that require React hooks (`useState`, `useEffect`, `useCallback`), event listeners, or browser APIs.
* **Component Prop Interfaces**: Define a clear, exported TypeScript interface directly above the component:
  ```typescript
  interface StatCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    loading?: boolean;
  }
  ```
---

## 3. Styling & Design Conventions

* **Tailwind CSS v4**: Use utility classes adhering to the MediCore design tokens:
  - Brand Emerald: `#0E4749` (text, buttons, primary headers)
  - Brand Coral: `#E07856` (accent CTAs, badges, warnings)
  - Clinical Surface: `#F6F7F5` (body background)
  - Neutral Borders: `#DCE3E0` (table borders, card outlines)
* **Feedback & Notifications**:
  - Use `sonner` toasts (`toast.success()`, `toast.error()`, `toast.warning()`) for transient user feedback.
  - For inline errors on forms, provide clear, accessible alert containers with appropriate `role="alert"`.

---

## 4. Pull Request & Verification Checklist

Before submitting a Pull Request:
1. **Type Checking & Build**: Run `npm run build` to ensure there are no compilation or TypeScript errors.
2. **Linting**: Execute `npm run lint` and verify there are no ESLint syntax or import warnings.
3. **Responsive Testing**: Test your interface across mobile (375px), tablet (768px), and desktop (1280px+) viewport widths.
4. **Error Resilience**: Confirm that network errors (e.g. backend server down or returning 500) fail gracefully with user-friendly notices rather than unhandled blank screens.
