# MediCore HMS - Clinical Precision Platform (Frontend)

![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/Course-ADBMS_Mini_Project-blue?style=for-the-badge)

**MediCore HMS** is an enterprise-grade Hospital Management System frontend engineered with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Built as the client tier for the Advanced Database Management System (ADBMS) mini-project, this responsive portal provides role-tailored clinical and administrative interfaces for 6 distinct healthcare personas: **Admin**, **Doctor**, **Nurse**, **Receptionist**, **Pharmacist**, and **Patient**.

## 1. System Overview & Architecture

MediCore HMS is built around a secure, decoupled, role-based architecture designed for high-concurrency hospital operations:

```
+-----------------------------------------------------------------------------------+
|                           MediCore Web Application (Next.js 16)                   |
+-----------------------------------------------------------------------------------+
|  [ AuthContext ] -> JWT Access Token + Local Storage + In-Memory Token Management |
|  [ Axios Interceptors ] -> Automatic Bearer Headers + Queue-based Token Refresh   |
|  [ Sonner Toasts ] -> Instant clinical alerts, validation errors & feedback       |
+-----------------------------------------------------------------------------------+
                                          |
          +-------------------------------+-------------------------------+
          |                               |                               |
+-------------------+           +-------------------+           +-------------------+
|  Admin Module     |           |  Doctor Module    |           |  Nurse Module     |
| - Hospital KPIs   |           | - Consultations   |           | - Ward Bed Grid   |
| - Staff Directory |           | - Patient Action  |           | - Vitals & Triage |
| - Department Tree |           | - Admissions/Rx   |           | - MAR (5 Rights)  |
| - Audit Logs Trail|           | - Lab Orders      |           | - Fluid Balance   |
| - Workload Reports|           | - Diagnosis       |           | - Doctor Orders   |
+-------------------+           +-------------------+           +-------------------+
          |                               |                               |
+-------------------+           +-------------------+           +-------------------+
| Receptionist      |           |  Pharmacist       |           |  Patient Portal   |
| - Fast Check-in   |           | - Drug Inventory  |           | - Book Slot Wizard|
| - Appointment Desk|           | - Reorder Alerts  |           | - My Appointments |
| - Patient Records |           | - Purchase Orders |           | - Prescriptions   |
| - Ward Admission  |           | - Dispensing Queue|           | - Health History  |
| - Discharge Bills |           | - Revenue Reports |           | - Medical Profile |
+-------------------+           +-------------------+           +-------------------+
                                          |
                           [ REST API (FastAPI Backend) ]
                                          |
                              [ MySQL 8.0+ Database ]
```

---

## 2. Key Modules & Role Capabilities

### 🛡️ Admin & Hospital Operations (`/admin/*`)
* **Live KPI Overview**: Real-time patient count, bed occupancy percentage bar with color-coded severity, and today's appointment metrics.
* **Staff Management**: Add, update, soft-delete, and activate doctors, nurses, receptionists, and pharmacists with automatic credential provisioning.
* **Hierarchical Department Tree**: Recursive department and sub-department explorer.
* **Security Audit Trail**: Filterable operational audit log (`LOW`, `MEDIUM`, `HIGH` risk levels) with actor tracking and JSON change payloads.
* **Workload & Performance Analytics**: Department ranking with window functions and CSV report export.

### 🩺 Doctor & Clinical Care (`/doctor/*`)
* **Daily OPD Dashboard**: Scheduled consultations, patient queue, and quick triage status.
* **Patient Action Center**: Integrated medical record, allergies review, visit history, and consultation workflow.
* **Inpatient Admission Request**: Ward recommendation and priority clinical admission submissions.
* **Clinical Discharge**: Discharge notes and criteria authorization.
* **E-Prescribing & Lab Orders**: Direct digital transmission of prescribed medications to the pharmacy queue.

### 👩‍⚕️ Nurse & Inpatient Ward Management (`/nurse/*`)
* **Interactive Ward Grid**: Visual bed status mapping (`Occupied`, `Available`, `Cleaning`).
* **Vitals & Triage**: Record blood pressure, pulse, temperature, SpO2, and respiratory rate with automated patient status classification (`STABLE`, `MODERATE`, `CRITICAL`).
* **Medication Administration Record (MAR)**: Administer medication doses with mandatory 5-Rights verification (`Right Patient`, `Right Drug`, `Right Dose`, `Right Route`, `Right Time`) and allergy warning detection.
* **Fluid Balance (Intake / Output)**: Track oral intake, IV fluids, urine, and surgical drains with calculated net fluid balances in mL.
* **Doctor Orders & Nursing Notes**: Acknowledge/complete physician instructions and document structured SOAP notes.

