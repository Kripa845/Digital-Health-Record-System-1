# Mero Care Card — Final Year Project Reimplementation Prompt

You are working on **Mero Care Card**, a Digital Health Management System Final Year Project. The repository is at `C:\Users\kripa\Desktop\Digital Health Record system 1\Digital-Health-Record-System-1`.

## Tech Stack
- Frontend: React.js, TypeScript, Tailwind CSS, Vite
- Backend: Django, Django REST Framework (DRF)
- Database: PostgreSQL
- Deployment: Render (frontend + backend), Neon/PostgreSQL for DB
- Authentication: JWT / Token-based with role-based access control

---

## STRICT RULES
1. **DO NOT REINVENT** — use the CURRENT PROJECT structure. Keep existing backend apps: `apps/accounts`, `apps/patients`, `apps/family`, `apps/medical_history`, `apps/documents`, `apps/qr`, `apps/otp`, `apps/common`, `apps/contact`, and `core`.
2. **Do NOT break existing APIs.** Preserve all current DRF endpoints, serializers, and models unless explicitly told to remove.
3. **Do NOT remove QR generation or QR scanning functionality.** These must be preserved and integrated into the new portal structure.
4. **Do NOT remove authentication/authorization.** Keep login/logout flows intact.
5. **Work in PARALLEL** on backend and frontend simultaneously. Do not wait for one to finish before starting the other.

---

## PART 1: BACKEND CHANGES (Django + DRF)

### 1.1 Remove Custom Django Admin Theming
- Delete `backend/templates/admin/index.html` (custom dashboard template).
- Revert `backend/settings.py` `JAZZMIN_SETTINGS` and `JAZZMIN_UI_TWEAKS` to **minimal/near-default values**:
  - Keep only basic branding: `site_title = "Mero Care Admin"`, `site_header = "Mero Care"`, `welcome_sign = "Mero Care Administration"`.
  - Remove custom `dashboard` stat widgets, custom `topmenu_links`, custom `usermenu_links`, custom `icons`, custom `custom_links`, and `navigation_expanded`.
  - Remove all `JAZZMIN_UI_TWEAKS` overrides except basic theme colors if needed.
  - **Goal:** Make Django admin look as close to default Django admin as possible. No Jazzmin fancy UI. No custom dashboard cards. No custom sidebar.
- In `core/admin.py`:
  - Remove the monkey-patch block at the bottom (`_patched_index`, `django_admin.site.index = _patched_index`).
  - Remove `get_dashboard_stats`, `get_chart_data`, `get_recent_activity`, `get_filter_options` imports and usage.
  - Remove custom `SimpleListFilter` classes that are not essential (you may keep basic ones if needed, but default Django field filters are preferred).
  - Keep all `ModelAdmin` classes (`UserAdmin`, `PatientProfileAdmin`, `FamilyMemberProfileAdmin`, `MedicalHistoryEntryAdmin`, `PatientDocumentAdmin`, `PatientOTPAdmin`, `ContactMessageAdmin`) with standard `list_display`, `list_filter`, `search_fields`, `fieldsets`, `readonly_fields`, `inlines`, and `actions`.
  - Ensure `list_filter` uses standard Django field lookups rather than custom filters where possible.
  - Ensure cascade delete behavior: deleting a `PatientProfile` should also delete the linked `User` (keep the existing `delete_model` and `delete_queryset` overrides).

### 1.2 Database & Models
- Keep all existing models intact: `User`, `PatientProfile`, `FamilyMemberProfile`, `PatientDocument`, `MedicalHistoryEntry`, `PatientOTP`, `ContactMessage`.
- Ensure `User` model has `role` field with choices: `PATIENT`, `ADMIN`. Add `DOCTOR` role if not present.
- Ensure `PatientProfile` has: `healthcare_id` (auto-generated, unique, read-only, format `PAT000001`), `qr_token` (UUID, unique), `scan_count`, `last_scanned_at`, `is_profile_setup`, plus all personal/medical fields.
- Ensure `FamilyMemberProfile` has similar QR fields and links to `PatientProfile`.
- Ensure all validation rules from the prompt are enforced at the **serializer/model level**:
  - First/Middle/Last name: required, letters and spaces only, 2-50 chars.
  - Age: required, numeric, 0-120, auto-calculate from DOB if empty.
  - DOB: required, valid date, not future, max age 120 years.
  - Gender: required, dropdown Male/Female/Other.
  - Blood group: required, dropdown A+, A-, B+, B-, AB+, AB-, O+, O-.
  - Contact number: required, exactly 10 digits, Nepal format `^(98|97)\d{8}$`, unique.
  - Emergency contact: required, 10 digits, Nepal format, cannot match patient contact number.
  - Address: required, 5-150 chars, allowed: letters, numbers, spaces, comma, hyphen, slash. Regex: `^[A-Za-z0-9,\-\/]{5,150}$`.
  - Height: numeric, 45-250 cm.
  - Weight: numeric, 2-300 kg.
  - Allergies: optional, max 500 chars.
  - Current prescription: optional, max 1000 chars.
  - Medications: optional, max 1000 chars.
  - Pain log: optional, 0-10 scale.
  - Email: valid email format, unique if provided.
