# PolicyConnect: System API & Workflow Specifications

This document outlines the system architecture workflows, database design, and API endpoint directories for **PolicyConnect (Insurance & Mutual Funds Enquiry Management System)**.

---

## 1. Database Specifications (SQLite Schema)

PolicyConnect utilizes **SQLite3** as its core relational transactional engine, backed by a synchronous local JSON cache (`persistent_database.json`) to guarantee structural integrity of enquiry data. The database consists of three relational tables:

### A. Table: `users`
Tracks registered customer authentication details.

| Column Name | Data Type | Key Constraints | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique serial ID of the client registration. |
| `fullName` | `TEXT` | `NOT NULL` | - | Complete client registration display name. |
| `phone` | `TEXT` | `UNIQUE` | - | User mobile contact (serves as login key). |
| `email` | `TEXT` | `UNIQUE` | - | User electronic mail address (serves as login key). |
| `password` | `TEXT` | `NOT NULL` | - | Credentials password check string. |

### B. Table: `enquiries`
Houses client demographic files, address details, interactive discussion logs, and administrative evaluation parameters.

| Column Name | Data Type | Key Constraints | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | - | Unique tracking number for the enquiry task. |
| `fullName` | `TEXT` | - | - | Applicant name coordinate. |
| `phone` | `TEXT` | - | - | Applicant contact number. |
| `age` | `TEXT` | - | - | Client age category indicator. |
| `gender` | `TEXT` | - | - | Client sex category value. |
| `email` | `TEXT` | - | - | Client notification mailbox address. |
| `address` | `TEXT` | - | - | Permanent residential address. |
| `currentAddress`| `TEXT` | - | - | Temporary or active resident address. |
| `comments` | `TEXT` | - | - | Discussion feed string mapping client and agent messages. |
| `status` | `TEXT` | - | `'Pending'` | Ticket tracker state (`Pending`, `Processing`, `Accepted`, `Rejected`). |
| `adminComments` | `TEXT` | - | `''` | Administrative reviewer remarks and support answers. |
| `policyNumber` | `TEXT` | - | `''` | Issued official Insurance contract serial key. |
| `date` | `TEXT` | - | - | Time-stamped index representing file establishment day. |

### C. Table: `admins`
Secures and identifies evaluation administrators.

| Column Name | Data Type | Key Constraints | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `username` | `TEXT` | `PRIMARY KEY` | `'admin'` | Primary login username variable. |
| `password` | `TEXT` | `NOT NULL` | `'admin123'` | Core evaluation desk lock credentials. |

---

## 2. API Endpoints Directory (Endpoints & Payloads)

All system data operations happen via secure REST API transactions. The table below represents PolicyConnect's endpoint dictionary.

### A. Authentication & Registration APIs
*   **User Registration Path**: `POST /api/user/register`
    *   **Payload Requirements**: `{ "fullName": "String", "phone": "String", "email": "String", "password": "String" }`
    *   **Backend Logic**: Normalizes fields, queries standard user emails or phones for collision, writes encrypted records to SQLite, and issues status.
    *   **Successful Response**: `200 OK` → `{ "success": true, "message": "Registration successful! Please log in." }`
*   **User Sign-In Path**: `POST /api/user/login`
    *   **Payload Requirements**: `{ "identifier": "Email or Phone", "password": "Password" }`
    *   **Backend Logic**: Resolves identity parameters via `LOWER(email)` or matches raw phone entries. Evaluates passwords.
    *   **Successful Response**: `200 OK` → `{ "success": true, "user": { "id": 1, "fullName": "Praveen", "phone": "9876543210", "email": "mlpraveen31@gmail.com" } }`
*   **Administrator Sign-In Path**: `POST /api/login`
    *   **Payload Requirements**: `{ "user": "admin", "pass": "admin123" }`
    *   **Backend Logic**: Matches against the root administrator table records directly.
    *   **Successful Response**: `200 OK` → `{ "success": true }`

### B. Customer Transactions & Tracking APIs
*   **Enquiry Submission**: `POST /api/enquiry`
    *   **Payload Requirements**: `{ "fullName": "String", "phone": "String", "age": "String", "gender": "String", "email": "String", "address": "String", "currentAddress": "String", "comments": "String" }`
    *   **Backend Logic**: Logs core application metrics under database tables and signs index timestamps.
    *   **Successful Response**: `200 OK` → `{ "success": true }`
