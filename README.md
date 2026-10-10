# One City, One Journey (PS-08)

> **Gujarat Metro & Urban Mobility Hackathon · GDG Gandhinagar · Problem Statement PS-08**  
> **Unified Multi-Modal Transit Ticketing & Clearinghouse Spine for Ahmedabad & Gandhinagar**

An end-to-end, unified urban mobility platform connecting **GMRC Metro**, **Ahmedabad Janmarg (BRTS)**, and **AMTS (Municipal Buses)** into a single digital ticketing, validation, and automated inter-agency clearinghouse infrastructure.

---

## 📌 Problem Statement (PS-08)

### The ₹14,000 Crore Mobility Dilemma
Despite massive public capital investments in modern transport infrastructure across Ahmedabad and Gandhinagar, transit networks operate significantly below design capacity due to operational siloing:

1. **3 Siloed Transit Agencies with Zero Interoperability:**
   - **GMRC** (State/Central Metro), **AJL** (AMC Janmarg BRTS), and **AMTS** (Municipal City Buses) operate independent ticketing databases, distinct fare calculation logic, and separate physical gates/conductors.
2. **Interchange Friction & First/Last-Mile Gaps:**
   - Commuters face 15–25 minutes of transfer friction with no unified skywalk guidance or synchronized schedules between metro gates and bus/BRTS stops (e.g., Kalupur, Chandkheda, Ranip).
3. **Unintegrated Cost Penalty:**
   - Commuters pay minimum base fare multiple times on a single multimodal trip (e.g., paying ₹45 separately across 3 systems vs. ₹30 unified), making personal two-wheelers cheaper and faster.
4. **Inter-Agency Clearinghouse Deadlock:**
   - Transit agencies resist single ticketing integrations over fears of revenue leakage, delayed reconciliations, and unfair fare allocation without cryptographic proof and automated settlements.

---

## 💡 The Solution: Dual-Engine Architecture

### 1. Citizen Mobility Layer
- **Unified QR Pass:** A single dynamic multimodal QR ticket accepted across Metro, BRTS, and AMTS turnstiles and handheld validators.
- **Fair Fare Engine:** Automatic route optimization with integrated transfers (saving commuters up to 33% on base fares).
- **Inclusivity & Localization (દિવ્યાંગજન & ગુજરાતી):**
  - Native **Gujarati & English** bilingual interface.
  - Accessible **step-free routing** (tactile ground indicators, working elevators, and low-floor bus filtering).
  - Built-in concession subsidies for Senior Citizens (30%) and Divyangjan (50%).
- **Offline Resilience:** Cryptographically signed tickets with offline anti-passback caching and local IndexedDB outbox sync for underground metro stations with zero cell coverage.

### 2. Municipal Clearinghouse Engine
- **Automated Revenue Allocation:** Real-time distance-weighted split model (e.g., GMRC ~52%, Janmarg BRTS ~34%, AMTS ~14%).
- **Dynamic Feeder Incentive Slider:** Policy controls to incentivize feeder buses and first/last-mile connectivity.
- **Auditable Ledger:** Transparent transaction settlement records compliant with RBI National Common Mobility Card (NCMC) standards.

### 3. Smart Innovations & Hackathon Differentiators
- **🗺️ Live Animated Network Map:** Real-time animated visualization of Metro corridors, Janmarg routes, and AMTS feeder loops with live vehicle simulation.
- **🌿 Green Miles Carbon Loyalty:** Gamified eco-score tracking CO₂ emissions avoided per multimodal journey, redeemable for transit discounts.
- **🧠 AI Smart Departure Advisor:** Departure timer, crowd density predictions, and platform recommendation heuristics.
- **🛂 Gate AFC Inspector:** Live interactive turnstile validator simulation demonstrating HMAC-SHA256 signature verification, tamper detection, and anti-passback rule enforcement.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4
- **State Management:** React Context API (`TransitContext`)
- **Persistence & Cloud Sync:** Firebase Firestore + Local IndexedDB Fallback
- **Icons & UI:** Lucide React, Canvas / SVG animations, QR Code generator (`qrcode.react`)
- **Linting & Code Quality:** ESLint with React Hooks & React Refresh plugins

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js) or `pnpm` / `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/one-city-one-journey.git
   cd one-city-one-journey
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional / Firebase):**
   If connecting to a custom Firebase project, configure your credentials in `src/firebase.js` or create a `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *(Note: The application includes local fallback mechanisms to operate seamlessly even when offline or without active Firebase credentials).*

### Running the Application

- **Start Development Server:**
  ```bash
  npm run dev
  ```
  Open your browser and navigate to `http://localhost:5173`.

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

- **Run Linting:**
  ```bash
  npm run lint
  ```

---

## 🧭 Application Walkthrough

| Tab / View | Description |
| --- | --- |
| **Trip Planner** | Plan multimodal routes, filter by accessible paths, choose concessions, and book single QR passes. |
| **Settlement Clearinghouse** | View real-time revenue splits between GMRC, BRTS, and AMTS, tune feeder incentives, and audit ledgers. |
| **AFC Gate Inspector** | Test turnstile ticket verification, cryptographic HMAC validity, and offline anti-passback mechanisms. |
| **Smart Features** | Explore the live animated network map, Green Miles carbon tracker, and AI departure advisor. |
| **Pitch Deck** | Interactive grand jury presentation summarizing problem metrics, policy challenges, and system architecture. |

---

## 👨‍💻 Author

- **Darshan Parmar**
  - Website & Contact: [darshp.in](https://darshp.in)
