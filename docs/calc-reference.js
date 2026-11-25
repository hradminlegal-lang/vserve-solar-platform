// Reference implementation of every VServe Solar calculator.
// This file is the executable spec: packages/calc must produce the same outputs
// for every vector in tests/golden/*.json (tolerance: 0.01 on unrounded numbers, exact on integers).
// Pure functions, no I/O. Money here is in pesos as numbers; the app stores centavos.

const DEFAULTS = {
  ratePhpPerKwh: 15.06,        // Meralco residential, Oct 2026 (settings table, admin-editable)
  yieldKwhPerKwpDay: 4.0,      // planning yield
  panelWatts: 600,
  panelAreaM2: 2.6,
  priceLowPerKwp: 50000,       // grid-tied, no battery
  priceHighPerKwp: 70000,
  exportCreditPhpPerKwh: 5.5,
  daysPerMonth: 30,
};

// 1. Bill → system size, price, savings, payback
function billToSystem(i, c = DEFAULTS) {
  const usageKwh = c.ratePhpPerKwh > 0 ? i.monthlyBillPhp / c.ratePhpPerKwh : 0;
  const targetKwh = usageKwh * i.offsetPct / 100;
  const panelKw = c.panelWatts / 1000;
  const panels = targetKwh > 0 ? Math.ceil(targetKwh / (c.yieldKwhPerKwpDay * c.daysPerMonth) / panelKw) : 0;
  const kwp = panels * panelKw;
  const productionKwh = kwp * c.yieldKwhPerKwpDay * c.daysPerMonth;
  const selfUsedKwh = Math.min(productionKwh, usageKwh * i.daytimeSharePct / 100);
  const exportedKwh = Math.max(0, productionKwh - selfUsedKwh);
  const savingsPhp = selfUsedKwh * c.ratePhpPerKwh + exportedKwh * c.exportCreditPhpPerKwh;
  const priceLow = kwp * c.priceLowPerKwp, priceHigh = kwp * c.priceHighPerKwp;
  return {
    usageKwh, panels, kwp, roofAreaM2: panels * c.panelAreaM2, productionKwh, selfUsedKwh, exportedKwh,
    savingsPhp, priceLow, priceHigh,
    paybackYearsLow: savingsPhp > 0 ? priceLow / savingsPhp / 12 : null,
    paybackYearsHigh: savingsPhp > 0 ? priceHigh / savingsPhp / 12 : null,
    savings25yPhp: savingsPhp * 12 * 25,
  };
}

// 2. Appliance list → daily/monthly energy, recommended size, peak load
// items: [{watts, qty, hoursPerDay}]
function applianceLoad(items, c = DEFAULTS) {
  let wh = 0, peakW = 0;
  for (const a of items) { const h = Math.min(24, a.hoursPerDay); wh += a.watts * a.qty * h; peakW += a.watts * a.qty; }
  const dailyKwh = wh / 1000, monthlyKwh = dailyKwh * c.daysPerMonth;
  const panelKw = c.panelWatts / 1000;
  const panels = dailyKwh > 0 ? Math.ceil(dailyKwh / c.yieldKwhPerKwpDay / panelKw) : 0;
  return {
    dailyKwh, monthlyKwh, monthlyCostPhp: monthlyKwh * c.ratePhpPerKwh, panels, kwp: panels * panelKw,
    peakKw: peakW / 1000, hybridInverterMinKw: peakW * 1.25 / 1000,
  };
}

// 3. What can a given system run? hours per appliance if it ran alone (capped at 24)
function whatCanItRun(systemKwp, items, c = DEFAULTS) {
  const dailyKwh = systemKwp * c.yieldKwhPerKwpDay;
  return { dailyKwh, hours: items.map(a => { const w = a.watts * a.qty; return w > 0 ? Math.min(24, dailyKwh * 1000 / w) : 0; }) };
}

// 4. Battery backup
function batteryBackup(i) {
  const neededKwh = (i.essentialLoadW * i.backupHours + i.aircondW * i.aircondHours) / 1000;
  const denom = (i.depthOfDischargePct / 100) * (i.inverterEfficiencyPct / 100);
  return { neededKwh, nominalKwh: denom > 0 ? neededKwh / denom : null, hybridInverterMinKw: (i.essentialLoadW + i.aircondW) * 1.25 / 1000 };
}

