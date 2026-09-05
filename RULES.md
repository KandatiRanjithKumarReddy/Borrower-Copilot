# Financial Rules, Thresholds & Assumptions (RULES.md)

This document explains every single financial rule, calculation, threshold, and assumption used in Borrower Copilot. 

The core idea behind this app is simple:  
**What a bank is willing to lend you is almost never what you can safely afford to borrow.**

Banks want to maximize the loan size and earn interest. Borrower Copilot works backwards from the borrower's actual household budget to make sure they never take on a loan that could push them into default or financial distress.

---

## 1. How We Calculate "Sustainable Income"

Most bank loan calculators take whatever gross salary or turnover you tell them and assume you will earn that exact amount every single month for the next 5 years. In the real world, bonuses get cut, gig workers have slow weeks, and shopkeepers have lean seasons.

We calculate a conservative **Sustainable Monthly Income** based on how the borrower earns:

| What | Value / Formula | Why | Source |
| :--- | :--- | :--- | :--- |
| **Salaried: Variable Pay Haircut** | Fixed Base + (Variable Pay × 50%) | Companies cut or delay bonuses during downturns. If you take an EMI based on an expected year-end bonus, you risk defaulting if the bonus falls short. We only count half of variable pay. | Standard conservative financial planning |
| **Self-Employed: With Tax Returns (ITR)** | (60% × Monthly ITR) + (25% × Typical Cash) + (15% × Lowest Month Cash) | Small business owners often report lower income on tax returns to save tax, but have real cash turnover. We can't trust 100% of unverified cash, but ignoring it completely is unfair. This blend gives majority weight to official tax records while recognizing real cash flow and accounting for lean months. | Common Indian MSME underwriting practice |
| **Self-Employed: Without Tax Returns** | (50% × Typical Cash) + (50% × Lowest Month Cash) | Without any tax filings or audited papers, income is unverified. We take an equal average of a normal month and a bad month so the borrower doesn't commit to payments they can only afford during festival peaks. | Prudent micro-business lending norms |
| **Informal / Gig Workers** | (60% × Lowest Month) + (40% × Typical Month) | Delivery riders and drivers face platform algorithm changes, bad weather, vehicle breakdowns, and sick days. Giving 60% weight to their lowest-earning month ensures they can still pay their EMI during a slump. | Microfinance risk management principle |
| **Default Lean Month (if not entered)** | Typical Cash × 60% for self-employed; Typical × 70% for gig workers | If a user doesn't know their exact lowest month, we assume earnings drop by 40% in a bad month for business owners, and 30% for gig workers based on typical seasonal swings in India. | Field surveys on informal sector earnings |

---

## 2. Fixed Obligation to Income Ratio (FOIR) Limits

FOIR is the percentage of your monthly income that goes toward paying loan EMIs. Banks often push this up to 60% or 65% for everyone. We use tiered limits because lower-income households spend a much higher percentage of their earnings on basic necessities like food, rent, and school fees.

| What | Value / Formula | Why | Source |
| :--- | :--- | :--- | :--- |
| **Salaried: Under ₹50,000/month** | **50% maximum** | A family earning under ₹50k has very little wiggle room. If more than half goes to debt, one medical bill will cause a missed payment. | RBI retail lending safety guidelines |
| **Salaried: ₹50,000 to ₹1,00,000/month** | **55% maximum** | Moderate income gives enough cushion to comfortably service up to 55% in debt obligations while handling normal living costs. | Standard retail banking benchmark |
| **Salaried: Above ₹1,00,000/month** | **60% maximum** | Higher earners have substantial disposable income left over even after 50–60% debt payments. | Indian private bank policy (HDFC / ICICI) |
| **Self-Employed: Under ₹50,000/month** | **40% maximum** | Small business owners must reinvest cash back into buying inventory and paying daily business expenses. High debt will quickly choke the business. | Priority sector MSME lending norms |
| **Self-Employed: ₹50,000/month or more** | **50% maximum** | Established businesses with healthy cash flow can service higher debt, but still need a wider safety margin than salaried workers. | Commercial bank MSME policy |
| **Informal / Gig Workers** | **35% maximum** (all income levels) | Gig workers have no paid sick leave, no employer health insurance, and no provident fund. Keeping debt under 35% of income prevents debt spirals. | Fair lending & consumer protection standards |

