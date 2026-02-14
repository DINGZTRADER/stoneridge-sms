# Stoneridge School Management System (SMS)

A Ministry-compliant, production-grade school management system for **The Stoneridge School**, Uganda.

## Key Features (Audit-Response)

### 🎓 Compliance & Admissions
*   **Unique Admission Numbers:** Auto-generated IDs (e.g., `SR-2026-001`).
*   **Medical Safety:** Prominent **RED** allergy warnings on relevant profiles.
*   **Guardian Tracking:** Captures occupation, place of work, and distinct emergency contacts.
*   **Performance Agreement:** Digital Annex 6 observation forms (Ministry Standard).

### 💰 Financial Integrity
*   **Fee Structure:** Distinct separation of Tuition vs. Scholastic Materials.
*   **UPE Compliance:** Tuition automatically set to 0 UGX for UPE beneficiaries.
*   **Invoicing:** Professional PDF-ready invoices with full ABSA Bank details.
*   **Real-time Dashboard:** Tracks "Revenue Collected" and "Pending Invoices".

### 📚 Academic Excellence
*   **Ugandan Grading Engine:** Calculates grades (D1–F9) per Ministry guidelines.
*   **Time-Table Conflict Manager:** Prevents double-booking teachers.
*   **Lesson Tracking:** Logs missed/recovered lessons.

### 🛡️ Security & Architecture
*   **Role-Based Access Control (RBAC):** Admin/Teacher/Parent roles with strict route guards.
*   **AI Knowledge Base (RAG):** "Chat with Documents" using Google Gemini AI.
*   **Production Ready:** 100% TypeScript build success.

## Environment Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure API Key:**
    Create a `.env` file in the root directory:
    ```env
    # Google Gemini API Key for Document Q&A
    GEMINI_API_KEY=your_api_key_here
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## deployment

### Option 1: Vercel (Recommended)
This project includes a `vercel.json` for seamless deployment.
1.  Push code to GitHub.
2.  Import project into Vercel (free account).
3.  Add `GEMINI_API_KEY` to Vercel Environment Variables.
4.  Deploy!

### Option 2: GitHub Pages
Configure your repository settings to enable GitHub Pages if needed.

---
© 2026 Stoneridge SMS. Built for compliance.
