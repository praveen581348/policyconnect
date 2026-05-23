# PolicyConnect System Requirements Specification

This document details the rigorous hardware and software specifications for **PolicyConnect: Insurance & Mutual Funds Enquiry Management System**. These technical requirements are configured to promote exceptional response times, reliable relational transactional processing, cross-system compatibility, and unified layout rendering.

---

## 1. Hardware Requirements

To guarantee high scalability, concurrent query processing, active database writes, and smooth responsive layout animation speeds, the hardware environment hosting and accessing PolicyConnect must satisfy the following parameters:

### A. Client-Side User & Evaluator Hardware
End-user client machines (enquiry submitters) and support evaluation desks (administrators) must meet the following hardware criteria:

*   **Processor (CPU):**
    *   *Minimum:* Dual-Core standard x86\_64 processor or ARM processor (such as Intel Core i3 / AMD Ryzen 3 / Apple Silicon M1) running at 1.5 GHz clock speed.
    *   *Recommended:* Quad-Core or greater high-performance processor (such as Intel Core i5 / AMD Ryzen 5 / Apple Silicon M2 or newer) running at 2.4 GHz+ clock speed.
*   **System Memory (RAM):**
    *   *Minimum:* 4 GB DDR3 / DDR4 System Memory.
    *   *Recommended:* 8 GB DDR4 / DDR5 or higher for rapid concurrent Chrome/Safari tab rendering.
*   **Persistent Storage (Disk space):**
    *   *Minimum:* 250 MB of available local disk drive space (primarily for browser caches, dynamic cookie indices, and local state persistence files).
    *   *Recommended:* 1 GB or greater high-speed Solid State Drive (SSD) space.
*   **Display Resolution & Monitor Support:**
    *   *Minimum:* 13-inch display backing a native resolution of **1366 x 768** pixels.
    *   *Recommended:* High-Definition display with native **1920 x 1080 (1080p)** or greater (highly recommended for processing multi-column matrices on the Administrator interactive board without horizontal scroll fatigue).
*   **Networking Interfaces:**
    *   *Minimum:* Standard Wireless Wi-Fi 802.11n or 10/100 Mbps Ethernet communication adapter.
    *   *Recommended:* Dual-band Wi-Fi 5 / Wi-Fi 6 cards or Gigabit Ethernet (10/100/1000 Mbps) interface for lag-free administrative updates.

### B. Server-Side Hosting & Cloud Runtime Node
The deployment workstation, staging server, or container cluster must comply with these metrics:

*   **Processor (CPU):**
    *   *Minimum:* 2 Virtual CPUs (vCPUs) with at least 2.0 GHz virtual core processing frequency.
    *   *Recommended:* 4 vCPUs or higher Intel Xeon / AMD EPYC enterprise processors.
*   **System Memory (RAM):**
    *   *Minimum:* 4 GB ECC or Non-ECC DDR4 memory.
    *   *Recommended:* 8 GB or 16 GB high-speed Server DDR5 RAM.
*   **Storage Partition Unit:**
    *   *Minimum:* 500 MB partition space allocation on a standard Hard Disk Drive (HDD).
    *   *Recommended:* 2 GB high-speed PCIe NVMe M.2 Solid State Drive (SSD) dedicated folder space for fast page servicing, continuous SQLite standard query commits, and backup write operations.
*   **Outbound Interface Bandwidth:**
    *   *Minimum:* Standard 10 Mbps dynamic upstream band pipeline.
    *   *Recommended:* 100 Mbps or 1 Gbps dedicated high-availability fiber network backplane.

---

## 2. Software Requirements: Operating System (OS)

The application binaries, REST handlers, and relational engines are strictly certified to run natively and headlessly across modern 64-bit multi-user Operating Systems without structural code modifications (Cross-Platform Dual-Portability).

*   **Microsoft Windows platform:**
    *   *Supported Configurations:* Windows 10 (Home, Pro, Enterprise 64-bit), Windows 11 (Home, Pro, Enterprise), and server-grade Windows Server 2016, 2019, or 2022.
*   **Apple macOS platform:**
    *   *Supported Configurations:* macOS 12.0 (Monterey), macOS 13.0 (Ventura), macOS 14.0 (Sonoma) or newer. Full native compilation is certified on Intel-64 and Apple Silicon systems (M1, M2, M3 chip architectures via universal binaries).
