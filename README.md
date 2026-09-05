<div align="center">

# 🛡️ Borrower Copilot

### *Know what you can afford before you negotiate.*

A borrower-first personal financial self-assessment engine and negotiation card generator designed for Indian retail borrowers.

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Privacy: 100% Client--Side](https://img.shields.io/badge/Privacy-100%25_Client--Side-10B981?style=for-the-badge&logo=shield&logoColor=white)](#-zero-knowledge-privacy)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

[Key Features](#-key-features) •
[Core Thesis](#-core-thesis) •
[System Architecture](#-system-architecture) •
[Tech Stack](#-tech-stack) •
[Quick Start](#-quick-start) •
[Financial Engine](#-financial-rules-engine) •
[Demo Personas](#-built-in-test-personas) •
[Privacy](#-zero-knowledge-privacy)

<br/>

</div>

---

## 💡 Core Thesis

```
┌────────────────────────────────────────────────────────────────────────┐
│               Lender Eligibility  ≠  Borrower Affordability            │
└────────────────────────────────────────────────────────────────────────┘
```

Standard bank calculators answer: **"What is the maximum amount we can extract from this borrower?"**  
**Borrower Copilot** answers: **"What is the maximum amount this borrower can repay without risking financial distress?"**

It sits between the borrower and the lender, arming the consumer with unvarnished mathematical truth, fair rate bands, and an actionable **Negotiation Card** before they sign an agreement.

---

## 🎯 The Four Critical Questions

| # | Question | Decision-Support Output | Engine Derivation |
|:---:|:---|:---|:---|
| **1** | **Should I borrow at all?** | `BORROW` · `BORROW LESS` · `DON'T BORROW` | Multi-variable decision matrix factoring FOIR, stress buffers, bounce history & high-cost debt |
| **2** | **How much am I really eligible for?** | **Lender-Indicative** vs **Borrower-Safe** Amount | Exposes the dangerous gap between what a bank will sanction vs what income supports |
| **3** | **What is a fair interest rate?** | **Fair Rate Range (Min–Max)** + **True APR** | Product-indexed base rates with risk adjustments; APR solved via Newton-Raphson iteration |
| **4** | **What EMI should I commit to?** | **EMI Ceiling** + **Tenure Trade-Off Matrix** | Constrained by minimum of FOIR threshold and uncommitted monthly cash surplus |

---

## ✨ Key Features

- **⚡ Adaptive 5-Step Diagnostic** — Contextual question flow dynamically tailoring income and stability questions for *Salaried*, *Self-Employed*, and *Informal/Gig* workers.
- **🛡️ Honest Decision Engine** — Built to protect borrowers. The engine decisively outputs **`DON'T BORROW`** when debt-traps or cash-flow insolvency are detected.
- **📊 True Dual-Amount Visualization** — Side-by-side comparative bar revealing when a lender's sanctioned offer overshoots the borrower's safe repayment capacity.
- **🏷️ Multi-Factor Fair Rate Band** — Evaluates CIBIL/Experian credit tiers, job stability, income variance, and penalizes predatory APRs.
- **🔬 Mathematical APR Solver** — Numerical Newton-Raphson algorithm computing effective annual percentage rate accounting for processing fees and 18% GST.
- **🌪️ Dual-Shock Stress Testing** — Evaluates resilience under:
  - **Income Shock:** Immediate 15% reduction in net monthly earnings.
  - **Rate Shock:** +200 bps (+2.0%) interest spike for floating-rate loans.
- **🎴 Single-Screen Negotiation Card** — Clean, printer-friendly summary with 3–5 high-leverage talking points tailored to the borrower's exact profile.
- **🎯 Dynamic Confidence Scoring** — Transparent confidence indicator (`HIGH` / `MEDIUM` / `LOW`) based on input completeness and verified data points, avoiding misleading pseudo-precision scores.
- **💡 Plain-English Explainability** — Every single financial ratio and computation provides an expandable one-sentence breakdown of *how* and *why* it was derived.

---

## 🏛️ System Architecture

The project enforces a strict **unidirectional, headless financial engine** architecture: zero UI coupling, 100% deterministic pure functions.

```
                               ┌───────────────────────────┐
                               │   User Input / Personas   │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                      ┌─────────────────────────────────────────────┐
                      │             src/engine/index.ts             │
                      │             assessBorrower()                │
                      └──────────────────────┬──────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
┌─────────────┐   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐    ┌─────────────┐
│affordability│   │  interest   │     │loanCapacity │     │ stressTest  │    │ confidence  │
│  .ts        │   │   Rate.ts   │     │    .ts      │     │    .ts      │    │    .ts      │
├─────────────┤   ├─────────────┤     ├─────────────┤     ├─────────────┤    ├─────────────┤
│• Sustainable│   │• Product    │     │• Safe vs    │     │• -15% Income│    │• Data       │
│  Haircuts   │   │  Bands      │     │  Sanctioned │     │• +200 bps   │    │  Density    │
│• FOIR Tiers │   │• Risk Delta │     │• Inverse    │     │  Rate Shock │    │• Variance   │
│• Safe EMI   │   │• APR Solver │     │  Amortized  │     │• Resilience │    │  Scoring    │
└──────┬──────┘   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘    └──────┬──────┘
       │                 │                   │                   │                  │
       └─────────────────┴───────────────────┼───────────────────┴──────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │     recommendation.ts     │
                               │  Decision Tree Evaluation │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │      negotiation.ts       │
                               │   Actionable Card Data    │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │     React 19 UI Layer     │
                               │ ResultsPage & Card Render │
                               └───────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Core Framework** | `React 19` | Modern concurrent rendering, clean state management, zero bundle bloat |
| **Type Safety** | `TypeScript 5.7` (Strict) | Strict typing across the entire financial engine preventing calculation regressions |
| **Styling & Tokens** | `Tailwind CSS 4.0` | Next-gen high-performance CSS engine with curated semantic color palette |
| **Build Engine** | `Vite 6.0` | Sub-millisecond HMR and highly optimized production chunks |
| **Icons** | `Lucide React` | Consistent, accessible stroke-based icon system |
| **Typography** | `Inter` (Google Fonts) | Industry-standard tabular figures for precise financial figures |

---

## 📁 Directory Layout

```
Lokta/
├── index.html                   # HTML5 entry with meta SEO & Inter font CDN
├── package.json                 # Project dependencies and script declarations
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite configuration with React and Tailwind plugins
│
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # App state router (Landing ➔ Questionnaire ➔ Results)
    ├── index.css                # Tailwind design system tokens, themes, animations
    │
    ├── engine/                  # 🧠 Pure Financial Domain Engine (Zero React dependencies)
    │   ├── index.ts             # Master assessBorrower() pipeline orchestration
    │   ├── types.ts             # Strict domain schemas & calculation contracts
    │   ├── affordability.ts     # Sustainable income haircuts, FOIR bands, EMI ceilings
    │   ├── emi.ts               # Reducing-balance amortisation & inverse solvers
    │   ├── interestRate.ts      # Product baseline bands + risk matrix adjustments
    │   ├── apr.ts               # Newton-Raphson numerical APR convergence
    │   ├── loanCapacity.ts      # Lender sanction vs borrower affordable capacities
    │   ├── stressTest.ts        # Dual-shock vulnerability analysis
    │   ├── confidence.ts        # Score reliability assessment
    │   ├── recommendation.ts    # BORROW / BORROW_LESS / DONT_BORROW decision matrix
    │   └── negotiation.ts       # Tailored negotiation leverage points generator
    │
    ├── components/              # 🎨 UI Presentation Layer
    │   ├── LandingPage.tsx      # Hero, core value propositions, persona launchers
    │   ├── Questionnaire.tsx    # 5-stage adaptive diagnostic flow
    │   ├── ResultsPage.tsx      # Multi-widget dashboard with expandable explainers
    │   └── NegotiationCard.tsx  # Clean, printable single-screen card for bank meetings
    │
    └── utils/
        ├── formatters.ts        # Indian numbering (Lakh/Crore), currency & rate formatters
        └── personas.ts          # Calibrated reference profiles (Priya, Ravi, Anita)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js `18.0.0` or higher
- npm, pnpm, or yarn

```bash
# 1. Clone repository
git clone https://github.com/your-username/lokta.git

# 2. Navigate to directory
cd Lokta

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173/` in under 3 seconds.

### Build for Production
```bash
# Type-check and compile optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Built-in Test Personas

The application includes 3 instant-load borrower personas reflecting realistic Indian borrowing scenarios:

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Persona   Profile                        Loan Requested     Outcome       Key Dynamic     │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ 👩 Priya   Salaried SWE (Bengaluru)       ₹8.0 Lakh          BORROW        Healthy FOIR,   │
│           ₹1,10,000/mo · CIBIL 760       (Personal/Wedding) (Safe: ₹8.0L) High buffer     │
│                                                                                           │
│ 👨 Ravi    Self-Employed (Mysuru)         ₹15.0 Lakh         BORROW LESS   ITR Haircut,    │
│           ₹90,000/mo Cash · CIBIL 690    (Business Exp.)    (Safe: ₹9.5L) Suggests LAP    │
│                                                                                           │
│ 🛵 Anita   Gig Delivery Worker (Hubballi) ₹1.5 Lakh          DON'T BORROW  Over-leveraged, │
│           ₹28,000/mo · 3 App Loans       (Two-Wheeler)      (Safe: ₹0)    Bounce flags    │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Financial Rules Engine

### 1. Sustainable Income Calculation
Instead of taking self-reported top-line income at face value, the engine applies sector-calibrated haircuts:
- **Salaried:** Fixed base (100%) + Variable/Bonus subjected to a **50% haircut**.
- **Self-Employed:** Blended sustainable baseline:
  $$\text{Income}_{\text{sustainable}} = (0.60 \times \text{ITR}) + (0.25 \times \text{Typical Cash}) + (0.15 \times \text{Lowest Month})$$
- **Informal / Gig:** Conservative stability weighting:
  $$\text{Income}_{\text{sustainable}} = (0.60 \times \text{Lowest Month}) + (0.40 \times \text{Typical Cash})$$

### 2. Tiered FOIR (Fixed Obligation to Income Ratio)
| Net Monthly Income | Salaried Max FOIR | Self-Employed Max FOIR | Gig / Informal Max FOIR |
|---|:---:|:---:|:---:|
| **< ₹25,000** | 35% | 30% | 25% |
| **₹25,000 – ₹50,000** | 40% | 35% | 30% |
| **₹50,000 – ₹1,00,000** | 50% | 45% | 35% |
| **> ₹1,00,000** | 55% | 50% | 40% |

$$\text{Safe EMI} = \min\Big(\big(\text{Sustainable Income} \times \text{FOIR}\big) - \text{Existing EMIs},\; \text{Uncommitted Surplus} \times 0.85\Big)$$

### 3. All-In APR Solver (Newton-Raphson)
True borrowing costs must reflect upfront loan origination fees and statutory taxes. The engine iteratively solves for the internal rate of return $r$ such that:

$$\text{Principal} - \text{Total Upfront Fees} = \sum_{t=1}^{n} \frac{\text{EMI}}{(1 + r)^t}$$

$$\text{APR} = r \times 12 \times 100$$

Where $\text{Total Upfront Fees} = (\text{Principal} \times \text{Processing Fee \%}) \times (1 + \text{GST 18\%})$.

---

## 🔒 Zero-Knowledge Privacy

Borrower Copilot is built on privacy-preserving principles:

- 🚫 **No Server, No Database** — 100% of runtime computation occurs within the user's browser runtime.
- 🚫 **Zero External API Calls** — No credit bureau pings (no soft or hard inquiries on your CIBIL/Experian file).
- 🚫 **No PII Collection** — Never asks for Name, Phone Number, Aadhaar, PAN, or Bank Account Credentials.
- 🚫 **Ephemeral Lifecycle** — Close the browser tab, and all in-memory diagnostic state is instantly purged.

---

## 🔮 What Could Be Built Next

- [ ] Direct bank rate-sheet API scraping for live comparison
- [ ] OCR bank statement parsing via client-side WebAssembly
- [ ] Multi-scenario side-by-side loan tenure simulation
- [ ] Direct PDF vector export for the Negotiation Card
- [ ] Localized regional cost-of-living index offsets (Tier 1 vs Tier 2/3)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with precision for Indian retail borrowers.</sub>
</div>