*   **User Inquiry History Query**: `GET /api/user/enquiries`
    *   **Parameters Required**: `?email=STRING&phone=STRING` (Standard request query variables)
    *   **Backend Logic**: Pulls all historic tickets registered under the client's telephone or registered electronic mailbox.
    *   **Successful Response**: `200 OK` → `[ { "id": 1, "fullName": "...", "status": "Pending", "date": "2026-05-23 12:00:00" }, ... ]`
*   **Follow-Up Chat Thread Append**: `POST /api/enquiry/comment`
    *   **Payload Requirements**: `{ "id": 1, "userComment": "Follow-up message..." }`
    *   **Backend Logic**: Retrieves historic dialogue text inside `enquiries`, appends timestamped message lines, and writes updates to the database row.
    *   **Successful Response**: `200 OK` → `{ "success": true }`

### C. Administrator Console Operations APIs
*   **Global Enquiry Listing**: `GET /api/enquiries`
    *   **Payload Requirements**: *None* (Protected admin view session query)
    *   **Backend Logic**: Generates list of all enquiries.
    *   **Successful Response**: `200 OK` → JSON array list of all applications.
*   **Enquiry Review Update**: `POST /api/update`
    *   **Payload Requirements**: `{ "id": 1, "status": "Accepted", "adminComments": "Approved remarks", "policyNumber": "POL-102932" }`
    *   **Backend Logic**: Updates the targeted ticket's evaluation status, saves corresponding evaluation remarks, and binds official Policy Certificates.
    *   **Successful Response**: `200 OK` → `{ "success": true }`
*   **Analytical Excel Export**: `GET /api/export`
    *   **Payload Requirements**: *None*
    *   **Backend Logic**: Extracts target SQL data columns, converts them to CSV string formatting, and returns the response as an attachment download (`export.csv`).
    *   **Successful Response**: `200 OK` → Raw text-embedded CSV file streaming.

---

## 3. End-to-End Application Workflow

The diagram below conceptualizes the holistic user and administrator application cycle:

```
[ Unregistered Customer ]
          │
          ├─► [ Visits PolicyConnect Landing `index.html` ]
          │
          └─► [ Goes to `enquiry.html` Registration Desk ]
                              │
                    (Creates User Profile)
                              │
                              ▼
                       [ Log In Session ] ◄── (Using email/phone)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            [ Submit Enquiry ]   [ View Application Dashboard ]
                    │                   │
             (Enters details,           ├─► (Track live Status badging)
             dual addresses)            │
                    │                   ├─► (Inspect assigned Policy Number)
                    ▼                   │
         [ Saved in sqlite3 DB ]        └─► (Read admin feedback logs)
                    │                                   ▲
                    ▼                                   │
      *─────────────────────────────*                   │
    *    ADMINISTRATOR EVALUATION     *                 │
    *    (Log in to `admin.html`)     *                 │
      *─────────────────────────────*                   │
                    │                                   │
                    ├─► [ Filter / Search Grid Row ]    │
                    │                                   │
                    ├─► [ Open Processing Modal ]       │
                    │                                   │
                    └─► [ Apply Decisive Verdict ] ─────┘
                          - Change Status Code (e.g. Processing -> Accepted)
                          - Issue Official Serial Policy Number (POL-xxx)
                          - Enter Support Feedback comments
```

### Process Lifecycle Summary

1.  **Account Provisioning**: Clients establish a secure communication node by creating accounts with unique contact variables.
2.  **Inquiry Creation**: Clients fill out customized forms defining demographics, current/permanent residential coordinates, and specific requests. These are assigned a `Pending` state.
3.  **Support Notification**: Submissions appear instantly on the administration console.
4.  **Administrative Action**: Administrators inspect candidate records, update status indicators, assign official policy certificates, and input feedback.
5.  **Interactive Dialogue**: The client views comments in their workspace and can reply back to resolve missing requirements.
6.  **Resolution & Certification**: The enquiry flows to completion (*Accepted* with active certificate display, or *Rejected* with explanation remarks).