// 5. Quote score (0–100)
function quoteScore(q, usageKwh, c = DEFAULTS) {
  const perKwp = q.kwp > 0 ? (q.totalPricePhp - q.batteryPricePhp) / q.kwp : 0;
  let sp = 40;
  if (perKwp < c.priceLowPerKwp) sp = 40 - (c.priceLowPerKwp - perKwp) / 500;
  else if (perKwp > c.priceHighPerKwp) sp = 40 - (perKwp - c.priceHighPerKwp) / 750;
  sp = Math.max(0, sp);
  const expectedKwh = q.kwp * c.yieldKwhPerKwpDay * c.daysPerMonth;
  const sizeRatio = usageKwh > 0 ? expectedKwh / usageKwh : 0;
  let ss = 25;
  if (sizeRatio < 0.8) ss = 25 - (0.8 - sizeRatio) * 50; else if (sizeRatio > 1.3) ss = 25 - (sizeRatio - 1.3) * 50;
  ss = Math.max(0, ss);
  const claimDeviation = expectedKwh > 0 ? Math.abs(q.claimedKwhMonth / expectedKwh - 1) : 1;
  let sc = 15; if (claimDeviation > 0.1) sc = 15 - (claimDeviation - 0.1) * 60; sc = Math.max(0, sc);
  const si = Math.max(0, Math.min(12, q.itemsInWriting)) / 12 * 20;
  return {
    perKwp, expectedKwh, sizeRatio, claimRatio: expectedKwh > 0 ? q.claimedKwhMonth / expectedKwh : 0, claimDeviation,
    priceFlag: perKwp < c.priceLowPerKwp ? 'below_range' : perKwp > c.priceHighPerKwp ? 'above_range' : 'in_range',
    sizeFlag: sizeRatio < 0.8 ? 'undersized' : sizeRatio > 1.3 ? 'oversized' : 'fits',
    claimFlag: claimDeviation <= 0.1 ? 'plausible' : q.claimedKwhMonth > expectedKwh ? 'too_high' : 'too_low',
    score: Math.round(sp + ss + sc + si),
  };
}

// 6. Loan vs savings (25-year horizon, monthly steps, savings escalate yearly)
function loanVsSavings(i) {
  const P = Math.max(0, i.pricePhp - i.downPaymentPhp), r = i.annualRatePct / 1200, n = Math.round(i.termYears * 12);
  const payment = n > 0 ? (r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n) : 0;
  let cumulative = -i.downPaymentPhp, breakEvenMonth = null, totalSavings = 0;
  for (let m = 1; m <= 300; m++) {
    const s = i.monthlySavingsPhp * Math.pow(1 + i.escalationPct / 100, Math.floor((m - 1) / 12));
    totalSavings += s; cumulative += s - (m <= n ? payment : 0);
    if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = m;
  }
  return {
    monthlyPayment: payment, monthlyCashFlow: i.monthlySavingsPhp - payment, totalInterest: payment * n - P,
    netGain25y: totalSavings - i.downPaymentPhp - payment * n, breakEvenMonth,
  };
}

// 7. Cleaning payback (prices = maintenance booking tiers)
function cleaningPrice(kwp) { return kwp <= 3 ? 1500 : kwp <= 5 ? 2500 : kwp <= 10 ? 4000 : null; }
function cleaningPayback(i, c = DEFAULTS) {
  const price = cleaningPrice(i.kwp);
  const lostKwh = i.kwp * c.yieldKwhPerKwpDay * c.daysPerMonth * i.lossPct / 100;
  const s = i.selfUsePct / 100;
  const lostPhp = lostKwh * (s * c.ratePhpPerKwh + (1 - s) * c.exportCreditPhpPerKwh);
  return { price, lostKwh, lostPhpPerMonth: lostPhp, paybackMonths: price && lostPhp > 0 ? price / lostPhp : null };
}

// 8. String sizing
function stringSizing(i) {
  const vocCold = i.voc * (1 + (i.tMin - 25) * i.vocCoeffPct / 100);
  const vmpHot = i.vmp * (1 + (i.tHot - 25) * i.pmaxCoeffPct / 100);
  const vmpCold = i.vmp * (1 + (i.tMin - 25) * i.pmaxCoeffPct / 100);
  const maxPanels = Math.min(Math.floor(i.inverterMaxV / vocCold), Math.floor(i.mpptHigh / vmpCold));
  const minPanels = Math.ceil(i.mpptLow / vmpHot);
  return { vocCold, vmpHot, vmpCold, minPanels, maxPanels, valid: minPanels <= maxPanels, currentOk: i.isc <= i.inverterMaxIsc };
}