---

## 3. How We Find Your "Safe EMI"

A loan might look affordable on paper under the FOIR percentage rule, but if you live in a high-rent city like Bengaluru or Mumbai, your actual bank balance at the end of the month might be almost zero.

That is why we calculate **two separate capacities** and take whichever is **lower**:

1. **FOIR Limit:** `(Sustainable Income × FOIR %) - Existing EMIs`
2. **Cash-Flow Limit:** `Sustainable Income - Rent - Groceries & Living Costs - Existing EMIs - (10% Rainy-Day Buffer)`

| What | Value / Formula | Why | Source |
| :--- | :--- | :--- | :--- |
| **Existing Fixed Obligations** | Existing EMIs + House Rent + Household Living Expenses | Money already committed to shelter, food, utilities, and current loans cannot be used to pay a new lender. | Basic household cash accounting |
| **10% Rainy-Day Emergency Buffer** | 10% of Sustainable Monthly Income | Life happens—bike repairs, doctor visits, family emergencies. If you commit 100% of your spare cash to a loan, the first small emergency will make you bounce an EMI. | Certified Financial Planner (CFP) rule of thumb |
| **Borrower Safe EMI Ceiling** | **Minimum of (FOIR Limit, Cash-Flow Limit)** | If your FOIR allows an EMI of ₹25,000, but your high rent leaves you with only ₹12,000 in real spare cash, your safe limit is ₹12,000. We never let the percentage rule blind us to real cash shortages. | **Borrower Copilot core safety rule** |

---

## 4. Fair Interest Rate Ranges by Loan Type

Lenders quote wide interest rate ranges in their advertisements (e.g., "Personal loans from 10.5%"). But what should *you* actually expect based on what you are borrowing?

Here are our starting baseline rate bands reflecting the Indian market:

| What | Base Range | Why | Source |
| :--- | :--- | :--- | :--- |
| **Home Loan** | **8.50% – 9.75%** | Lowest risk for banks. The loan is secured by a home, usually repo-rate linked, and spread over 15–30 years. | Current SBI / HDFC home loan card rates |
| **Loan Against Property (LAP)** | **9.00% – 12.00%** | Secured by an existing house or commercial property. Slightly higher rate than a home purchase because funds can be used for any purpose. | Major NBFC & private bank mortgage rates |
| **Personal Loan** | **10.50% – 24.00%** | Completely unsecured. Prime salaried employees get 10.5%–13%, while smaller NBFCs charge 18%–24% for riskier profiles. | RBI retail lending data & bank rate sheets |
| **Gold Loan** | **9.50% – 14.00%** | Backed by physical gold held in a bank vault. Quick recovery for the lender means relatively low rates. | Muthoot / Manappuram / PSU bank rates |
| **Two-Wheeler Loan** | **11.00% – 18.00%** | Vehicles depreciate quickly and repossession is costly for the lender, so rates are higher than car loans. | Bajaj Auto Finance / TVS Credit / Hero Fincorp |
| **Business Loan (Unsecured)** | **13.00% – 22.00%** | High-risk lending to small businesses without property collateral. | Lendingkart / Tata Capital / Bajaj Finserv |
| **Other Consumer Loans** | **12.00% – 24.00%** | General consumer credit fallback. | Retail lending industry average |

---

## 5. Risk Adjustments (Why Your Rate Moves Up or Down)

Starting from the base band, we adjust the fair rate up or down based on the borrower's actual track record.