### 📋 Receptionist & Admissions (`/receptionist/*`)
* **Fast Registration**: New patient onboarding with immediate search indexing.
* **Appointment Desk**: Multi-doctor, multi-department booking, slot validation, and rescheduling.
* **Inpatient Admissions**: Emergency guardian details, bed assignment from active ward capacities.
* **Discharge & Billing**: Automated room charges and treatment fee calculations with payment status tracking.

### 💊 Pharmacist & Inventory Control (`/pharmacist/*`)
* **Prescription Dispensing Queue**: Real-time doctor prescriptions awaiting dispensing with stock availability deduction.
* **Inventory Management**: Drug catalog, generic classifications, stock quantities, and valuation.
* **Automated Stock Alerts**: Identification of low stock (below reorder threshold) and expiring batches.
* **Purchase Restock Orders**: Formal purchase orders with enforced minimum lead times and automated stock batch intake.
* **Dispensation History**: Complete audit trail of dispensed items, revenues, and prescribing physicians.

### 🧑‍⚕️ Patient Portal (`/patient/*`)
* **Self-Service Appointment Booking**: Doctor department filter, appointment date selection, and real-time slot availability.
* **Appointment Tracking**: View upcoming visits, reschedule consultations, and access past doctor notes.
* **Prescriptions & Records**: Access digital prescriptions, dispensed medicines, and health summaries.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.3.8 | React Server & Client components, file-system routing |
| **UI Library** | React | 19.2.8 | Core component model & concurrent rendering |
| **Language** | TypeScript | 5.0+ | Strict type safety, shared interfaces & API contracts |
| **Styling** | Tailwind CSS | v4.0 | Responsive design, modern color tokens & utility classes |
| **HTTP Client** | Axios | 1.20.0 | REST API client with request/response interceptors & token refresh |
| **Icons** | Lucide React | 1.51.0 | Clinical & UI iconography |
| **Notifications** | Sonner | 2.0.8 | Lightweight, accessible toast notifications |

---

## 4. Project Directory Structure

```
src/
├── app/                           # Next.js App Router (Routes & Layouts)
│   ├── (main)/                    # Protected application shell
│   │   ├── admin/                 # Admin dashboard, staff, departments, audit, reports
│   │   ├── doctor/                # Doctor dashboard, patient-action, schedule, labs
│   │   ├── nurse/                 # Nurse ward overview, patients, MAR, notes, I/O
│   │   ├── patient/               # Patient dashboard, book slot, appointments, records
│   │   ├── pharmacist/            # Pharmacy dashboard, inventory, orders, dispensing
│   │   └── receptionist/          # Reception overview, booking, admissions, billing
│   ├── globals.css                # Global CSS styles & Tailwind v4 theme directives
│   ├── layout.tsx                 # Root HTML layout with fonts & Sonner toaster
│   └── page.tsx                   # Hospital login portal with forgot-password OTP
├── components/                    # Reusable React UI Components
│   ├── features/                  # Domain-specific feature components
│   │   ├── admin/                 # KpiOverviewCards, RecentAuditLogs, AuditItem
│   │   ├── auth/                  # ForgotPasswordModal (3-step OTP flow)
│   │   ├── doctor/                # MiniCalendar, DoctorDashboardView
│   │   ├── patient/               # PatientDashboardView, BookingWizard
│   │   └── pharmacist/            # PurchaseOrderModal, DailyDispensingReportModal
│   ├── layout/                    # Global layout elements (Sidebar, NotificationBell)
│   └── ui/                        # Low-level primitives (StatCard, LoadBar)
├── context/                       # Global React Contexts
│   └── AuthContext.tsx            # Session state, login/logout, role resolution
├── hooks/                         # Custom React hooks
│   └── usePatientAppointments.ts  # Appointments data fetching with unwrap/normalization
├── lib/                           # Utility libraries & configurations
│   ├── apiClient.ts               # Axios instance with JWT refresh token rotation queue
│   ├── constants.ts               # App configuration, routes, status badge colors
│   ├── dateUtils.ts               # Date & time formatting, age calculator, todayKey
│   └── patientAppointments.ts     # Appointment normalization & unwrap utilities
├── services/                      # Data Access & Backend Integration Layer
│   ├── appointmentService.ts      # Appointments CRUD, rescheduling & status updates
│   ├── auditService.ts            # Audit logs retrieval & CSV export
│   ├── authService.ts             # Authentication, token rotation, OTP verification
│   ├── departmentService.ts       # Department catalog & hierarchy management
│   ├── doctorService.ts           # Doctor appointments, counts & history
│   ├── notificationService.ts     # In-app notification polling & read-states
│   ├── nurseService.ts            # Vitals, MAR administration, I/O tracking, notes
│   ├── patientService.ts          # Patient registration, slot booking & search
│   ├── pharmacyService.ts         # Inventory, orders, dispensing & drug alerts
│   ├── receptionistService.ts     # Receptionist overview, admissions, billing
│   ├── reportService.ts           # Hospital KPI overview & workload summaries
│   └── staffService.ts            # Staff directory, status toggle & deletions
└── types/                         # TypeScript interfaces & API schemas
    ├── api.ts                     # Generic ApiResponse and PaginatedResponse
    ├── doctor.ts                  # Doctor appointment and consultation types
    ├── index.ts                   # Core domain types (User, Staff, Ward, Bed, Audit)
    ├── patient.ts                 # Patient records and medical history
    └── pharmacy.ts                # Medicine, order, and dispensation schemas
```

