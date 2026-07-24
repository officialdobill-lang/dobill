# DO BILL POS - COMPLETE PROJECT BLUEPRINT (POINTS 1 TO 8)

This file contains the complete, authoritative 8-point system blueprint for the DO BILL POS application.

---

## 1. PRD (Product Requirement Document)

### 1.1 Executive Summary
DO BILL is an enterprise-grade, high-performance Retail Point of Sale (POS) and Inventory Management System designed for small to medium retail businesses (grocery stores, electronics shops, apparel boutiques, hardware, etc.). It delivers instant offline-first billing, multi-unit stock tracking, ESC/POS thermal printing, dynamic UPI QR payment generation, and bulletproof multi-account data isolation.

### 1.2 Target User Personas
- **Store Owner / Super Admin**: Manages overall store configuration, views financial analytics, oversees inventory, configures UPI VPAs, and invites colleagues.
- **Store Cashier / Billing Executive**: Handles high-speed checkout, barcode scanning, item discounts, cash/UPI payment collection, and instant receipt printing.
- **Store Inventory Manager**: Adds new items, updates batch pricing, monitors low-stock alerts, and manages multi-unit conversions (e.g. Box -> Pcs, Kg -> Gm).

### 1.3 Key Functional Requirements
1. **POS Billing Engine**:
   - High-speed product lookup via barcode scanner or search query.
   - Multi-unit item support (e.g. Box of 10, Pcs, Kg, Ltr).
   - Real-time tax calculation (GST rates: 0%, 5%, 12%, 18%, 28%).
   - Item-level & invoice-level discount calculation.
   - Dynamic UPI QR code rendering directly on screen with VPA validation.
2. **Multi-Account & Multi-Tenant Data Isolation**:
   - Every store owner operates within a strictly isolated workspace identified by their registered Gmail/Username ID (`workspace_owner`).
   - Account 1 (e.g., store1@gmail.com) and Account 2 (e.g., store2@gmail.com) MUST NEVER see or alter each other's products, sales records, GSTIN details, or customer lists.
3. **Inventory & Stock Tracking**:
   - Stock deduction automatically triggered upon invoice confirmation.
   - Low-stock visual thresholds and alerts on dashboard.
   - Batch pricing and multi-unit conversions.
4. **Thermal Receipt Printing**:
   - ESC/POS thermal printer integration via WebUSB, Bluetooth Serial, and browser direct print.
   - Customized receipt header, store logo, GSTIN summary, and barcode printing.
5. **Session Security & OTP Recovery**:
   - 24-hour max session lifespan with auto-logout.
   - Password reset via 6-digit email OTP verification.

---

## 2. TRD (Technical Requirement Document)

### 2.1 System Architecture
DO BILL follows a full-stack client-server architecture with an Express.js backend and a React 18 frontend, compiled via Vite and esbuild.

```
+-----------------------------------------------------------------+
|                         CLIENT LAYER                            |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons    |
|  HashRouter / BrowserRouter Fallback + DirectPrintService       |
+-----------------------------------------------------------------+
                                |
                   REST API / JSON Over HTTP
                                |
+-----------------------------------------------------------------+
|                         SERVER LAYER                            |
|  Express.js (Port 3000) + Node.js ESM/CJS Runtime               |
|  Workspace Isolation Middleware (x-workspace-owner Header)     |
+-----------------------------------------------------------------+
                                |
                 Parameterized SQL Prepared Statements
                                |
+-----------------------------------------------------------------+
|                        DATABASE LAYER                           |
|  SQLite3 / Persistent Disk Storage (/data/dobill.db)             |
|  Strict Row Isolation (WHERE workspace_owner = ?)              |
+-----------------------------------------------------------------+
```

### 2.2 Tech Stack
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS v4, Lucide React Icons, Motion/React, Recharts.
- **Backend**: Express 4, Node.js (v18+), SQLite3 database engine (`better-sqlite3` / `sqlite3` bridge).
- **Thermal Printing Engine**: ESC/POS binary command builder (`DirectPrintService.ts`) supporting WebUSB, Serial, and HTML window printing.
- **Authentication**: Custom SHA-256 password hashing + OTP generator + Session token store.

---

## 3. App Flow & Navigation Map

### 3.1 Account Onboarding & Authentication Flow
1. **User Visit** -> System checks local auth token and session timestamp.
2. **If Unauthenticated**:
   - Screen displays "Access Terminal" / "Create Store Account".
   - User inputs Username/Gmail ID + Password.
   - For Forgot Password: Click "Forgot Password?" -> Enter Email -> System emails 6-digit OTP -> Verify OTP -> Set New Credentials -> Redirect to Login.
3. **If Authenticated**:
   - System loads owner email as active `workspace_owner`.
   - Dashboard loads isolated metrics for the selected workspace.

### 3.2 Daily POS Billing Flow
1. **Navigate to /pos** -> Focus automatically set to Barcode / Search Input.
2. **Product Selection**:
   - Option A: Scan Barcode via physical USB scanner or webcam camera.
   - Option B: Type product name or select from visual quick-cards.
3. **Quantity & Discount Config**:
   - Adjust quantity (Pcs, Box, Kg).
   - Select GST rate or apply item-level / cart-level discount.
4. **Payment Processing**:
   - Select Payment Method: Cash, UPI, Card, Credit/Udhar.
   - If UPI selected: Dynamic UPI QR code is auto-generated using store VPA & bill amount.
5. **Checkout Confirmation**:
   - Invoice saved to SQLite database with active `workspace_owner`.
   - Stock deducted automatically in SQLite `products` table.
   - Thermal Printer prints receipt via ESC/POS protocol or browser print.

---

## 4. UI/UX Design System Brief

### 4.1 Color System
- **Primary / Action**: Indigo-600 (`#4F46E5`)
- **Background**: Soft Off-White / Slate-50 (`#F8FAFC`)
- **Card & Surface Containers**: Pure White (`#FFFFFF`) with 1px border Slate-100 (`#E2E8F0`)
- **Success**: Emerald-600 (`#059669`)
- **Warning**: Amber-600 (`#D97706`)

---

## 5. Backend Database Schema & REST APIs

### SQLite Schema (`/data/dobill.db`)
- `products`: (`id`, `workspace_owner`, `name`, `barcode`, `price`, `stock`, `unit`, `gst_rate`, `created_at`)
- `sales`: (`id`, `workspace_owner`, `receipt_no`, `items_json`, `subtotal`, `tax`, `total`, `payment_method`, `created_at`)
- `users`: (`id`, `username`, `email`, `password_hash`, `store_name`, `reset_otp`)
- `shop_details`: (`workspace_owner`, `name`, `address`, `phone`, `gstin`, `vpa`, `logo`)

---

## 6. Implementation Plan
- Phase 1: SQLite DB Multi-Tenant Isolation
- Phase 2: POS Terminal & Multi-Unit Barcode Scanning
- Phase 3: Sales Records & ESC/POS Thermal Printing
- Phase 4: Account Recovery, OTP Email Engine & Store Switcher
- Phase 5: Executable Packaging & Mobile PWA
- Phase 6: System Blueprint & Continuous Auditing

---

## 7. Embedded AI Documentation Hub
Use this directive for future AI interactions:
`Every query MUST enforce WHERE workspace_owner = ?`

---

## 8. Code Architecture & Multi-Account Security Audit
- **Status**: VERIFIED & SECURE
- Account 1 and Account 2 data streams are strictly isolated via bound SQL parameters.
