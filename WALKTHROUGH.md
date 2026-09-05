# 5-Minute Walkthrough (WALKTHROUGH.md)

Hi! This document is a straightforward walkthrough of what I built for the Lokta Borrower Copilot challenge, how the math and decision logic work under the hood, what trade-offs I made to stay within the 12–16 hour timebox, and what I would build next.

---

## 1. What I Built

Most loan calculators on the internet are built for banks. You type in your salary and desired loan, and they tell you: *"Congratulations, you qualify for ₹20 Lakh!"* They never ask what you pay in rent, how many children you support, or whether your income drops during monsoon season.

I built **Borrower Copilot** to sit on the borrower's side of the table.

### The Key Parts of the Application:
1. **Adaptive 5-Step Diagnostic:**
   - Instead of showing a massive, confusing 30-field form, the app asks questions in logical steps.
   - It adapts based on how you earn:
     - If you are **Salaried**, it asks about your bonus percentage and company stability.
     - If you are **Self-Employed**, it asks for your audited ITR filings, lean-month cash flow, and property collateral.
     - If you are an **Informal/Gig Worker**, it asks about bad-month earnings, multiple platform apps, and payday debt.
   - It never asks for sensitive personal information like your name, phone number, PAN, or Aadhaar.

2. **Standalone Financial Engine (`src/engine/`):**
   - Built as pure, independent TypeScript functions with zero UI code mixed in.
   - Fully deterministic: given the same inputs, it always produces the exact same verified outputs.
   - Calculates real sustainable income, safe EMI ceilings, fair interest rate ranges, all-inclusive APR (including processing fees and 18% GST), stress tests, and final recommendations.

3. **Side-by-Side Reality Check:**
   - Visually compares **What the Bank Will Offer** vs **What You Can Safely Afford**.
   - Directly exposes when a lender's loan offer is dangerously larger than what your household budget can actually handle.

4. **Actionable Negotiation Card:**
   - A clean, printable single-screen card that borrowers can take directly into a bank meeting or dealership.
   - Gives them clear target numbers and exact talking points (e.g., *"My EMI ceiling is ₹12,800"*, *"Give me the all-in APR with GST in writing"*).

5. **Instant Demo Personas:**
   - At the top of the app, one-click buttons load the three test borrowers (**Priya**, **Ravi**, and **Anita**) so anyone can test the system in seconds without typing.

---

## 2. How the Decision Logic Works

Here is how the calculation flows from raw input to final advice:

```text
[Borrower Inputs]
       │
       ▼
1. Calculate Sustainable Income (cut bonuses by 50%, blend ITR with cash)
       │
       ▼
2. Find Safe EMI Ceiling = min(FOIR Income Limit, Real Cash Left After Bills)
   * Deducts rent, living costs, existing loans, and a 10% emergency cushion
       │
       ▼
3. Determine Fair Rate Range (Product Base Rate + Credit Score & Stability Spreads)
       │
       ▼
4. Solve True APR (Accounts for processing fees + 18% GST using Newton-Raphson)
       │
       ▼
5. Calculate Loan Amounts (Lender Limit vs Borrower-Safe Limit)
       │
       ▼
6. Run Stress Test (-15% income shock or +2% interest rate spike)
       │
       ▼
7. Generate Final Verdict (BORROW / BORROW LESS / DON'T BORROW)
       │
       ▼
8. Check for Smart Switches (e.g., suggest Loan Against Property if collateral exists)
       │
       ▼
9. Output Printable Negotiation Card
```

### Why the Math is Different From a Bank's Math:
- **Banks look at gross income; we look at disposable cash:**  
  If a software engineer in Bengaluru makes ₹1.10 Lakh but pays ₹28,000 in rent and ₹20,000 in living costs, her actual spare cash is ₹37,000—not the ₹66,000 a bank calculator claims she can pay.
- **We protect against bad months:**  
  For delivery riders and shopkeepers, we give heavier weight to their lowest-earning month. A loan must be repayable during a bad month, not just during a festival peak.