---

## 5. Getting Started

### 5.1 Prerequisites
* **Node.js**: `v20.x` or higher (LTS recommended)
* **npm**: `v10.x` or higher
* **Running Backend**: MediCore FastAPI backend on `http://127.0.0.1:8000`

### 5.2 Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dilushamadushan/adbms-mini-project-frontend.git
   cd adbms-mini-project-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Create a `.env.local` file in the project root:
   ```ini
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

### 5.3 Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5.4 Production Build & Linting
```bash
# Type check and build optimized bundle
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```

---

## 6. Authentication & Security Workflow

MediCore HMS implements robust JWT authentication with automatic background token rotation:

1. **Login (`/auth/login`)**: The user signs in with username and password. The backend issues a short-lived access token and a secure HTTP-only refresh token cookie.
2. **Authorization Header**: `apiClient.ts` automatically attaches `Authorization: Bearer <token>` to all outgoing REST requests.
3. **Transparent Token Rotation (`/auth/refresh`)**:
   - When any API request fails with `HTTP 401 Unauthorized`, Axios intercepts the error.
   - Ongoing requests are paused and placed into a concurrency queue (`failedQueue`).
   - A single refresh request is executed against `/auth/refresh`.
   - Once refreshed, all queued requests are replayed with the new access token without interrupting the user.
4. **Session Termination**: If refresh fails (e.g., token expired or revoked), the session is cleared, and the user is redirected to the login screen.

---

## 7. Role Routing Mapping

| Role | Landing Route | Description |
| :--- | :--- | :--- |
| **ADMIN** | `/admin/dashboard` | Hospital KPI overview, staff, departments, audit logs & reports |
| **DOCTOR** | `/doctor/dashboard` | OPD appointments, consultation records, admission/discharge |
| **NURSE** | `/nurse/dashboard` | Ward bed capacity, vitals tracking, MAR, fluid balance & notes |
| **RECEPTIONIST** | `/receptionist/dashboard` | Patient registration, scheduling desk, admission & billing |
| **PHARMACIST** | `/pharmacist/dashboard` | Pending prescription queue, drug inventory, restock orders |
| **PATIENT** | `/patient/dashboard` | Appointment booking wizard, active consultations & records |

---

## 8. Documentation Suite

* [System Architecture & State Management](docs/ARCHITECTURE.md)
* [Comprehensive Role Modules Guide](docs/ROLE_MODULES.md)
* [Contributing Guidelines & Code Standards](CONTRIBUTING.md)

---

## 9. License

Developed for academic evaluation in the **Advanced Database Management Systems (ADBMS)** course. All rights reserved.
