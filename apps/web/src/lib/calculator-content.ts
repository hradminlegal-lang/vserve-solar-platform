import { formatNumber, formatPhp } from '@vserve/ui';
import { type CalculatorKind, defaultsFor, runCalculator } from './calculators';
import type { Faq } from './seo';
import type { CalcSettings } from './settings';

/**
 * Words for each calculator page: the question it answers, a 40–60 word answer built from the
 * worked example (so it always matches current defaults), and FAQ. A unit test checks lengths.
 */
export interface CalculatorContent {
  name: string;
  description: string;
  question: string;
  answer: string;
  faq: Faq[];
}

const r1 = (n: number) => formatNumber(n, 1);

export function contentFor(kind: CalculatorKind, s: CalcSettings): CalculatorContent {
  const c = s.config;
  const ex = runCalculator(kind, defaultsFor(kind, s), s);
  const rate = `₱${formatNumber(c.ratePhpPerKwh, 2)}`;
  const range = `${formatPhp(c.priceLowPerKwp)}–${formatPhp(c.priceHighPerKwp)}`;
  switch (ex.kind) {
    case 'bill': {
      const r = ex.result;
      return {
        name: 'Bill to system size',
        description:
          'Turn your monthly electric bill into a solar system size, number of panels, roof area, price range and payback.',
        question: 'What size solar system do I need for my bill?',
        answer: `Divide your bill by the rate (${rate}/kWh) to get your usage, then size panels to cover it. A ${formatPhp(ex.input.monthlyBillPhp)} monthly bill covered ${ex.input.offsetPct}% needs about ${r1(r.kwp)} kWp: ${r.panels} panels on ${formatNumber(r.roofAreaM2)} m² of roof. It costs ${formatPhp(r.priceLow)}–${formatPhp(r.priceHigh)} and saves about ${formatPhp(r.savingsPhp)} a month.`,
        faq: [
          {
            q: 'Why not cover 100% of my bill?',
            a: 'Power you use while the sun is up saves the full rate. Power you send to the grid earns a lower net-metering credit. Covering about 80% usually pays back faster.',
          },
          {
            q: 'What is the daytime share?',
            a: 'The part of your electricity used between about 8 am and 4 pm. Homes with someone in during the day, or with aircon running in the afternoon, use more in the daytime.',
          },
          {
            q: 'Is the price range a quote?',
            a: `No. It uses a typical installed price of ${range} per kWp for grid-tied systems. Ask verified companies for real quotes, then check them with the quote checker.`,
          },
        ],
      };
    }
    case 'appliances': {
      const r = ex.result;
      return {
        name: 'What can solar run?',
        description:
          'Add up what your appliances use each day and month, the system that covers them, and how long a system can run each one.',
        question: 'How much solar do my appliances need?',
        answer: `Multiply each appliance's watts by how many you have and the hours you use it, then add them up. The example home (aircon, fridge, fans, lights, washer) uses ${r1(r.load.dailyKwh)} kWh a day, about ${formatPhp(r.load.monthlyCostPhp)} a month. ${r.load.panels} panels (${r1(r.load.kwp)} kWp) would cover it.`,
        faq: [
          {
            q: 'Where do I find the watts?',
            a: 'Look at the label or nameplate on the appliance, or its manual. Inverter aircons use less than their label once the room is cool, so the label is a safe upper figure.',
          },
          {
            q: 'Can solar run my aircon at night?',
            a: 'Not without a battery. Panels only produce while the sun is up. To run loads at night or in a brownout, use the battery backup calculator.',
          },
          {
            q: 'What does "hours each appliance can run" mean?',
            a: 'It is one day of solar energy spent on that appliance alone. It shows scale, not a schedule: in real use all your appliances share the energy.',
          },
        ],
      };
    }
    case 'battery': {
      const r = ex.result;
      return {
        name: 'Battery backup',
        description:
          'Find the battery size you need to keep lights, fans, the fridge and Wi-Fi on during a brownout.',
        question: 'How big a battery do I need for brownouts?',
        answer: `Multiply the watts you want to keep on by the hours of backup, then allow for the share of the battery you can use and inverter losses. Keeping ${ex.input.essentialLoadW} W on for ${ex.input.backupHours} hours takes ${r1(r.neededKwh)} kWh, so a battery of about ${r1(r.nominalKwh ?? 0)} kWh.`,
        faq: [
          {
            q: 'What should count as essential load?',
            a: 'Lights, electric fans, the refrigerator, Wi-Fi and phone charging. These usually add up to 300–600 W. Aircons, water heaters and irons need much bigger batteries.',
          },
          {
            q: 'What is depth of discharge?',
            a: 'The share of a battery you can use without shortening its life. Lithium iron phosphate (LFP) batteries allow about 90%. Lead-acid batteries allow about 50%.',
          },
          {
            q: 'Do I need a special inverter?',
            a: 'Yes. Backup needs a hybrid inverter. It must be at least as large as the loads you run at the same time, with some margin for motors starting.',
          },
        ],
      };
    }
    case 'savings': {
      const r = ex.result;
      return {
        name: 'Savings over 25 years',
        description:
          'How much a solar system saves over 25 years, when it pays back, its return, and what each kWh from your panels really costs.',
        question: 'How much will solar save me over 25 years?',
        answer: `Add up each year's bill savings, minus upkeep and an inverter replacement, while rates rise and panels slowly lose output. A ${formatPhp(ex.input.systemCostPhp)} system making ${formatNumber(ex.input.year1Kwh)} kWh in year one saves about ${formatPhp(r.totalSavingsPhp)} over ${ex.input.years} years and pays back in ${r.paybackYears === null ? 'more than 25' : r1(r.paybackYears)} years.`,
        faq: [
          {
            q: 'Why do savings grow each year?',
            a: `Electricity prices have tended to rise. The model raises the rate by the yearly rise you choose, starting from today's ${rate}/kWh. Set the rise to 0% to see the cautious case.`,
          },
          {
            q: 'What is IRR?',
            a: 'The yearly return on the money you put in, like an interest rate. It lets you compare solar with a bank deposit or paying down a loan.',
          },
          {
            q: 'What is cost per kWh from your panels?',
            a: 'Everything the system costs over its life, divided by everything it produces, in today’s money. If it is below what your utility charges, solar is cheaper power.',
          },
        ],
      };
    }
    case 'quote': {
      const r = ex.result;
      return {
        name: 'Quote checker',
        description:
          'Check a solar quote on price per kWp, sizing, the production it promises, and what is written down. Scored out of 100.',
        question: 'Is my solar quote fair?',
        answer: `Compare its price per kWp (without the battery) with the typical ${range}, check the size fits your usage, check the promised production, and count what is in writing. The example quote, ${formatPhp(ex.input.totalPricePhp)} for ${ex.input.kwp} kWp, costs ${formatPhp(r.perKwp)} per kWp and scores ${r.score} out of 100.`,
        faq: [
          {
            q: 'Why leave the battery out of price per kWp?',
            a: 'Batteries cost a lot on their own. Taking them out lets you compare the solar part of a hybrid quote fairly with a grid-tied quote.',
          },
          {
            q: 'What production is realistic?',
            a: `About ${formatNumber(c.yieldKwhPerKwpDay, 1)} kWh per kWp per day in the Philippines on a good roof. A promise more than 10% above that needs an explanation from the installer.`,
          },
          {
            q: 'Which items should be in writing?',
            a: 'Panel and inverter brands and models, mounting, protection and wiring, labour days, permits and net metering, and every warranty. Missing items are where disputes start.',
          },
        ],
      };
    }
    case 'loan': {
      const r = ex.result;
      return {
        name: 'Loan vs savings',
        description:
          'Will your bill savings cover a solar loan? See the monthly payment, cash flow, interest and the month you break even.',
        question: 'Will my solar savings cover the loan?',
        answer: `Compare the monthly loan payment with what solar saves on your bill each month. If savings are bigger, the system pays for itself from day one. In the example, ${formatPhp(ex.input.pricePhp)} with ${formatPhp(ex.input.downPaymentPhp)} down at ${ex.input.annualRatePct}% over ${ex.input.termYears} years costs ${formatPhp(r.monthlyPayment)} a month against ${formatPhp(ex.input.monthlySavingsPhp)} saved, and breaks even in month ${r.breakEvenMonth ?? 'never'}.`,
        faq: [
          {
            q: 'Where do I get the interest rate?',
            a: 'From the lender. Ask for the yearly rate, any fees, and the term. Lender offers will be listed in Financing, each with the date we checked it.',
          },
          {
            q: 'What does break-even month mean?',
            a: 'The month when your total bill savings first exceed everything you have paid: down payment plus loan payments so far.',
          },
          {
            q: 'Is a longer term better?',
            a: 'A longer term lowers the monthly payment but adds interest. If savings already cover a shorter term, the shorter term usually costs less overall.',
          },
        ],
      };
    }
  }
}
