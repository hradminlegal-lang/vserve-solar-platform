// Generates tests/golden/*.json from docs/calc-reference.js.
// Run: node docs/make-golden.js   (only when a formula in docs/calculators.md is deliberately changed)
const fs = require('fs'), path = require('path');
const C = require('./calc-reference.js');
const out = path.join(__dirname, '..', 'tests', 'golden');
fs.mkdirSync(out, { recursive: true });

const R = v => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 10000) / 10000 : v);
const clean = o => JSON.parse(JSON.stringify(o, (k, v) => R(v)));
const write = (name, fn, cases) => fs.writeFileSync(path.join(out, name + '.json'),
  JSON.stringify({ function: name, defaults: C.DEFAULTS, tolerance: 0.01,
    vectors: cases.map(([label, ...args]) => ({ label, input: args.length === 1 ? args[0] : args, expected: clean(fn(...args)) })) }, null, 2));

const HOUSE = [{ watts: 1100, qty: 1, hoursPerDay: 6 }, { watts: 100, qty: 1, hoursPerDay: 24 }, { watts: 50, qty: 3, hoursPerDay: 10 },
  { watts: 10, qty: 8, hoursPerDay: 6 }, { watts: 500, qty: 1, hoursPerDay: 1 }];

write('billToSystem', C.billToSystem, [
  ['₱6,000 bill, typical', { monthlyBillPhp: 6000, daytimeSharePct: 60, offsetPct: 80 }],
  ['₱3,000 bill', { monthlyBillPhp: 3000, daytimeSharePct: 50, offsetPct: 80 }],
  ['₱12,000 bill, full offset', { monthlyBillPhp: 12000, daytimeSharePct: 70, offsetPct: 100 }],
  ['₱25,000 business, daytime heavy', { monthlyBillPhp: 25000, daytimeSharePct: 90, offsetPct: 90 }],
  ['zero bill', { monthlyBillPhp: 0, daytimeSharePct: 60, offsetPct: 80 }],
  ['all night usage', { monthlyBillPhp: 5000, daytimeSharePct: 0, offsetPct: 80 }],
  ['all daytime usage', { monthlyBillPhp: 5000, daytimeSharePct: 100, offsetPct: 80 }],
  ['over-offset 120%', { monthlyBillPhp: 8000, daytimeSharePct: 60, offsetPct: 120 }],
  ['tiny bill ₱500', { monthlyBillPhp: 500, daytimeSharePct: 60, offsetPct: 80 }],
  ['₱4,518 bill = 300 kWh', { monthlyBillPhp: 4518, daytimeSharePct: 60, offsetPct: 80 }],
  ['offset 10%', { monthlyBillPhp: 6000, daytimeSharePct: 60, offsetPct: 10 }],
  ['₱50,000 bill', { monthlyBillPhp: 50000, daytimeSharePct: 80, offsetPct: 80 }],
]);
write('applianceLoad', C.applianceLoad, [
  ['typical house', HOUSE], ['empty list', []], ['fridge only', [{ watts: 100, qty: 1, hoursPerDay: 24 }]],
  ['hours capped at 24', [{ watts: 100, qty: 1, hoursPerDay: 30 }]], ['zero quantity', [{ watts: 1100, qty: 0, hoursPerDay: 6 }]],
  ['two aircons', [{ watts: 1100, qty: 2, hoursPerDay: 8 }]], ['water heater short use', [{ watts: 3500, qty: 1, hoursPerDay: 0.5 }]],
  ['many small loads', [{ watts: 10, qty: 20, hoursPerDay: 6 }, { watts: 12, qty: 1, hoursPerDay: 24 }]],
  ['induction + rice cooker', [{ watts: 2000, qty: 1, hoursPerDay: 1 }, { watts: 600, qty: 1, hoursPerDay: 1 }]],
  ['zero hours', [{ watts: 1100, qty: 1, hoursPerDay: 0 }]], ['quarter hour kettle', [{ watts: 1800, qty: 1, hoursPerDay: 0.25 }]],
  ['shop: freezers', [{ watts: 120, qty: 3, hoursPerDay: 24 }, { watts: 50, qty: 4, hoursPerDay: 12 }]],
]);
write('whatCanItRun', C.whatCanItRun, [
  ['3 kWp, typical house', 3, HOUSE], ['1 kWp', 1, HOUSE], ['10 kWp', 10, HOUSE], ['0 kWp', 0, HOUSE],
  ['zero-watt item', 3, [{ watts: 0, qty: 1, hoursPerDay: 1 }]], ['5 kWp two aircons', 5, [{ watts: 1100, qty: 2, hoursPerDay: 8 }]],
]);
write('batteryBackup', C.batteryBackup, [
  ['essentials 6 h', { essentialLoadW: 400, backupHours: 6, aircondW: 0, aircondHours: 0, depthOfDischargePct: 90, inverterEfficiencyPct: 90 }],
  ['with 1.5 HP aircon 3 h', { essentialLoadW: 400, backupHours: 6, aircondW: 1100, aircondHours: 3, depthOfDischargePct: 90, inverterEfficiencyPct: 90 }],
  ['lead-acid 50% DoD', { essentialLoadW: 400, backupHours: 6, aircondW: 0, aircondHours: 0, depthOfDischargePct: 50, inverterEfficiencyPct: 90 }],
  ['zero DoD (invalid)', { essentialLoadW: 400, backupHours: 6, aircondW: 0, aircondHours: 0, depthOfDischargePct: 0, inverterEfficiencyPct: 90 }],
  ['overnight 12 h', { essentialLoadW: 300, backupHours: 12, aircondW: 750, aircondHours: 6, depthOfDischargePct: 90, inverterEfficiencyPct: 92 }],
  ['tiny 1 h', { essentialLoadW: 100, backupHours: 1, aircondW: 0, aircondHours: 0, depthOfDischargePct: 100, inverterEfficiencyPct: 100 }],
]);
const U = 400;
write('quoteScore', (q, u) => C.quoteScore(q, u), [
  ['good quote', { totalPricePhp: 245000, kwp: 4.2, batteryPricePhp: 0, claimedKwhMonth: 500, itemsInWriting: 11 }, U],
  ['cheap, vague, inflated claim', { totalPricePhp: 168000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 720, itemsInWriting: 5 }, U],
  ['oversized hybrid', { totalPricePhp: 520000, kwp: 6.6, batteryPricePhp: 140000, claimedKwhMonth: 790, itemsInWriting: 9 }, U],
  ['exactly at low price edge', { totalPricePhp: 200000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 12 }, U],
  ['exactly at high price edge', { totalPricePhp: 280000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 12 }, U],
  ['very expensive', { totalPricePhp: 500000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 12 }, U],
  ['undersized', { totalPricePhp: 120000, kwp: 2.0, batteryPricePhp: 0, claimedKwhMonth: 240, itemsInWriting: 12 }, U],
  ['claim too low', { totalPricePhp: 240000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 300, itemsInWriting: 12 }, U],
  ['nothing in writing', { totalPricePhp: 240000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 0 }, U],
  ['items above 12 clamp', { totalPricePhp: 240000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 15 }, U],
  ['zero usage', { totalPricePhp: 240000, kwp: 4.0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 12 }, 0],
  ['zero kWp (invalid)', { totalPricePhp: 240000, kwp: 0, batteryPricePhp: 0, claimedKwhMonth: 480, itemsInWriting: 12 }, U],
]);
write('loanVsSavings', C.loanVsSavings, [
  ['5y at 9%', { pricePhp: 250000, downPaymentPhp: 25000, annualRatePct: 9, termYears: 5, monthlySavingsPhp: 4800, escalationPct: 0 }],
  ['zero interest', { pricePhp: 240000, downPaymentPhp: 0, annualRatePct: 0, termYears: 2, monthlySavingsPhp: 4000, escalationPct: 0 }],
  ['cash purchase', { pricePhp: 250000, downPaymentPhp: 250000, annualRatePct: 9, termYears: 5, monthlySavingsPhp: 4800, escalationPct: 0 }],
  ['with 3% escalation', { pricePhp: 250000, downPaymentPhp: 25000, annualRatePct: 9, termYears: 5, monthlySavingsPhp: 4800, escalationPct: 3 }],
  ['20y mortgage', { pricePhp: 500000, downPaymentPhp: 0, annualRatePct: 7, termYears: 20, monthlySavingsPhp: 6000, escalationPct: 0 }],
  ['never breaks even', { pricePhp: 500000, downPaymentPhp: 0, annualRatePct: 18, termYears: 5, monthlySavingsPhp: 500, escalationPct: 0 }],
]);
write('cleaningPayback', C.cleaningPayback, [
  ['5 kWp, 5% loss', { kwp: 5, lossPct: 5, selfUsePct: 70 }], ['3 kWp boundary', { kwp: 3, lossPct: 5, selfUsePct: 70 }],
  ['3.01 kWp next tier', { kwp: 3.01, lossPct: 5, selfUsePct: 70 }], ['10 kWp', { kwp: 10, lossPct: 8, selfUsePct: 80 }],
  ['above 10 kWp quote', { kwp: 12, lossPct: 5, selfUsePct: 70 }], ['zero loss', { kwp: 5, lossPct: 0, selfUsePct: 70 }],
]);
const S = { voc: 53.2, vmp: 44.6, vocCoeffPct: -0.25, pmaxCoeffPct: -0.29, tMin: 18, tHot: 70, inverterMaxV: 600, mpptLow: 90, mpptHigh: 550, isc: 14.3, inverterMaxIsc: 20 };
write('stringSizing', C.stringSizing, [
  ['lowland default', S], ['Baguio cold 8 °C', { ...S, tMin: 8 }], ['current too high', { ...S, inverterMaxIsc: 13 }],
  ['narrow MPPT, no valid string', { ...S, mpptLow: 500, mpptHigh: 520 }], ['1000 V inverter', { ...S, inverterMaxV: 1000, mpptHigh: 850 }],
  ['hot 80 °C cells', { ...S, tHot: 80 }],
]);
write('voltageDrop', C.voltageDrop, [
  ['30 m, 4 mm² Cu', { voltage: 400, currentA: 13.5, lengthM: 30, areaMm2: 4, conductor: 'copper', targetPct: 2 }],
  ['230 V AC, 2.5 mm², 40 m fails', { voltage: 230, currentA: 20, lengthM: 40, areaMm2: 2.5, conductor: 'copper', targetPct: 2 }],
  ['aluminium', { voltage: 400, currentA: 13.5, lengthM: 30, areaMm2: 4, conductor: 'aluminium', targetPct: 2 }],
  ['no size fits', { voltage: 48, currentA: 100, lengthM: 50, areaMm2: 16, conductor: 'copper', targetPct: 1 }],
  ['short run', { voltage: 400, currentA: 10, lengthM: 5, areaMm2: 4, conductor: 'copper', targetPct: 1 }],
  ['3% target', { voltage: 230, currentA: 20, lengthM: 40, areaMm2: 6, conductor: 'copper', targetPct: 3 }],
]);
const M = { panels: 8, panelCost: 5200, inverterCost: 38000, mountingPerPanel: 1800, bosCost: 18000, labourPerKwp: 6000, permitsCost: 12000, marginPct: 25, vat: true };
write('quoteMargin', C.quoteMargin, [
  ['default 8 panels', M], ['no VAT', { ...M, vat: false }], ['zero margin', { ...M, marginPct: 0 }],
  ['margin capped at 95', { ...M, marginPct: 99 }], ['big job 20 panels', { ...M, panels: 20, inverterCost: 75000 }], ['high margin 45%', { ...M, marginPct: 45 }],
]);
const T = { avgJobPhp: 250000, tier1Pct: 1.5, tier2Pct: 2, tier3Pct: 3, maintenanceReferrals: 3 };
write('referralEarnings', C.referralEarnings, [
  ['none', { ...T, completedReferrals: 0, maintenanceReferrals: 0 }], ['tier 1 edge (2)', { ...T, completedReferrals: 2 }],
  ['tier 2 start (3)', { ...T, completedReferrals: 3 }], ['4 referrals', { ...T, completedReferrals: 4 }],
  ['tier 3 start (6)', { ...T, completedReferrals: 6 }], ['10 referrals', { ...T, completedReferrals: 10 }],
]);

