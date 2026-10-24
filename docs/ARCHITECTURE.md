# MediCore HMS - Frontend Technical Architecture

## 1. Architectural Overview

The **MediCore HMS Frontend** is engineered using **Next.js 16 (App Router)** and **React 19**, structured into a layered client-tier architecture that decouples UI rendering, client state management, domain services, and HTTP networking.

```
+-------------------------------------------------------------------------------+
|                             Presentation Tier                                 |
|  - App Router: Route Groups (main) for Protected Portals                      |
|  - Layout Shells: Responsive Sidebar, Topbar Navigation, Notification Center   |
|  - Pages & Feature Views: Admin, Doctor, Nurse, Receptionist, Pharmacy, User  |
|  - Design System: Tailwind CSS v4, Curated Hospital Color Palette             |
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
|                             State & Context Tier                              |
|  - AuthContext: Session lifecycle, user metadata, role resolution             |
|  - React 19 State & Hooks: Local state, optimistic updates, useMemo, callback |
|  - Browser Persistence: Local Storage for auth tokens, cached role preferences|
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
|                            Domain Service Tier                                |
|  - Domain-Specific Services: appointmentService, nurseService, auditService...|
|  - Payload Normalization: unwrapAppointments, status categorizers, dateUtils  |
|  - Type Safety: Comprehensive TypeScript schemas & response interfaces        |
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
|                             Network & HTTP Tier                               |
|  - Axios Instance (apiClient) with baseURL & credentials configuration        |
|  - Request Interceptor: Injects Authorization Bearer JWT                      |
|  - Response Interceptor: 401 Catch, Queue-based Token Rotation, Retry Loop    |
+-------------------------------------------------------------------------------+
                                       |
                           [ FastAPI Backend Server ]
```