- Create a `Doctor` profile model (or extend `User` with a `DoctorProfile` model) with:
  - `doctor_id` (system-generated, unique, read-only)
  - First name, middle name, last name (same validation as patient)
  - Gender, DOB, auto-calculated age
  - Phone number (Nepal format, unique)
  - Photo upload
  - Department, Specialization, Medical License Number (unique)
  - Account: username (unique), password (hashed)
  - Status: Active/Inactive
  - Registration date, created by (Admin)

### 1.3 API Endpoints (DRF)
Maintain existing routers and add new ones as needed:
- `auth/` — login-init, login-verify, forgot-password, reset-password, verify-reset-otp
- `patients/` — PatientProfile CRUD, `me/` (current patient), `by-healthcare-id/`, `delete-me/`
- `family/` — FamilyMemberProfile CRUD
- `documents/` — PatientDocument list/create
- `qr/` — QR token generation/scan endpoints
- `otp/` — OTP endpoints
- `contact/` — Contact message creation
- `doctors/` — NEW: Doctor CRUD endpoints
- `recommendations/` — NEW: Doctor recommendation endpoint

**Important:** All endpoints must be role-protected. Use DRF permissions:
- `IsAdmin` — for admin-only endpoints
- `IsPatient` — for patient-only endpoints
- `IsDoctor` — for doctor-only endpoints

### 1.4 Validation & Error Handling
- All validations must return **standardized error responses** matching the provided error messages list.
- Use DRF serializers with explicit `error_messages` or custom validation methods.
- Return proper HTTP status codes: 400 for validation errors, 401 for auth, 403 for permissions, 404 for not found, 500 for server errors.
- Generic error handler for uncaught exceptions.

### 1.5 Doctor Recommendation Engine
- Create a rule-based recommendation endpoint `POST /api/recommendations/`.
- Logic: match patient symptoms/disease against doctor specialization, department, and availability.
- Return ranked list of recommended doctors with match score and reasoning.

---

## PART 2: FRONTEND CHANGES (React + TypeScript + Tailwind)

### 2.1 Theme Restructure
- Create a **single source of truth** theme file at `frontend/src/theme/theme.ts`.
- Move all existing color constants from `frontend/src/styles/theme.ts` into `frontend/src/theme/theme.ts`.
- Export typed theme object and helper functions.
- Update all pages to import from `@/theme/theme` instead of `@/styles/theme`.
- Keep the exact same color values provided in the prompt (do not change colors).

### 2.2 Landing Pages (Public)
Redesign the public-facing home page to match the prompt exactly:
- **Nav items:** Home, Features, Services, Contact, About
- **Login button** in navbar → opens modal/page with 3 options: Login as Admin, Login as Patient, Login as Doctor
- Each nav item must have descriptive content sections.

### 2.3 Login Pages
Create separate login flows:
- **Admin Login:** Predefined credentials (hardcoded or seeded superuser). Show error for invalid credentials.
- **Patient Login:** Username/password generated by admin during patient creation. Same for Doctor login.
- All login pages must use the theme colors and glass-morphism cards.
- JWT token storage in localStorage/cookies with proper expiry handling.

### 2.4 Admin Portal (Side Navbar)
After admin login, show sidebar with:
- Dashboard
- Patient Management
- Doctor Management
- Doctor Recommendation

**Dashboard:**
- Stat cards: Total Users, Total Patients, Total Admins, Active Users
- All data fetched from backend APIs (no hardcoded values)
- Recent activity table

**Patient Management:**
- Add Patient form with ALL fields and validations from the prompt
- Auto-generated Patient ID (`PAT000001` format)
- Dynamic QR code generation on creation
- QR code download button
- Patient list with search, filter by disease, filter by status (Active/Inactive)
- Edit/Delete/View actions
- Validation error messages matching the provided list exactly

**Doctor Management:**
- Add Doctor form with all fields
- Auto-generated Doctor ID
- Username/password generation with validation
- Doctor list with search, filter by department/specialization
- Activate/Deactivate toggle
- Assign department, update availability

**Doctor Recommendation:**
- Symptom input form
- Display recommended doctors with match scores
- Rule-based matching logic

### 2.5 Doctor Portal
After doctor login:
- Sidebar or top nav with: Dashboard, My Patients, Profile, Logout
- Dashboard stats: Total Patients, My Patients count
- Patient table showing only patients assigned to logged-in doctor
- Search by Patient ID, Name, Phone Number
- Pagination, sorting by Name/Age/Date Added
- View patient details (read-only)
- No edit/delete permissions