// 9. Voltage drop (two-way run)
const WIRE_SIZES_MM2 = [2.5, 4, 6, 10, 16, 25, 35];
function voltageDrop(i) {
  const rho = i.conductor === 'aluminium' ? 0.0282 : 0.0175;
  const drop = 2 * i.lengthM * i.currentA * rho / i.areaMm2;
  const pct = i.voltage > 0 ? drop / i.voltage * 100 : 0;
  const minSize = WIRE_SIZES_MM2.find(s => 2 * i.lengthM * i.currentA * rho / s / i.voltage * 100 <= i.targetPct) ?? null;
  return { dropV: drop, dropPct: pct, lossW: drop * i.currentA, ok: pct <= i.targetPct, minSizeMm2: minSize };
}

// 10. Quote builder & margin
function quoteMargin(i, c = DEFAULTS) {
  const kwp = i.panels * c.panelWatts / 1000;
  const cost = i.panels * i.panelCost + i.inverterCost + i.panels * i.mountingPerPanel + i.bosCost + i.labourPerKwp * kwp + i.permitsCost;
  const m = Math.min(95, i.marginPct) / 100;
  const exVat = cost / (1 - m), price = i.vat ? exVat * 1.12 : exVat;
  const perKwp = kwp > 0 ? price / kwp : 0;
  return { kwp, cost, grossProfit: exVat - cost, price, perKwp,
    flag: perKwp < c.priceLowPerKwp ? 'below_range' : perKwp > c.priceHighPerKwp ? 'above_range' : 'in_range' };
}

// 11. Referral earnings (tiers proposed; confirm before launch)
function referralEarnings(i) {
  let total = 0;
  for (let k = 1; k <= i.completedReferrals; k++) total += i.avgJobPhp * (k <= 2 ? i.tier1Pct : k <= 5 ? i.tier2Pct : i.tier3Pct) / 100;
  const maintenance = i.maintenanceReferrals * 150;
  return { installCommission: total, maintenance, total: total + maintenance,
    tier: i.completedReferrals >= 6 ? 3 : i.completedReferrals >= 3 ? 2 : i.completedReferrals >= 1 ? 1 : 0 };
}


// ===================== Platform additions =====================

// 12. Fit panels on a rectangular roof plane (polygon planes are clipped in the UI with the same rules).
// Returns the better of portrait and landscape grid fits.
function panelFit(i) {
  const W = i.planeWidthM - 2 * i.setbackM, H = i.planeHeightM - 2 * i.setbackM;
  if (W <= 0 || H <= 0) return { panels: 0, orientation: null, cols: 0, rows: 0, kwp: 0 };
  const fit = (pw, ph) => {
    const cols = Math.floor((W + i.gapM) / (pw + i.gapM)), rows = Math.floor((H + i.gapM) / (ph + i.gapM));
    return { cols: Math.max(0, cols), rows: Math.max(0, rows) };
  };
  const p = fit(i.panelWidthM, i.panelHeightM), l = fit(i.panelHeightM, i.panelWidthM);
  const pn = p.cols * p.rows, ln = l.cols * l.rows;
  const best = ln > pn ? { ...l, orientation: 'landscape', panels: ln } : { ...p, orientation: 'portrait', panels: pn };
  const panels = i.maxPanels != null ? Math.min(best.panels, i.maxPanels) : best.panels;
  return { panels, orientation: best.orientation, cols: best.cols, rows: best.rows, kwp: panels * i.panelWatts / 1000 };
}

// 13. Combine roof planes: each plane has kWp, annual specific yield (kWh/kWp, from PVWatts/PVGIS/Solar API) and extra shading loss %.
function systemProduction(planes) {
  let kwp = 0, kwh = 0;
  const perPlane = planes.map(p => { const e = p.kwp * p.specificYieldKwhPerKwp * (1 - p.shadingLossPct / 100); kwp += p.kwp; kwh += e; return e; });
  return { kwp, annualKwh: kwh, perPlaneKwh: perPlane, specificYield: kwp > 0 ? kwh / kwp : 0 };
}

// 14. Inverter sizing check
function inverterRatio(i) {
  const ratio = i.inverterAcKw > 0 ? i.arrayKwp / i.inverterAcKw : null;
  return { ratio, flag: ratio === null ? 'invalid' : ratio < 1.0 ? 'undersized_array' : ratio > 1.3 ? 'clipping_risk' : 'ok' };
}

// 15. String overcurrent protection (design aid; engineer confirms against the Philippine Electrical Code)
const FUSE_SIZES_A = [10, 12, 15, 16, 20, 25, 30, 32];
function stringFuse(i) {
  const minA = i.isc * 1.56;
  const fuse = FUSE_SIZES_A.find(f => f >= minA) ?? null;
  const required = i.parallelStrings >= 3;
  return { minRatingA: minA, suggestedFuseA: fuse, fuseRequired: required, withinModuleMax: fuse !== null && fuse <= i.moduleMaxSeriesFuseA };
}

