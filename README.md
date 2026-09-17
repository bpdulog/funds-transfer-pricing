# Funds Transfer Pricing (FTP) — Interactive Explainer

> **Live Application**: [https://bpdulog.github.io/funds-transfer-pricing/](https://bpdulog.github.io/funds-transfer-pricing/)  
> **Author**: Bryan Dulog ([Portfolio](https://bpdulog.github.io) &bull; [LinkedIn](https://www.linkedin.com/in/bryandulog/) &bull; [GitHub](https://github.com/bpdulog))

An interactive visual explainer demonstrating how modern commercial banks price loans, reward deposit branches, and isolate interest rate duration risk using **Funds Transfer Pricing (FTP)**.

---

## 🏛️ What is Funds Transfer Pricing (FTP)?

Most people assume banks operate on a simple principle:
$$\text{Take deposits at 1\% and lend at 4\% to pocket the 3\% spread.}$$

While intuitive, **this direct customer-to-customer lending model is fatally flawed**.

If a bank funds a **30-year fixed loan at 4.00%** using **overnight checking accounts at 1.00%**, what happens when the Federal Reserve hikes rates by +400 bps?
- Deposit costs immediately rise to 4.00%+ (or depositors withdraw funds).
- The 30-year loan is permanently locked at 4.00%.
- Net Interest Margin (NIM) collapses to zero or turns negative.
- The market value of fixed-rate assets plummets, wiping out equity capital (as seen during the **March 2023 Silicon Valley Bank collapse**).

---

## ⚙️ The Solution: Central Treasury as an Internal Clearinghouse

Under a modern **Matched-Maturity Funds Transfer Pricing (MMTP)** framework, the bank splits itself into three distinct economic units:

```
[Retail Depositor]
       │ (1.25% Interest Paid)
       ▼
[Retail Branch Desk]  ───────────────► Sells Liquidity at 4.10% FTP Rate
                                             │  (Earns +2.85% Franchise Spread)
                                             ▼
                                  [ Central Treasury (ALM) ]
                                  • Internal Clearinghouse
                                  • Matches Tenors & Yield Curves
                                  • Hedges Duration Gap via Swaps
                                             │
                                             ▼
[Commercial Lending Desk] ◄────────── Buys Matched Funding at 4.60% FTP Rate
       │  (Earns +1.90% Pure Credit Spread)
       ▼
[Commercial Borrower]
       (Pays 6.50% Loan Rate)
```

1. **Retail Branch Desk (Liability Unit)**:
   - Gathers sticky, low-cost customer deposits.
   - Sells wholesale liquidity to Central Treasury at the market transfer rate (e.g. 4.10%).
   - Earns a **Franchise Spread** ($4.10\% - 1.25\% = +2.85\%$).
   - Completely insulated from asset credit risk.

2. **Commercial Lending Desk (Asset Unit)**:
   - Underwrites corporate borrowers, analyzes covenants, and assesses default risk.
   - Buys matched-term funding from Central Treasury at the market transfer rate (e.g. 4.60%).
   - Earns a **Pure Credit Spread** ($6.50\% - 4.60\% = +1.90\%$).
   - Completely insulated from interest rate duration risk.

3. **Central Treasury / ALM Unit (Internal Clearinghouse)**:
   - Absorbs the term mismatch between assets and liabilities ($4.60\% - 4.10\% = +0.50\%$).
   - Actively hedges the duration gap in capital markets using interest rate swaps (e.g., payer swaps) and Treasury securities.

---

## 🚀 Key Interactive Features

- **Interactive Internal Money Flow Topology**: Click on any participant (Depositor, Branch Desk, Central Treasury, Lending Desk, Borrower) to inspect its exact mandate, risk profile, and margin formula.
- **Matched-Maturity Live Workbench**: Sliders for Loan Principal, Customer Rate, Loan Tenor, Deposit Amount, Depositor Rate, Behavioral Tenor, and Deposit Beta.
- **Real-Time Margin Waterfall**: Visual decomposition showing exactly how customer spread is divided among credit underwriting, branch franchise value, and term transformation.
- **Dynamic Yield Curve Canvas**: High-DPI canvas rendering benchmark term structures (Normal, Inverted, Flat) with live marker pins for asset and liability transfer pricing points.
- **Interest Rate Shock Stress Simulator ($\pm 300\text{ bps}$)**: Observe in real time why an unhedged pooled bank suffers margin compression, while an FTP-enabled bank keeps commercial desks protected and hedges duration in Treasury.
- **Yield Curve Regimes & NII Sensitivity Matrix**: Interactive 5-regime switcher (Normal Steep, Flat, Inverted Tightening, Bear Steepener, Bull Steepener) demonstrating how term-structure slope dictates bank Net Interest Income (NII) distribution across credit underwriting, retail liquidity value, and maturity transformation.
- **Case Studies & Deep Dive**: Plain-English explanations of Non-Maturity Deposits (NMD behavioral replication), Liquidity Premiums (LP), and the SVB post-mortem.

---

## 💻 Tech Stack & Design System

- **Zero Build Dependencies**: Pure HTML5, modern CSS3, and vanilla ES6 JavaScript. Runs natively on GitHub Pages with `.nojekyll`.
- **Design Philosophy**: Neo-financial futurism palette:
  - Deep obsidian background (`#0d1110`) with subtle 72px hairline grid overlay.
  - Frosted glass cards with `backdrop-filter: blur(22px)`.
  - Restrained antique gold (`#d8b45f`) and luminous cyan/teal (`#2dd4bf`) accents.
  - Classic editorial serif typography (`Georgia`, `Newsreader`) paired with high-legibility sans-serif (`Inter`).
  - High-DPI Retina canvas for term-structure curve visualizations.

---

## 🛠️ Local Development

Clone the repository and open `index.html` in any modern browser:

```bash
git clone https://github.com/bpdulog/funds-transfer-pricing.git
cd funds-transfer-pricing
# Open in browser directly:
open index.html # On macOS
start index.html # On Windows
```

---

## 📄 License

MIT License &bull; Copyright (c) 2026 Bryan Dulog