### 2.6 Patient Portal
After patient login:
- Sidebar or top nav with: Dashboard/Home, My Profile, My QR Code, Logout
- **View Only Dashboard** — show all personal, contact, and medical info entered by admin
- **Read-only badge/message** displayed prominently
- **QR Code display** — show patient's QR code, allow download as image
- Patient ID displayed clearly
- No edit/update/delete buttons anywhere
- **NO CHANGE PASSWORD OPTION** — explicitly disable/remove password change functionality
- Search/filter view-only for personal records
- Logout button in sidebar/navbar

### 2.7 QR Code Features
- QR generation on patient creation (backend API)
- QR scanning endpoint already exists — keep it
- Patient can download their QR code as PNG/SVG
- QR code links to patient view-only portal

### 2.8 Logout
- Add logout button in sidebar/navbar for ALL portals: Admin, Doctor, Patient
- Clear tokens on logout, redirect to respective login page

### 2.9 Responsive Design
- All pages must be fully responsive (mobile, tablet, desktop)
- Use Tailwind CSS utility classes
- Collapsible sidebar on mobile
- Proper spacing, shadows, and glass-morphism cards using the theme

---

## PART 3: EXECUTION PLAN (Parallel Execution)

### Phase 1 — Backend First (Day 1)
1. Remove custom admin theming (`templates/admin/index.html`, Jazzmin overrides in settings)
2. Add `DOCTOR` role to `User` model if missing
3. Create/update `DoctorProfile` model with all required fields and validations
4. Create doctor serializers with all validation rules from prompt
5. Create doctor viewsets/endpoints
6. Update `User` serializer to include role-based responses
7. Ensure cascade deletes work correctly
8. Run migrations and verify DB schema

### Phase 2 — Frontend First (Day 1-2, parallel with backend)
1. Create `src/theme/theme.ts` with all color constants
2. Update all existing imports from `styles/theme` to `theme/theme`
3. Build Landing Page with navbar: Home, Features, Services, Contact, About + Login button
4. Build Login selection page/modal with 3 options
5. Build Admin layout with sidebar (Dashboard, Patient Management, Doctor Management, Doctor Recommendation)
6. Build Doctor layout with sidebar
7. Build Patient layout with sidebar

### Phase 3 — Integration (Day 2-3)
1. Connect Admin Dashboard to backend stats API
2. Build Patient Management form with all validations
3. Build Doctor Management form with all validations
4. Build Doctor Recommendation page
5. Build Doctor Patient list page
6. Build Patient View-Only dashboard with QR display
7. Implement QR download functionality
8. Add logout to all portals
9. Test all CRUD operations
10. Test role-based access control

### Phase 4 — Testing & Deployment (Day 3-4)
1. Test all validation rules against provided error message list
2. Test responsive design on all screen sizes
3. Verify QR generation and scanning still works
4. Deploy backend to Render with PostgreSQL
5. Deploy frontend to Render
6. Verify production environment

---

## WHAT TO KEEP (Do NOT modify/remove)
1. All existing model fields and relationships
2. QR token generation and scanning endpoints
3. OTP functionality
4. Document upload/download
5. Family member management
6. Contact message endpoint
7. Existing authentication flow structure
8. `core/dashboard_data.py` logic (even though admin template is removed, keep data functions for potential API use)

## WHAT TO REMOVE
1. `EHEALTH-SYSTEM/backend/templates/admin/index.html` (custom dashboard)
2. All Jazzmin customization in `settings.py` — revert to default Django admin appearance
3. Custom admin dashboard widgets and custom sidebar navigation in admin
4. `_patched_index` monkey-patch from `core/admin.py`
5. Any custom `SimpleListFilter` classes not essential (use default Django filters)
6. Remove custom dashboard charts and recent activity widgets from admin

---

## IMPORTANT NOTES
- **Do not** create new Django apps unless absolutely necessary. Reuse existing ones.
- **Do not** break existing API URLs. Frontend depends on them.
- **Keep** the existing `build.sh` and deployment configuration.
- **Keep** CORS settings and CSRF trusted origins.
- **Keep** the Neon/PostgreSQL database configuration.
- **Do not** change the existing folder structure significantly.
- **Use** the exact validation regexes and error messages provided in the prompt.
- **Ensure** all forms have proper loading states, error states, and success messages.
- **Use** TypeScript interfaces for all data models.
- **Use** React Hook Form + Zod or similar for frontend validation, OR manual validation with the exact error messages.

---

## DELIVERABLES
1. Backend: Clean default Django admin, Doctor model/endpoints, all validations working
2. Frontend: 4 portals (Landing, Admin, Doctor, Patient) with full functionality
3. Theme: Single `src/theme/theme.ts` used by all pages
4. QR: Functional on both backend and frontend
5. Deployment: Both services live on Render, DB on Neon/PostgreSQL
6. Testing: All validation rules verified, responsive design checked

---

## START HERE
1. First, remove all custom Django admin theming and revert to default.
2. Then work on Doctor model and endpoints.
3. Parallel: Build frontend theme and login pages.
4. Then build each portal one by one.
5. Test continuously. Do not wait until the end to test.
