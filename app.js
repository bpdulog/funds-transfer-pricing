/**
 * Funds Transfer Pricing (FTP) Interactive Explainer
 * Pure client-side financial engine & interactive visualization
 * By Bryan Dulog
 */

(function () {
  'use strict';

  // --- Yield Curve Benchmark Data (Tenor in years -> Rate %) ---
  const CURVE_MODELS = {
    normal: [
      { tenor: 0.083, label: '1M', rate: 3.50 },
      { tenor: 0.25,  label: '3M', rate: 3.70 },
      { tenor: 0.5,   label: '6M', rate: 3.90 },
      { tenor: 1.0,   label: '1Y', rate: 4.10 },
      { tenor: 2.0,   label: '2Y', rate: 4.25 },
      { tenor: 3.0,   label: '3Y', rate: 4.40 },
      { tenor: 5.0,   label: '5Y', rate: 4.60 },
      { tenor: 7.0,   label: '7Y', rate: 4.80 },
      { tenor: 10.0,  label: '10Y', rate: 5.00 },
      { tenor: 30.0,  label: '30Y', rate: 5.30 }
    ],
    inverted: [
      { tenor: 0.083, label: '1M', rate: 5.40 },
      { tenor: 0.25,  label: '3M', rate: 5.35 },
      { tenor: 0.5,   label: '6M', rate: 5.25 },
      { tenor: 1.0,   label: '1Y', rate: 5.00 },
      { tenor: 2.0,   label: '2Y', rate: 4.75 },
      { tenor: 3.0,   label: '3Y', rate: 4.55 },
      { tenor: 5.0,   label: '5Y', rate: 4.35 },
      { tenor: 7.0,   label: '7Y', rate: 4.25 },
      { tenor: 10.0,  label: '10Y', rate: 4.20 },
      { tenor: 30.0,  label: '30Y', rate: 4.30 }
    ],
    flat: [
      { tenor: 0.083, label: '1M', rate: 4.50 },
      { tenor: 0.25,  label: '3M', rate: 4.50 },
      { tenor: 0.5,   label: '6M', rate: 4.50 },
      { tenor: 1.0,   label: '1Y', rate: 4.50 },
      { tenor: 2.0,   label: '2Y', rate: 4.50 },
      { tenor: 3.0,   label: '3Y', rate: 4.50 },
      { tenor: 5.0,   label: '5Y', rate: 4.50 },
      { tenor: 7.0,   label: '7Y', rate: 4.50 },
      { tenor: 10.0,  label: '10Y', rate: 4.50 },
      { tenor: 30.0,  label: '30Y', rate: 4.50 }
    ]
  };

  // Node details metadata for interactive architecture drawer
  const NODE_DETAILS = {
    depositor: {
      title: 'Retail Depositor (Household / Small Business)',
      desc: 'Provides low-cost, insured liquidity to the bank in exchange for safety, checking services, and interest yield. Without FTP, their deposits are carelessly lumped into one pool.',
      formulaLabel: 'Depositor Return',
      formulaValue: 'Earns Contracted Deposit Rate (e.g. 1.25%)'
    },
    branch: {
      title: 'Retail Branch / Deposit Gathering Desk',
      desc: 'Invests capital into physical branches, mobile apps, and customer service to attract sticky deposits. In a modern FTP framework, the branch earns an internal FTP credit for every dollar brought in, transforming it from an unfair "cost center" into a high-margin profit center.',
      formulaLabel: 'Deposit Desk Margin',
      formulaValue: 'FTP Credit Rate (4.10%) − Depositor Rate (1.25%) = +2.85% Franchise Spread'
    },
    treasury: {
      title: 'Central Treasury & Asset-Liability Management (ALM)',
      desc: 'The internal bank of the bank. Buys wholesale liquidity from branches at matched market rates and lends to commercial loan desks. It centralizes all balance-sheet repricing gap duration risk and executes interest rate swaps to immunize bank capital.',
      formulaLabel: 'Treasury Repricing Margin',
      formulaValue: 'Loan FTP Rate (4.60%) − Deposit FTP Rate (4.10%) = +0.50% Term Transformation'
    },
    lending: {
      title: 'Commercial Lending Desk',
      desc: 'Underwrites corporate credit, structures covenants, and assesses default risk. Under FTP, the loan officer buys matched-maturity funding from Treasury at the risk-free market rate. If rates rise later, the loan desk suffers ZERO loss—their margin is locked.',
      formulaLabel: 'Lending Credit Margin',
      formulaValue: 'Customer Loan Rate (6.50%) − Loan FTP Rate (4.60%) = +1.90% Pure Credit Spread'
    },
    borrower: {
      title: 'Commercial Borrower',
      desc: 'Draws loan principal to finance commercial real estate, corporate expansion, or working capital. Pays fixed or floating coupon to the bank for the life of the loan.',
      formulaLabel: 'Borrower Obligation',
      formulaValue: 'Pays Contracted Loan Rate (e.g. 6.50%)'
    }
  };

  // State
  const state = {
    curvePreset: 'normal',
    loanAmt: 10000000,
    loanRate: 6.50,
    loanTenor: 5.0,
    depositAmt: 10000000,
    depositRate: 1.25,
    depositTenor: 1.0,
    depositBeta: 40,
    rateShock: 0,
    selectedNode: 'treasury'
  };

  // --- Interpolation Helper ---
  function interpolateRate(curveModel, tenor) {
    if (tenor <= curveModel[0].tenor) return curveModel[0].rate;
    if (tenor >= curveModel[curveModel.length - 1].tenor) return curveModel[curveModel.length - 1].rate;

    for (let i = 0; i < curveModel.length - 1; i++) {
      const p1 = curveModel[i];
      const p2 = curveModel[i + 1];
      if (tenor >= p1.tenor && tenor <= p2.tenor) {
        const ratio = (tenor - p1.tenor) / (p2.tenor - p1.tenor);
        return p1.rate + ratio * (p2.rate - p1.rate);
      }
    }
    return curveModel[0].rate;
  }

  // Format currency
  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format percentage
  function formatPct(pct, sign = false) {
    const s = sign && pct > 0 ? '+' : '';
    return `${s}${pct.toFixed(2)}%`;
  }

  // Format bps
  function formatBps(pct) {
    const bps = Math.round(pct * 100);
    const s = bps > 0 ? '+' : '';
    return `${s}${bps} bps`;
  }

  // --- DOM Elements ---
  const els = {
    // Preset buttons
    presetBtns: document.querySelectorAll('.preset-btn'),

    // Inputs
    inputLoanAmt: document.getElementById('inputLoanAmt'),
    valLoanAmt: document.getElementById('valLoanAmt'),
    inputLoanRate: document.getElementById('inputLoanRate'),
    valLoanRate: document.getElementById('valLoanRate'),
    selectLoanTenor: document.getElementById('selectLoanTenor'),
    valLoanTenor: document.getElementById('valLoanTenor'),

    inputDepositAmt: document.getElementById('inputDepositAmt'),
    valDepositAmt: document.getElementById('valDepositAmt'),
    inputDepositRate: document.getElementById('inputDepositRate'),
    valDepositRate: document.getElementById('valDepositRate'),
    selectDepositTenor: document.getElementById('selectDepositTenor'),
    valDepositTenor: document.getElementById('valDepositTenor'),
    inputDepositBeta: document.getElementById('inputDepositBeta'),
    valDepositBeta: document.getElementById('valDepositBeta'),

    inputShock: document.getElementById('inputShock'),
    valShock: document.getElementById('valShock'),

    // Flow diagram nodes & metrics
    flowNodes: document.querySelectorAll('.flow-node'),
    diagDepositAmt: document.getElementById('diagDepositAmt'),
    diagDepositRate: document.getElementById('diagDepositRate'),
    diagBranchCredit: document.getElementById('diagBranchCredit'),
    diagBranchSpread: document.getElementById('diagBranchSpread'),
    diagTreasuryLoanCost: document.getElementById('diagTreasuryLoanCost'),
    diagTreasurySpread: document.getElementById('diagTreasurySpread'),
    diagLendingCost: document.getElementById('diagLendingCost'),
    diagLendingSpread: document.getElementById('diagLendingSpread'),
    diagLoanAmt: document.getElementById('diagLoanAmt'),
    diagLoanRate: document.getElementById('diagLoanRate'),

    // Flow drawer
    flowDrawer: document.getElementById('flowDrawer'),
    drawerTitle: document.getElementById('drawerTitle'),
    drawerDesc: document.getElementById('drawerDesc'),
    drawerFormulaLabel: document.getElementById('drawerFormulaLabel'),
    drawerFormulaValue: document.getElementById('drawerFormulaValue'),

    // Metric Cards
    metricLendingSpread: document.getElementById('metricLendingSpread'),
    metricLendingDol: document.getElementById('metricLendingDol'),
    metricLendingBps: document.getElementById('metricLendingBps'),

    metricDepositSpread: document.getElementById('metricDepositSpread'),
    metricDepositDol: document.getElementById('metricDepositDol'),
    metricDepositBps: document.getElementById('metricDepositBps'),

    metricTreasurySpread: document.getElementById('metricTreasurySpread'),
    metricTreasuryDol: document.getElementById('metricTreasuryDol'),
    metricTreasuryBps: document.getElementById('metricTreasuryBps'),

    metricTotalSpread: document.getElementById('metricTotalSpread'),
    metricTotalDol: document.getElementById('metricTotalDol'),
    metricTotalBps: document.getElementById('metricTotalBps'),

    // Waterfall bar
    valTotalSpreadSum: document.getElementById('valTotalSpreadSum'),
    barLoan: document.getElementById('barLoan'),
    barDeposit: document.getElementById('barDeposit'),
    barTreasury: document.getElementById('barTreasury'),

    // Chart
    legendLoanRate: document.getElementById('legendLoanRate'),
    legendDepositRate: document.getElementById('legendDepositRate'),
    curveCanvas: document.getElementById('curveCanvas'),

    // Stress Test elements
    shockUnhedgedLoanRev: document.getElementById('shockUnhedgedLoanRev'),
    shockUnhedgedDepositCost: document.getElementById('shockUnhedgedDepositCost'),
    shockUnhedgedNim: document.getElementById('shockUnhedgedNim'),
    shockUnhedgedLendingImp: document.getElementById('shockUnhedgedLendingImp'),
    verdictUnhedged: document.getElementById('verdictUnhedged'),
    badgeUnhedged: document.getElementById('badgeUnhedged'),

    shockHedgedLendingSpread: document.getElementById('shockHedgedLendingSpread'),
    shockHedgedDepositSpread: document.getElementById('shockHedgedDepositSpread'),
    shockHedgedTreasuryImpact: document.getElementById('shockHedgedTreasuryImpact'),
    verdictHedged: document.getElementById('verdictHedged'),

    // Accordion
    accordions: document.querySelectorAll('.accordion-item')
  };

  // --- Main Calculation & Render Function ---
  function updateAll() {
    const curve = CURVE_MODELS[state.curvePreset];

    // Benchmark FTP Rates from curve
    const loanFtpRate = interpolateRate(curve, state.loanTenor);
    const depositFtpRate = interpolateRate(curve, state.depositTenor);

    // Spreads
    const lendingSpread = state.loanRate - loanFtpRate;
    const depositSpread = depositFtpRate - state.depositRate;
    const treasurySpread = loanFtpRate - depositFtpRate;

    // Financial totals
    const lendingDol = state.loanAmt * (lendingSpread / 100);
    const depositDol = state.depositAmt * (depositSpread / 100);
    const treasuryDol = (state.loanAmt * (loanFtpRate / 100)) - (state.depositAmt * (depositFtpRate / 100));

    // Bank Net Spread
    const totalSpread = state.loanRate - state.depositRate;
    const totalDol = lendingDol + depositDol + treasuryDol;

    // --- Update Metric Cards ---
    els.metricLendingSpread.textContent = formatPct(lendingSpread, true);
    els.metricLendingDol.textContent = formatMoney(lendingDol);
    els.metricLendingBps.textContent = `(${formatBps(lendingSpread)})`;

    els.metricDepositSpread.textContent = formatPct(depositSpread, true);
    els.metricDepositDol.textContent = formatMoney(depositDol);
    els.metricDepositBps.textContent = `(${formatBps(depositSpread)})`;

    els.metricTreasurySpread.textContent = formatPct(treasurySpread, true);
    els.metricTreasuryDol.textContent = formatMoney(treasuryDol);
    els.metricTreasuryBps.textContent = `(${formatBps(treasurySpread)})`;

    els.metricTotalSpread.textContent = formatPct(totalSpread, true);
    els.metricTotalDol.textContent = formatMoney(totalDol);
    els.metricTotalBps.textContent = `(${formatBps(totalSpread)})`;

    // --- Update Diagram Numbers ---
    els.diagDepositAmt.textContent = formatMoney(state.depositAmt);
    els.diagDepositRate.textContent = formatPct(state.depositRate);
    els.diagBranchCredit.textContent = formatPct(depositFtpRate);
    els.diagBranchSpread.textContent = formatPct(depositSpread, true);

    els.diagTreasuryLoanCost.textContent = formatPct(loanFtpRate);
    els.diagTreasurySpread.textContent = formatPct(treasurySpread, true);

    els.diagLendingCost.textContent = formatPct(loanFtpRate);
    els.diagLendingSpread.textContent = formatPct(lendingSpread, true);

    els.diagLoanAmt.textContent = formatMoney(state.loanAmt);
    els.diagLoanRate.textContent = formatPct(state.loanRate);

    // --- Update Waterfall Bar ---
    els.valTotalSpreadSum.textContent = formatPct(totalSpread);
    const absSum = Math.max(0.01, Math.abs(lendingSpread) + Math.abs(depositSpread) + Math.max(0, treasurySpread));
    const pLoan = Math.max(12, Math.round((Math.max(0, lendingSpread) / absSum) * 100));
    const pDep = Math.max(12, Math.round((Math.max(0, depositSpread) / absSum) * 100));
    const pTreasury = Math.max(8, 100 - pLoan - pDep);

    els.barLoan.style.width = `${pLoan}%`;
    els.barLoan.textContent = `Lending (${pLoan}%)`;

    els.barDeposit.style.width = `${pDep}%`;
    els.barDeposit.textContent = `Deposit (${pDep}%)`;

    els.barTreasury.style.width = `${pTreasury}%`;
    els.barTreasury.textContent = `Treasury (${pTreasury}%)`;

    // --- Update Chart Legend ---
    els.legendLoanRate.textContent = formatPct(loanFtpRate);
    els.legendDepositRate.textContent = formatPct(depositFtpRate);

    // --- Draw Canvas Yield Curve ---
    drawCurve(curve, loanFtpRate, depositFtpRate);

    // --- Update Stress Test ---
    updateStressTest(loanFtpRate, depositFtpRate, lendingSpread, depositSpread, treasurySpread);

    // --- Update Active Node Drawer ---
    updateNodeDrawer();
  }

  // --- Stress Test Calculations ---
  function updateStressTest(origLoanFtp, origDepositFtp, origLendingSpread, origDepositSpread, origTreasurySpread) {
    const shockBps = state.rateShock;
    const shockPct = shockBps / 100;
    const beta = state.depositBeta / 100;

    els.valShock.textContent = shockBps === 0 ? '+0 bps (Baseline)' : (shockBps > 0 ? `+${shockBps} bps` : `${shockBps} bps`);

    // Unhedged Pooled Bank
    const unhedgedLoanRate = state.loanRate;
    const unhedgedLoanDol = state.loanAmt * (unhedgedLoanRate / 100);

    // Deposit rate moves by shock * beta
    const unhedgedDepositRate = Math.max(0, state.depositRate + (shockPct * beta));
    const unhedgedDepositDol = state.depositAmt * (unhedgedDepositRate / 100);

    const unhedgedNimPct = unhedgedLoanRate - unhedgedDepositRate;
    const unhedgedNimDol = unhedgedLoanDol - unhedgedDepositDol;

    els.shockUnhedgedLoanRev.textContent = `${formatPct(unhedgedLoanRate)} (${formatMoney(unhedgedLoanDol)})`;
    els.shockUnhedgedDepositCost.textContent = `${formatPct(unhedgedDepositRate)} (${formatMoney(unhedgedDepositDol)})`;
    els.shockUnhedgedNim.textContent = `${formatPct(unhedgedNimPct, true)} (${formatMoney(unhedgedNimDol)})`;

    if (shockBps >= 150) {
      els.shockUnhedgedLendingImp.textContent = '"Blamed for low margin"';
      els.shockUnhedgedLendingImp.style.color = 'var(--rose)';
      els.badgeUnhedged.textContent = 'Severe Duration Squeeze';
      els.verdictUnhedged.textContent = `CRITICAL COMPRESSION: With a +${shockBps} bps rate shock and ${state.depositBeta}% deposit beta, the bank's deposit interest burden jumped to ${formatPct(unhedgedDepositRate)}, shrinking NIM by ${formatBps(shockPct * beta)}. Without FTP, management lacks visibility into where interest rate risk originated.`;
    } else if (shockBps <= -100) {
      els.shockUnhedgedLendingImp.textContent = '"Beneficiary of cheap funds"';
      els.shockUnhedgedLendingImp.style.color = 'var(--teal)';
      els.badgeUnhedged.textContent = 'Short-Term Windfall';
      els.verdictUnhedged.textContent = `With falling rates, deposit costs drop, temporarily masking underlying balance sheet duration imbalances.`;
    } else {
      els.shockUnhedgedLendingImp.textContent = '"Normal Operations"';
      els.shockUnhedgedLendingImp.style.color = 'var(--cream)';
      els.badgeUnhedged.textContent = 'Exposed Duration';
      els.verdictUnhedged.textContent = `As market rates rise, sticky deposits reprice upward. Because the 5-year loan yield is permanently locked, the bank's net margin shrinks rapidly, and underwater fixed assets wipe out equity capital if forced to liquidate.`;
    }

    // Modern Matched FTP Bank
    // Lending desk margin is contractually IMMUNIZED at origination
    els.shockHedgedLendingSpread.textContent = `${formatPct(origLendingSpread, true)} (100% Locked)`;

    // Deposit desk margin adjusts transparently with new curve credit minus new paid rate
    const newMarketCurveDepositCredit = origDepositFtp + shockPct;
    const newDeskSpread = newMarketCurveDepositCredit - unhedgedDepositRate;
    els.shockHedgedDepositSpread.textContent = `${formatPct(newDeskSpread, true)} (Franchise Gain)`;

    // Treasury Absorbs Net Repricing Gap
    const treasuryGapPct = origLoanFtp - newMarketCurveDepositCredit;
    els.shockHedgedTreasuryImpact.textContent = `${formatPct(treasuryGapPct, true)} (Hedging Clears)`;

    if (shockBps > 0) {
      els.verdictHedged.textContent = `PROTECTED: The commercial lending desk continues to earn its guaranteed ${formatPct(origLendingSpread, true)} underwriting spread without taking any duration loss. The ${formatBps(shockBps)} rate shock is completely contained inside Central Treasury, where pre-funded payer interest rate swaps neutralize the mismatch.`;
    } else {
      els.verdictHedged.textContent = `PROTECTED: Loan officers focus strictly on borrower credit quality, branches focus on customer service, and Central Treasury handles the macro curve shifts with precision.`;
    }
  }

  // --- Dynamic Drawer Update ---
  function updateNodeDrawer() {
    const nodeKey = state.selectedNode;
    const info = NODE_DETAILS[nodeKey];
    if (!info) return;

    els.drawerTitle.textContent = info.title;
    els.drawerDesc.textContent = info.desc;
    els.drawerFormulaLabel.textContent = info.formulaLabel;

    // Dynamic formula interpolation
    const curve = CURVE_MODELS[state.curvePreset];
    const loanFtpRate = interpolateRate(curve, state.loanTenor);
    const depositFtpRate = interpolateRate(curve, state.depositTenor);
    const lendingSpread = state.loanRate - loanFtpRate;
    const depositSpread = depositFtpRate - state.depositRate;
    const treasurySpread = loanFtpRate - depositFtpRate;

    if (nodeKey === 'treasury') {
      els.drawerFormulaValue.textContent = `Loan FTP (${formatPct(loanFtpRate)}) − Deposit FTP (${formatPct(depositFtpRate)}) = ${formatPct(treasurySpread, true)}`;
    } else if (nodeKey === 'lending') {
      els.drawerFormulaValue.textContent = `Loan Coupon (${formatPct(state.loanRate)}) − Loan FTP (${formatPct(loanFtpRate)}) = ${formatPct(lendingSpread, true)} Credit Spread`;
    } else if (nodeKey === 'branch') {
      els.drawerFormulaValue.textContent = `FTP Credit (${formatPct(depositFtpRate)}) − Depositor Paid (${formatPct(state.depositRate)}) = ${formatPct(depositSpread, true)} Franchise Value`;
    } else if (nodeKey === 'depositor') {
      els.drawerFormulaValue.textContent = `Earns ${formatPct(state.depositRate)} on ${formatMoney(state.depositAmt)} Principal`;
    } else if (nodeKey === 'borrower') {
      els.drawerFormulaValue.textContent = `Pays ${formatPct(state.loanRate)} on ${formatMoney(state.loanAmt)} Principal`;
    }
  }

  // --- Canvas Curve Drawing ---
  function drawCurve(curveData, loanFtpRate, depositFtpRate) {
    const canvas = els.curveCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const padLeft = 55;
    const padRight = 35;
    const padTop = 30;
    const padBottom = 35;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Compute min and max rates
    let minRate = 2.5;
    let maxRate = 6.5;
    curveData.forEach(pt => {
      if (pt.rate < minRate) minRate = Math.floor(pt.rate);
      if (pt.rate > maxRate) maxRate = Math.ceil(pt.rate);
    });
    maxRate = Math.max(maxRate, 6.0);
    minRate = Math.min(minRate, 2.0);

    // Mapping helper
    // Use logarithmic or segmented tenor scale for visually pleasing spacing
    const tenors = [0.083, 0.25, 0.5, 1, 2, 3, 5, 7, 10, 30];
    function tenorToX(tenor) {
      const idx = tenors.findIndex(t => t >= tenor);
      if (idx === -1) return padLeft + plotW;
      if (idx === 0) return padLeft;
      const tPrev = tenors[idx - 1];
      const tNext = tenors[idx];
      const frac = (tenor - tPrev) / (tNext - tPrev);
      const stepW = plotW / (tenors.length - 1);
      return padLeft + ((idx - 1) + frac) * stepW;
    }

    function rateToY(rate) {
      const norm = (rate - minRate) / (maxRate - minRate);
      return padTop + plotH - (norm * plotH);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(231, 215, 168, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#b8b2a2';
    ctx.textAlign = 'right';

    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
      const r = minRate + (i * (maxRate - minRate)) / numTicks;
      const y = rateToY(r);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillText(`${r.toFixed(1)}%`, padLeft - 8, y + 3);
    }

    // X-Axis labels
    ctx.textAlign = 'center';
    tenors.forEach((t, i) => {
      const x = padLeft + (i * plotW) / (tenors.length - 1);
      const label = curveData[i] ? curveData[i].label : `${t}Y`;
      ctx.fillText(label, x, h - 14);
    });

    // Draw Curve Path
    ctx.beginPath();
    ctx.strokeStyle = '#d8b45f';
    ctx.lineWidth = 2.5;

    curveData.forEach((pt, i) => {
      const x = padLeft + (i * plotW) / (tenors.length - 1);
      const y = rateToY(pt.rate);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, padTop, 0, h - padBottom);
    grad.addColorStop(0, 'rgba(216, 180, 95, 0.18)');
    grad.addColorStop(1, 'rgba(216, 180, 95, 0.0)');

    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Loan Marker Point (Gold)
    const loanX = tenorToX(state.loanTenor);
    const loanY = rateToY(loanFtpRate);

    ctx.save();
    ctx.shadowColor = 'rgba(216, 180, 95, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#d8b45f';
    ctx.beginPath();
    ctx.arc(loanX, loanY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Loan Marker Tag
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#f1e2b8';
    ctx.fillText(`Loan FTP: ${loanFtpRate.toFixed(2)}%`, loanX, loanY - 12);

    // Draw Deposit Marker Point (Teal)
    const depX = tenorToX(state.depositTenor);
    const depY = rateToY(depositFtpRate);

    ctx.save();
    ctx.shadowColor = 'rgba(45, 212, 191, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(depX, depY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Deposit Marker Tag
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText(`Deposit FTP: ${depositFtpRate.toFixed(2)}%`, depX, depY + 22);
  }

  // --- Event Listeners Initialization ---
  function initListeners() {
    // Preset Buttons
    els.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        els.presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.curvePreset = btn.getAttribute('data-curve');
        updateAll();
      });
    });

    // Loan Inputs
    els.inputLoanAmt.addEventListener('input', e => {
      state.loanAmt = parseFloat(e.target.value);
      els.valLoanAmt.textContent = formatMoney(state.loanAmt);
      updateAll();
    });

    els.inputLoanRate.addEventListener('input', e => {
      state.loanRate = parseFloat(e.target.value);
      els.valLoanRate.textContent = `${state.loanRate.toFixed(2)}%`;
      updateAll();
    });

    els.selectLoanTenor.addEventListener('change', e => {
      state.loanTenor = parseFloat(e.target.value);
      els.valLoanTenor.textContent = `${state.loanTenor} Years`;
      updateAll();
    });

    // Deposit Inputs
    els.inputDepositAmt.addEventListener('input', e => {
      state.depositAmt = parseFloat(e.target.value);
      els.valDepositAmt.textContent = formatMoney(state.depositAmt);
      updateAll();
    });

    els.inputDepositRate.addEventListener('input', e => {
      state.depositRate = parseFloat(e.target.value);
      els.valDepositRate.textContent = `${state.depositRate.toFixed(2)}%`;
      updateAll();
    });

    els.selectDepositTenor.addEventListener('change', e => {
      state.depositTenor = parseFloat(e.target.value);
      const text = e.target.options[e.target.selectedIndex].text;
      els.valDepositTenor.textContent = text.split(' ')[0] + ' ' + text.split(' ')[1];
      updateAll();
    });

    els.inputDepositBeta.addEventListener('input', e => {
      state.depositBeta = parseInt(e.target.value, 10);
      els.valDepositBeta.textContent = `${state.depositBeta}%`;
      updateAll();
    });

    // Shock Slider
    els.inputShock.addEventListener('input', e => {
      state.rateShock = parseInt(e.target.value, 10);
      updateAll();
    });

    // Flow Nodes click
    els.flowNodes.forEach(node => {
      node.addEventListener('click', () => {
        els.flowNodes.forEach(n => n.classList.remove('active-node'));
        node.classList.add('active-node');
        state.selectedNode = node.getAttribute('data-node');
        updateNodeDrawer();
      });
    });

    // Accordions
    els.accordions.forEach(item => {
      const btn = item.querySelector('.accordion-btn');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
      });
    });

    // Resize listener for Canvas
    window.addEventListener('resize', () => {
      const curve = CURVE_MODELS[state.curvePreset];
      const loanFtpRate = interpolateRate(curve, state.loanTenor);
      const depositFtpRate = interpolateRate(curve, state.depositTenor);
      drawCurve(curve, loanFtpRate, depositFtpRate);
    });
  }

  // --- Initial Boot ---
  initListeners();
  updateAll();
})();