- **We account for hidden loan costs:**  
  A 12% loan with a 2% fee and 18% GST is not 12%. The borrower receives less cash on day one. Our engine solves the real APR so the borrower sees the true annualized cost.

---

## 3. What I Prioritised

With 12–16 hours to build this, I focused on high-impact financial honesty over decorative features:

1. **Honest, Uncompromising Verdicts:**
   - Many financial apps try to be polite and approve everyone. In Borrower Copilot, if a borrower is in trouble (like Anita, who already has 3 instant loan debts and a recent bounce), the engine clearly says **`DON'T BORROW`** and sets her safe limit to **₹0**. That is true consumer protection.
2. **Plain-English Explanations:**
   - Every single number on the screen has an expandable explanation. The user is never left wondering *"Where did ₹12,800 come from?"*
3. **Smart Product Suggestions:**
   - When Ravi asks for a ₹15 Lakh personal loan at 18%, but owns a ₹45 Lakh commercial shop, the engine notices this and tells him: *"Don't take a personal loan. Take a Loan Against Property (LAP) at 10%. You will save over ₹4 Lakh in interest."*
4. **100% Client-Side Privacy:**
   - All calculations run locally in the user's browser. No database, no server, no credit bureau tracking inquiries, and zero personal data collected.

---

## 4. What I Cut Due to the 12–16 Hour Timebox

To ensure the core financial engine and user experience were rock-solid, I deliberately cut four things:

1. **Account Aggregator (AA) Automated Bank Fetch:**
   - *Idea:* Let users log in via OTP with an RBI Account Aggregator (like Setu or Sahamati) to auto-pull 12 months of bank statements.
   - *Why cut:* Requires official NBFC licenses, sandbox API keys, and OTP flows that cannot run in a local code review.
2. **Client-Side PDF Bank Statement Parser:**
   - *Idea:* Allow users to drag-and-drop their PDF bank statements to auto-detect salary credits and bounces.
   - *Why cut:* PDF statement formats differ across 40+ Indian banks. Building reliable table parsers would have consumed the entire timebox.
3. **Live Web Scrapers for Bank Interest Rates:**
   - *Idea:* Scrape SBI, HDFC, and ICICI websites daily for exact rate changes.
   - *Why cut:* Web scrapers break easily and get blocked by CAPTCHAs. Instead, I calibrated realistic rate bands reflecting current market averages.
4. **City-by-City Cost of Living Sliders:**
   - *Idea:* Automatically guess living costs based on the user's PIN code.
   - *Why cut:* Asking the user directly for their actual rent and grocery costs is much more accurate than a statistical guess.

---

## 5. What I Would Build Next

If I were taking this to production as a real startup product, here is what I would build next:

1. **Interactive Prepayment & Tenure Slider:**
   - A visual simulator showing borrowers: *"If you pay an extra ₹1,500 every month, your 5-year loan finishes in 3.5 years, and you save ₹85,000 in interest."*
2. **Sanction Letter "Fine Print" Scanner:**
   - A tool where a borrower uploads the loan quotation or sanction letter they received from a bank. The engine highlights hidden insurance bundles, processing fee markups, and catches flat-rate interest tricks.
3. **Multi-Language Voice Assistance:**
   - Support for Hindi, Kannada, Tamil, and Marathi. Delivery drivers and small shopkeepers often prefer listening to explanations in their mother tongue rather than reading financial English.
4. **One-Click PDF Export:**
   - A button to download the Negotiation Card as an official, neatly-formatted PDF to keep on your smartphone before walking into a bank branch.

---

## 6. How to Run the App Locally

```bash
# 1. Clone the repository
git clone https://github.com/KandatiRanjithKumarReddy/Borrower-Copilot.git

# 2. Open the project folder
cd Lokta

# 3. Install dependencies
npm install

# 4. Start the local server
npm run dev
```

Open `http://localhost:5173/` in your browser. Click any of the three persona buttons at the top of the home page (**Priya**, **Ravi**, or **Anita**) to run a full diagnostic instantly.