*   **Linux Distributions:**
    *   *Supported Configurations:* Debian GNU/Linux 11 & 12, Ubuntu Linux 20.04 LTS & 22.04 LTS, Red Hat Enterprise Linux (RHEL) 8 & 9, CentOS Stream 9, and Fedora Workstation 38+.

---

## 3. Software Requirements: Front-End Tech Stack

The presentation layer operates completely in the customer’s desktop or mobile safari/chrome web client utilizing modern W3C standards without pre-compilation overheads to optimize load times and offline accessibility.

### A. HTML (HyperText Markup Language)
*   **Engine Specification Version:** **HTML5** (W3C standard specification)
*   **Operational Role in System:**
    *   Translates structural layout segments including grid views, login cards, multi-pane registration zones, data forms, and administrative review modules.
    *   Ensures reliable access control via semantic structural wrappers (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
    *   Specifies declarative validation on inputs (such as matching fields via `required`, typing structures like `type="tel"`, `type="email"`, and numerical caps).

### B. CSS (Cascading Style Sheets & Styling Utility)
*   **Engine Specification Version:** **Tailwind CSS v3.4.x** (Injected via high-speed Content Delivery Networks)
*   **Operational Role in System:**
    *   Provides instant, uniform fluid typography sizing and eye-safe color layouts (such as off-white canvas spaces paired with professional ocean blue coordinates and dark status badges).
    *   Uses flexbox rows and bento grid setups (`grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`) to auto-adapt display zones to fit both mobile phones and Full-HD monitors.
    *   Uses rich UI elements (such as hover transitions, active shadow boundaries, focus outlines, and responsive status-badge classes) for intuitive click targets.

### C. JavaScript (Client Scripting Engine)
*   **Engine Specification Version:** **ECMAScript 2020 (ES11 / Modern ES6+)**
*   **Operational Role in System:**
    *   Implements interactive interface logic such as state transitions, UI form toggles, dashboard tab switches, and analytical record search filters.
    *   Manages user logins, saves verified active sessions, and maintains identities via browser `localStorage` client storage arrays.
    *   Performs AJAX transactions using the native `Fetch API` to connect presentation variables with the python application servers asynchronously.
    *   Processes responsive fallback steps (such as displaying informative offline logs during connection drops or input failures).

---

## 4. Software Requirements: Back-End (Python Environment)

The backend processing environment handles high-speed query routing, evaluates identities, parses JSON envelopes, and connects directly to the system's SQLite relational repository.

| Software Asset / Library | Exact Version | Primary Functional Role in Project Lifecycle |
| :--- | :--- | :--- |
| **Python Interpreter** | **v3.10.x / v3.11.x / v3.12.x** | Multi-paradigm runtime interpreter implementing backend business logic. |
| **Flask** | **v3.0.3** | Micro-web framework organizing server initiation instances, API endpoint rules (`/api/enquiries/*`, `/api/user/*`), parsing route JSON inputs, and delivering HTTP assets. |
| **Flask-Cors** | **v4.0.1** | Security engine organizing Cross-Origin Resource Sharing (CORS) rules to secure requests across alternative port layers. |
| **sqlite3 Standard Module** | Standard python standard library binding | Embedded SQLite native C-driver interface executing quick relational database interactions. |

### Configuration File (`requirements.txt`)
```text
Flask==3.0.3
Flask-Cors==4.0.1
```

---

## 5. Software Requirements: Relational Database Layer

The database tier stores transactional information (users, customer enlisting, tickets, admin keys) with ACID-compliant integrity.

*   **Database Engine:** **SQLite3**
*   **Ecosystem Engine Version:** **v3.40.x / v3.45.x** or higher
*   **Relational Model Properties:**
    *   *Embedded Persistence:* Relies on a single, compact, file-based database (`database.db`) operating asynchronously to avoid server bloat.
    *   *Transaction Integrity:* Fully satisfies Atomicity, Consistency, Isolation, and Durability (ACID) parameters during multiple, simultaneous user registrations.
*   **Relational Entity Tables:**
    *   `users`: Manages authentication registers (`id`, `fullName`, `phone`, `email`, `password`).
    *   `enquiries`: Stores client demographic categories, permanent and current address lines, follow-up messages, status badges, and assigned application numbers.
    *   `admins`: Holds secure system administrative login passwords.
*   **Local Resiliency Cache:** Implements a direct backup persistent engine (`persistent_database.json`) as a safety net which automatically caches table rows to guarantee near-zero data loss.