// 16. 25-year financial model (annual steps)
function financialModel(i) {
  const flows = [-i.systemCostPhp];
  let cum = -i.systemCostPhp, paybackYears = null;
  const years = [];
  for (let y = 1; y <= i.years; y++) {
    const prod = i.year1Kwh * Math.pow(1 - i.degradationPct / 100, y - 1);
    const rate = i.ratePhpPerKwh * Math.pow(1 + i.escalationPct / 100, y - 1);
    const exp = i.exportCreditPhpPerKwh * Math.pow(1 + i.escalationPct / 100, y - 1);
    const self = prod * i.selfUsePct / 100;
    const savings = self * rate + (prod - self) * exp;
    const om = i.omPhpPerYear * Math.pow(1 + i.inflationPct / 100, y - 1);
    const capex = y === i.inverterReplaceYear ? i.inverterReplaceCostPhp : 0;
    const net = savings - om - capex;
    const before = cum; cum += net; flows.push(net);
    if (paybackYears === null && cum >= 0) paybackYears = (y - 1) + (net > 0 ? -before / net : 0);
    years.push({ year: y, productionKwh: prod, savingsPhp: savings, netPhp: net, cumulativePhp: cum });
  }
  const npv = r => flows.reduce((a, f, t) => a + f / Math.pow(1 + r, t), 0);
  let irr = null;
  if (npv(-0.99) * npv(10) < 0) { let lo = -0.99, hi = 10; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (npv(lo) * npv(m) <= 0) hi = m; else lo = m; } irr = (lo + hi) / 2; }
  let discEnergy = 0, discCost = i.systemCostPhp;
  years.forEach((y, k) => { const d = Math.pow(1 + i.discountPct / 100, k + 1); discEnergy += y.productionKwh / d; discCost += (i.omPhpPerYear * Math.pow(1 + i.inflationPct / 100, k) + (k + 1 === i.inverterReplaceYear ? i.inverterReplaceCostPhp : 0)) / d; });
  return {
    totalSavingsPhp: years.reduce((a, y) => a + y.savingsPhp, 0), netGainPhp: cum, paybackYears,
    npvPhp: npv(i.discountPct / 100), irr, lcoePhpPerKwh: discEnergy > 0 ? discCost / discEnergy : null,
    year1SavingsPhp: years.length ? years[0].savingsPhp : 0, finalYear: years.length ? years[years.length - 1] : null,
  };
}

// 17. Compare loan offers for one system price. Offers come from the admin-maintained lenders table, never hard-coded.
function loanCompare(pricePhp, monthlySavingsPhp, offers) {
  return offers.map(o => {
    const down = pricePhp * o.minDownPct / 100, principal = pricePhp - down;
    const eligible = principal >= o.minLoanPhp && principal <= o.maxLoanPhp;
    const r = o.annualRatePct / 1200, n = Math.round(o.termYears * 12);
    const pay = n > 0 ? (r > 0 ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n) : 0;
    const fees = principal * o.feesPct / 100;
    return { lender: o.lender, eligible, downPaymentPhp: down, principalPhp: principal, monthlyPaymentPhp: pay,
      totalInterestPhp: pay * n - principal, upfrontPhp: down + fees, totalCostPhp: down + fees + pay * n,
      monthlyCashFlowPhp: monthlySavingsPhp - pay };
  });
}

// 18. Affordability estimate (indicative only; lenders decide)
function affordability(i) {
  const maxPayment = Math.max(0, i.grossMonthlyIncomePhp * i.maxDtiPct / 100 - i.existingMonthlyDebtPhp);
  const r = i.annualRatePct / 1200, n = Math.round(i.termYears * 12);
  const maxLoan = n > 0 ? (r > 0 ? maxPayment * (1 - Math.pow(1 + r, -n)) / r : maxPayment * n) : 0;
  return { maxMonthlyPaymentPhp: maxPayment, maxLoanPhp: maxLoan, affordsSystem: maxLoan + i.cashAvailablePhp >= i.systemPricePhp };
}

module.exports = { panelFit, systemProduction, inverterRatio, FUSE_SIZES_A, stringFuse, financialModel, loanCompare, affordability, DEFAULTS, billToSystem, applianceLoad, whatCanItRun, batteryBackup, quoteScore, loanVsSavings,
  cleaningPrice, cleaningPayback, stringSizing, voltageDrop, quoteMargin, referralEarnings };
