# Prompt: Healthcare Case Management RBAC System Implementation

## Project Context
You are an expert software architect and full-stack developer. I need you to implement a Role-Based Access Control (RBAC) system for a healthcare platform. The system involves complex interactions between Providers, Patients, Payers, and Manufacturers.

## User Roles
- **Admin**: System-wide configuration and oversight.
- **Provider (Doctor)**: Clinical users managing specific patient care.
- **Case Manager**: Operational staff coordinating patient journeys.
- **Patient**: End-user receiving treatment and monitoring.
- **Pharmacy**: Entities handling medication fulfillment.
- **Payer / Insurance**: Entities managing coverage and claims.
- **Manufacturer**: Pharma companies monitoring drug program analytics.

## Functional Requirements (The Matrix)
Implement the following permissions logic for each module:

| Module | Admin | Provider | Case Manager | Patient | Pharmacy | Payer | Manufacturer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| User Management | Full | View team | Limited | Own profile | Limited | Limited | Limited |
| Patient Enrollment | View/Edit | Create/View | Manage | Submit/View | View | View | View analytics |
| Patient Records | Full | View/Edit (Assigned) | View/Edit (Assigned) | View own | Limited | Limited | Aggregated |
| Prescriptions | Full | Create/Edit | Track | View | Fulfill | View | Analytics |
| Prior Authorization | Full | Submit | Manage | View | View | Approve/Reject | Analytics |
| Insurance Verification | Full | Request | Manage | View | View | Full | Analytics |
| Financial Assistance | Full | Request | Manage | Apply | View | View | Manage funding |
| Medication Adherence | Full | View | Monitor | Report | View | Analytics | Analytics |
| Side Effect Reporting | Full | View | Monitor | Report | View | Analytics | Analytics |
| Pharmacy Fulfillment | Full | View | Track | View | Full | View | Analytics |
| Communication Hub | Full | Contact | Contact | Receive/send | Limited | Limited | Broadcast |
| Clinical Docs | Full | Create/Edit | Update | View limited | None | None | Aggregated |
| Uploads / OCR | Full | Upload | Upload | Upload | Upload | View | View |
| Workflow Auto | Full | View | Operate | None | None | None | None |
| Analytics Dashboard | Full | Clinical | Operational | Personal | Fulfillment | Coverage | Market insights |
| Audit Logs | Full | None | None | None | None | None | None |
| EHR Integration | Manage | Use | Use | None | None | None | None |

## Technical Instructions for Codex
1. **Schema Design**: Generate a database schema (SQL) that handles Roles, Permissions, and User-to-Patient assignments.
2. **Access Control Logic**: Write a reusable function or middleware that validates if a `UserType` has the required `PermissionLevel` for a specific `Module`.
3. **Data Masking**: Ensure that roles like 'Manufacturer' only receive 'Aggregated' or 'Market Insight' data, while 'Patients' and 'Providers' see 'Assigned' or 'Personal' data.
4. **Code Generation**: Please provide the implementation in [INSERT YOUR PREFERRED LANGUAGE, e.g., TypeScript/Node.js].