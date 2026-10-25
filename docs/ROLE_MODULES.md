# MediCore HMS - Role Modules Guide

This document details the functional specifications, page routes, data models, and user workflows for each of the six role portals within **MediCore HMS**.

---

## 1. Admin Portal (`/admin/*`)

The Administrator portal provides executive oversight, workforce governance, organizational hierarchy management, security auditing, and operational workload analytics.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/admin/dashboard` | `AdminDashboard` | Real-time hospital overview KPIs (patient census, bed occupancy bar, today's appointment breakdown), department capacity load, and recent audit activity. |
| `/admin/staff` | `StaffManagement` | Directory of all healthcare personnel with specialty filters, creation wizard with password generation, active status toggles, and soft deletion. |
| `/admin/departments` | `Departments` | Interactive tree viewer for hospital departments and sub-departments with nested hierarchies. |
| `/admin/audit` | `AuditLogs` | Security & compliance audit trail filterable by actor, action type, risk level (`LOW`, `MEDIUM`, `HIGH`), and date. |
| `/admin/reports` | `AdminReports` | Hospital workload analytics, provider ranking with window function metrics, and workload report CSV export. |

---

## 2. Doctor Portal (`/doctor/*`)

The Physician portal is tailored for outpatient consultations, inpatient management, electronic prescriptions, and diagnostic orders.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/doctor/dashboard` | `DoctorDashboard` | Daily schedule overview, upcoming patient queue with patient age and blood group, mini-calendar filter, and appointment metrics. |
| `/doctor/patient-action` | `PatientAction` | Comprehensive clinical workspace: patient medical profile, allergy conflict warnings, admission requests, and digital diagnosis/prescription authoring. |
| `/doctor/schedule` | `DoctorSchedule` | Weekly consultation calendar and slot booking status. |
| `/doctor/labs` | `LabOrders` | Laboratory order placement, tracking, and diagnostic test results review. |
| `/doctor/patients` | `PatientSearch` | Cross-hospital patient search by name, patient ID, and contact details. |

### Clinical Actions Workflow:
1. **Patient Check-in**: Physician views today's scheduled consultations.
2. **Review & History**: The doctor checks past visits, recorded vital signs, and allergy contraindications.
3. **Prescribe & Order**: Digital prescriptions are drafted and sent directly to the pharmacy dispensing queue (`POST /pharmacy/prescriptions/send/{apt_id}`).
4. **Admission / Discharge**: If inpatient care is required, the doctor creates an admission request with clinical priority; for recovering inpatients, the physician authorizes clinical discharge.

---

## 3. Nurse & Inpatient Portal (`/nurse/*`)

Designed for round-the-clock ward management, the nurse module coordinates bed statuses, clinical vitals, medication administration, and fluid balance tracking.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/nurse/dashboard` | `NurseDashboard` | Real-time ward capacity overview, active shift metrics, critical patient count, pending orders, and medications due. |
| `/nurse/bed/[id]` | `BedDetailPage` | Bed status controls (`Available`, `Cleaning`), assigned patient demographics, vital signs trend chart, and bed turnover logging. |
| `/nurse/patients` | `WardPatients` | Roster of currently admitted patients in the ward with vitals status indicators (`CRITICAL`, `MODERATE`, `STABLE`). |
| `/nurse/mar` | `MedicationAdministration` | Medication Administration Record (MAR) with **5-Rights Verification** checkbox (`Right Patient`, `Right Drug`, `Right Dose`, `Right Route`, `Right Time`), administration history, and allergy conflict flags. |
| `/nurse/notes` | `NursingNotes` | Structured clinical documentation supporting **SOAP Notes** (Subjective, Objective, Assessment, Plan), General notes, Wound Care, and Care Plans. |
| `/nurse/orders` | `DoctorOrders` | Inpatient doctor orders queue with one-click status acknowledgment (`Acknowledged`) and completion (`Done`). |

### Fluid Balance (Intake / Output):
Nurses record fluid entries categorized by:
* **Intake**: Oral fluids, IV fluids, enteral feeding (in mL).
* **Output**: Urine, surgical drains, NG tube aspirate (in mL).
* Computes net fluid balance (`Intake - Output`) automatically for patient monitoring.

---

## 4. Receptionist Portal (`/receptionist/*`)

The Receptionist desk manages patient onboarding, appointment bookings, bed assignments, and inpatient discharge settlements.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/receptionist/dashboard` | `ReceptionistDashboard` | Daily summary cards (appointments today, active admissions, total patients) and quick-action navigation. |
| `/receptionist/book` | `PatientRegistration` | New patient registration form with emergency contact, blood group, allergies, and instant patient ID issuance. |
| `/receptionist/patients` | `PatientRecords` | Searchable patient registry with contact details and visit history. |
| `/receptionist/appointments` | `ManageAppointments` | Multi-doctor scheduling grid, live slot picker, rescheduling desk, and appointment cancellation. |
| `/receptionist/admit` | `AdmitPatient` | Inpatient admission processing: ward selection, bed availability checker, and legal guardian documentation. |
| `/receptionist/admissions` | `DischargeBilling` | Automated discharge calculation (room charges + treatment fees), payment recording (Cash, Card, Insurance), and final patient release. |

---

## 5. Pharmacist Portal (`/pharmacist/*`)

The Pharmacy module oversees medication inventory, batch expiration management, prescription dispensing queues, and automated reorder purchase orders.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/pharmacist/dashboard` | `PharmacistDashboard` | Real-time queue of pending prescriptions transmitted by doctors, ready for verification and dispensing. |
| `/pharmacist/inventory` | `PharmacyInventory` | Complete medicine inventory table with stock health indicators (`IN_STOCK`, `LOW_STOCK`, `EXPIRING_SOON`, `EXPIRED`, `OUT_OF_STOCK`), selling price, and reorder threshold levels. |
| `/pharmacist/history` | `DispensingHistory` | Audit log of all completed dispensations with unit prices, total revenues, and dispensing timestamps. |
| `/pharmacist/reports` | `PharmacyReports` | Top-dispensed medications ranking and daily revenue analytics. |

### Restock & Purchase Order Workflow:
1. **Low Stock Detection**: Automated identification of medicines with `stock_qty <= reorder_level`.
2. **Purchase Order Creation**: Formal order generation with minimum 3-day lead time verification.
3. **Stock Intake Receipt**: Confirming order delivery automatically restocks medicine quantities and updates batch expiration dates.

---

## 6. Patient Portal (`/patient/*`)

The Patient portal empowers healthcare consumers to manage their consultations and access their medical records.

### Pages & Capabilities
| Route | Page Component | Primary Functions |
| :--- | :--- | :--- |
| `/patient/dashboard` | `PatientDashboard` | Upcoming appointment cards with doctor details, quick action shortcuts, and clinical notices. |
| `/patient/book` | `BookAppointmentPage` | Interactive 3-step appointment booking wizard: (1) Department & Physician selection, (2) Date selection, (3) Available time slot confirmation. |
| `/patient/appointments` | `MyAppointments` | List of upcoming and historical appointments with status tracking (`CONFIRMED`, `PENDING`, `COMPLETED`, `CANCELLED`). |
| `/patient/records` | `MedicalRecords` | Past consultation summaries, clinical diagnoses, and attending doctor details. |
| `/patient/prescriptions` | `MyPrescriptions` | Active medication prescriptions, dosages, instructions, and dispensation status. |
| `/patient/profile` | `PatientProfile` | Personal demographics, date of birth, emergency contact, and documented allergies. |