const PF = { planeWidthM: 8, planeHeightM: 5, setbackM: 0.4, gapM: 0.02, panelWidthM: 1.134, panelHeightM: 2.382, panelWatts: 600 };
write('panelFit', C.panelFit, [
  ['8×5 m plane', PF], ['narrow 3×10 m', { ...PF, planeWidthM: 3, planeHeightM: 10 }], ['setback eats plane', { ...PF, planeWidthM: 0.8 }],
  ['no setback', { ...PF, setbackM: 0 }], ['1 m fire setback', { ...PF, setbackM: 1 }], ['max panels cap', { ...PF, maxPanels: 4 }],
  ['large 12×7 m', { ...PF, planeWidthM: 12, planeHeightM: 7 }], ['450 W smaller panel', { ...PF, panelWidthM: 1.038, panelHeightM: 1.762, panelWatts: 450 }],
]);
write('systemProduction', C.systemProduction, [
  ['two planes east/west', [{ kwp: 3, specificYieldKwhPerKwp: 1300, shadingLossPct: 0 }, { kwp: 3, specificYieldKwhPerKwp: 1250, shadingLossPct: 5 }]],
  ['one south plane', [{ kwp: 5.4, specificYieldKwhPerKwp: 1420, shadingLossPct: 3 }]], ['empty', []],
  ['heavy shading', [{ kwp: 4, specificYieldKwhPerKwp: 1400, shadingLossPct: 30 }]],
]);
write('inverterRatio', C.inverterRatio, [
  ['5.4 kWp on 5 kW', { arrayKwp: 5.4, inverterAcKw: 5 }], ['7 kWp on 5 kW', { arrayKwp: 7, inverterAcKw: 5 }],
  ['3 kWp on 5 kW', { arrayKwp: 3, inverterAcKw: 5 }], ['zero inverter', { arrayKwp: 5, inverterAcKw: 0 }], ['exactly 1.3', { arrayKwp: 6.5, inverterAcKw: 5 }],
]);
write('stringFuse', C.stringFuse, [
  ['2 strings', { isc: 14.3, parallelStrings: 2, moduleMaxSeriesFuseA: 25 }], ['3 strings', { isc: 14.3, parallelStrings: 3, moduleMaxSeriesFuseA: 25 }],
  ['high Isc beyond list', { isc: 21, parallelStrings: 3, moduleMaxSeriesFuseA: 35 }], ['module max too low', { isc: 14.3, parallelStrings: 4, moduleMaxSeriesFuseA: 20 }],
]);
const FM = { systemCostPhp: 250000, year1Kwh: 6000, degradationPct: 0.5, ratePhpPerKwh: 15.06, exportCreditPhpPerKwh: 5.5, escalationPct: 2, selfUsePct: 65, omPhpPerYear: 3000, inflationPct: 3, inverterReplaceYear: 12, inverterReplaceCostPhp: 45000, years: 25, discountPct: 8 };
write('financialModel', C.financialModel, [
  ['typical 4 kWp home', FM], ['no escalation', { ...FM, escalationPct: 0 }], ['all self-used', { ...FM, selfUsePct: 100 }],
  ['business, high self-use, 10 yrs', { ...FM, systemCostPhp: 1200000, year1Kwh: 30000, selfUsePct: 95, years: 10, inverterReplaceYear: 0 }],
  ['never pays back', { ...FM, systemCostPhp: 5000000 }], ['no O&M or replacement', { ...FM, omPhpPerYear: 0, inverterReplaceYear: 0 }],
]);
const OFFERS = [
  { lender: 'Lender A (home loan top-up)', annualRatePct: 7.5, termYears: 10, minDownPct: 0, feesPct: 1, minLoanPhp: 400000, maxLoanPhp: 5000000 },
  { lender: 'Lender B (personal loan)', annualRatePct: 14, termYears: 3, minDownPct: 0, feesPct: 2, minLoanPhp: 50000, maxLoanPhp: 1000000 },
  { lender: 'Lender C (housing fund)', annualRatePct: 9, termYears: 5, minDownPct: 10, feesPct: 0.5, minLoanPhp: 50000, maxLoanPhp: 500000 },
];
write('loanCompare', C.loanCompare, [
  ['₱250k system', 250000, 5000, OFFERS], ['₱600k system', 600000, 11000, OFFERS], ['₱1.2M system', 1200000, 20000, OFFERS],
]);
const AF = { grossMonthlyIncomePhp: 60000, existingMonthlyDebtPhp: 8000, maxDtiPct: 35, annualRatePct: 9, termYears: 5, cashAvailablePhp: 30000, systemPricePhp: 250000 };
write('affordability', C.affordability, [
  ['typical', AF], ['debt too high', { ...AF, existingMonthlyDebtPhp: 25000 }], ['zero interest', { ...AF, annualRatePct: 0 }],
  ['big system', { ...AF, systemPricePhp: 800000 }], ['long term', { ...AF, termYears: 15, annualRatePct: 7 }],
]);
console.log('golden vectors written to', out);