| What | Adjustment | Why | Source |
| :--- | :--- | :--- | :--- |
| **Credit Score 780 or higher (Excellent)** | **-1.0% Min / -2.0% Max** | Borrowers with 780+ CIBIL have almost zero default history. Banks compete hard for them and offer their best discounted rates. | TransUnion CIBIL risk tiers |
| **Credit Score 720 to 779 (Good)** | **-0.5% Min / -1.0% Max** | Solid repayment track record. Eligible for normal bank rack rates without extra penalties. | Standard credit bureau tiering |
| **Credit Score 650 to 719 (Fair)** | **+0.5% Min / +0.5% Max** | Average profile. Mainstream banks might add a small margin, or the borrower may need to use an NBFC. | Retail bank credit grids |
| **Credit Score below 650 (Poor)** | **+2.0% Min / +4.0% Max** | High probability of missed payments. Only high-risk lenders will approve, and they will charge a high risk premium. | Subprime lending rates |
| **Credit Score Unknown** | **+1.0% Min / +3.0% Max** (widens range) | **We never assume score is 0.** New-to-credit borrowers simply lack history. We widen the range to show that offers will vary heavily depending on the lender. | Fair lending guidelines for thin-file borrowers |
| **Self-Employed Borrower** | **+0.5% Min / +1.0% Max** | Business income fluctuates with the market, so lenders price in an extra risk margin compared to fixed-salary workers. | Bank risk-weight rules |
| **Informal / Gig Worker** | **+1.0% Min / +2.0% Max** | Harder to verify income through salary slips or Form 16, which pushes borrowers toward fintechs and micro-lenders with higher rates. | Digital lending risk models |
| **Income Highly Variable** | **+0.5% Min / +1.5% Max** | Large swings between good and bad months increase the chance of missing an EMI on a slow month. | Underwriting cash-flow variance checks |
| **Long Job/Business Vintage ($\ge$ 5 Years)** | **-0.25% Min / -0.50% Max** | Staying with an employer or running the same shop for 5+ years proves stability and reliability. | Bank employment verification rules |
| **New Job/Business (< 1 Year)** | **+0.5% Min / +1.0% Max** | People during probation or new business startups have higher early failure rates. | Underwriting policy rule |
| **Recent Bounced EMI / Cheque** | **+1.0% Min / +2.0% Max** | A payment bounce in the last 6 months shows up on bureau reports and immediately triggers lender suspicion. | Credit bureau bounce tracking (DPD) |
| **Multiple High-Cost App Loans ($\ge$ 2)** | **+0.5% Min / +1.5% Max** | Borrowing from instant loan apps usually means a person is short on cash and juggling debts. | RBI digital lending risk study |
| **Absolute Hard Ceiling** | **36.0% p.a. Maximum** | No retail borrower should ever accept an interest rate above 36%. Beyond this, the debt is predatory. | RBI fair practices code |

---

## 6. Upfront Fees, 18% GST & The True APR

Banks advertise an interest rate like "12%", but they deduct processing fees from your loan before transferring the money to your account. 

For example, on a ₹10,00,000 personal loan with a 2% fee:
- Fee: ₹20,000
- 18% GST on fee: ₹3,600
- Total deducted: ₹23,600
- You only receive **₹9,76,400** in your bank account, but you pay interest and EMIs on the full **₹10,00,000**!

| What | Value / Formula | Why | Source |
| :--- | :--- | :--- | :--- |
| **Home Loan Processing Fee** | 0.50% of loan | Covers property legal verification and valuation charges. | Standard bank fee schedules |
| **LAP & Gold Loan Processing Fee** | 1.00% of loan | Covers property inspection or gold assaying costs. | Standard NBFC fee schedules |
| **Two-Wheeler Processing Fee** | 1.50% of loan | Covers documentation and RTO vehicle hypothecation charges. | Auto finance fee sheets |
| **Personal & Business Loan Fee** | 2.00% of loan | Administrative and underwriting costs for unsecured credit. | NBFC & digital lender schedules |
| **Statutory GST** | 18% on the processing fee | Mandatory government tax on all banking financial services in India. | Government of India GST Council |
| **True Annual Percentage Rate (APR)** | Solved using Newton-Raphson iteration so that: <br/>`Net Cash Received = Sum of discounted EMIs` | APR tells you the **real** annualized cost of borrowing by accounting for the fees taken upfront. We calculate this mathematically instead of hiding it. | RBI Digital Lending Guidelines (2022) |

---

## 7. The Gap: Lender Limit vs Borrower Safe Limit

This is the eye-opener for most borrowers:

| What | How It Works | Why Banks Do This |
| :--- | :--- | :--- |
| **Lender-Indicative Amount** | The bank takes your gross income, ignores your rent and living expenses, assumes a generous 55%–65% FOIR, and calculates the biggest loan they can legally sell you. | Bank loan officers have sales targets. Their job is to disburse as much volume as their credit policy allows. |
| **Borrower-Safe Amount** | We take your sustainable income, subtract your actual rent, living costs, and a 10% rainy-day cushion, and calculate the loan that matches your real cash surplus. | Our job is to protect your household from defaulting or going broke. |

---

## 8. Stress Testing (Can You Survive a Shock?)

Loans last 3 to 10 years. In that time, something will probably go wrong at least once. We test whether the loan still works under stress:

| What | Stress Condition | Why We Test This |
| :--- | :--- | :--- |
| **Income Shock (-15%)** | We recalculate your monthly budget assuming your income drops by 15% overnight (due to salary cuts, illness, or lost gig shifts). | If an income drop makes your total expenses exceed your earnings, you are at risk of defaulting. |
| **Rate Shock (+2.0% / +200 bps)** | For floating-rate loans (like Home Loans and LAP), we test what happens if the RBI hikes interest rates by 2.0%. | Between 2022 and 2023, the RBI raised repo rates by 2.50%. Floating rate borrowers saw their EMIs jump significantly. We ensure you can absorb a 2% rate spike. |
| **Pass / Fail Rule** | If monthly cash surplus is $> 0$ during the shock: **PASS**.<br/>If monthly cash surplus is $< 0$: **FAIL**. | If you are running a negative cash balance during a shock, you will be forced to borrow from credit cards or sell assets to survive. |

---

## 9. Final Decision Rules (How the Engine Decides)

Borrower Copilot gives one of three clear verdicts:

| Verdict | When It Triggers | What It Means for the Borrower |
| :---: | :--- | :--- |
| **`DONT_BORROW`** | • Safe EMI capacity is ₹0.<br/>• Zero reported income.<br/>• Recent bounced payment **AND** 2+ high-cost instant app loans.<br/>• Existing loan EMIs already eat up $> 65\%$ of income.<br/>• Requested EMI is more than double the safe EMI. | **Stop right now.** Taking any new loan will push you into active default. Focus on cutting expenses or clearing existing debts before borrowing anything new. |
| **`BORROW_LESS`** | • Requested loan amount is higher than your safe limit.<br/>• Requested EMI is $> 15\%$ above your safe monthly ceiling.<br/>• New loan would push your total debt above your safe FOIR limit. | You can afford to borrow, but **not the amount you asked for**. Scale down to the safe number we calculate so your monthly budget stays comfortable. |
| **`BORROW`** | • Requested amount is within your safe borrowing capacity.<br/>• Requested EMI is comfortably below your monthly safe ceiling.<br/>• Total debt remains within safe FOIR limits.<br/>• Emergency savings and cash flow look healthy. | **Green light.** Your finances can comfortably support this loan without sacrificing your living standards or emergency savings. |

---

## 10. Intelligent Product Switch: Suggesting Secured Loans

Many small business owners apply for expensive unsecured personal loans simply because banks market them aggressively.

| What | Trigger Condition | Why We Suggest This |
| :--- | :--- | :--- |
| **Switch to Loan Against Property (LAP)** | Borrower owns property (like a shop or house), is asking for $\ge ₹5,00,000$, and the loan is $\le 65\%$ of the property's market value. | Unsecured personal loans charge **12% to 24%**. A Loan Against Property charges **9% to 12%**. On a ₹15 Lakh loan, switching to a secured loan can save ₹3 Lakh to ₹5 Lakh in interest and cut the monthly EMI substantially. |

---

## 11. Confidence Ratings (No False Precision)

We assign an honest confidence rating to our output:

- **HIGH:** Known credit score (700+), stable salaried job or 5+ years in business, regular income. Our estimates are very accurate.
- **MEDIUM:** Unknown credit score, self-employed with ITR, or moderate seasonal swings. Core math is solid, but bank quotes will have wider variance.
- **LOW:** Gig/informal worker, recent bounced payments, multiple payday app loans, or no emergency savings. High financial volatility means numbers can shift quickly.
