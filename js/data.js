// Tool names, descriptions, and slider settings. Add a new tool here first.
const CALCS = {
  loan: {
    name: 'Loan EMI', title: 'Loan EMI calculator',
    desc: 'Monthly payment, total interest, and what paying extra saves.',
    method: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r the monthly rate and n the number of months. Interest is charged on the reducing balance. Extra payments go fully to principal every month.',
  },
  goal: {
    name: 'Goal planner', title: 'Goal planner',
    desc: 'Monthly investment needed to afford a future goal.',
    method: 'The goal cost is raised by inflation every year until the target date. Existing savings grow at the expected return, compounded monthly. The monthly investment, paid at the start of each month, fills the remaining gap.',
  },
  fd: {
    name: 'FD returns', title: 'Fixed deposit calculator',
    desc: 'Maturity value and interest on a fixed deposit.',
    method: 'Maturity = P × (1 + r ÷ 4)^(4 × years). Interest compounds every quarter, as most Indian banks do. Tax on interest is not deducted.',
  },
  retire: {
    name: 'Retirement', title: 'Retirement planner',
    desc: 'Fund you need to retire and how much to invest monthly.',
    method: 'Monthly expense is raised by inflation to your retirement year, then multiplied by 12 × 25 to get the fund target. This is the 25x rule, equal to withdrawing 4% a year. The monthly investment is compounded monthly at the expected return.',
  },
  inflation: {
    name: 'Inflation', title: 'Inflation calculator',
    desc: 'What your money will be worth in the future.',
    method: 'Buying power = amount ÷ (1 + inflation)^years. Future cost = amount × (1 + inflation)^years.',
  },
  card: {
    name: 'Card payoff', title: 'Credit card payoff calculator',
    desc: 'Time and interest to clear a credit card balance.',
    method: 'Each month, interest at the yearly rate ÷ 12 is added to the balance, then your payment is subtracted. No new spending, late fees or GST on interest are assumed.',
  },
  cibil: {
    name: 'CIBIL score', title: 'CIBIL score estimator',
    desc: 'Rough estimate of your credit score from four habits.',
    method: 'This is an estimate, not your real CIBIL score, and this site is not linked to TransUnion CIBIL. Score = 300 + 600 × weighted factors: on-time payments 40%, card limit used 30%, age of credit history 15%, recent applications 15%. Real scores use your full credit report. Check your actual score on the official CIBIL website.',
  },
};

const FIELDS = {
  loan: [
    { key: 'amount', label: 'Loan amount', unit: '₹', min: 50000, max: 20000000, step: 50000, value: 3000000 },
    { key: 'rate', label: 'Interest rate per year', unit: '%', min: 1, max: 24, step: 0.1, value: 9 },
    { key: 'years', label: 'Tenure', unit: 'yr', min: 1, max: 30, step: 1, value: 20 },
    { key: 'extra', label: 'Extra payment every month', unit: '₹', min: 0, max: 100000, step: 500, value: 0 },
  ],
  goal: [
    { key: 'cost', label: 'Goal cost today', unit: '₹', min: 10000, max: 50000000, step: 10000, value: 1000000 },
    { key: 'years', label: 'Years until goal', unit: 'yr', min: 1, max: 40, step: 1, value: 5 },
    { key: 'inflation', label: 'Price rise per year', unit: '%', min: 0, max: 15, step: 0.5, value: 6 },
    { key: 'rate', label: 'Expected return per year', unit: '%', min: 1, max: 30, step: 0.5, value: 12 },
    { key: 'saved', label: 'Already saved', unit: '₹', min: 0, max: 20000000, step: 10000, value: 0 },
  ],
  fd: [
    { key: 'amount', label: 'Deposit amount', unit: '₹', min: 1000, max: 10000000, step: 1000, value: 100000 },
    { key: 'rate', label: 'Interest rate per year', unit: '%', min: 1, max: 15, step: 0.1, value: 7 },
    { key: 'years', label: 'Deposit period', unit: 'yr', min: 1, max: 20, step: 1, value: 5 },
  ],
  retire: [
    { key: 'age', label: 'Your age now', unit: 'yr', min: 18, max: 60, step: 1, value: 30 },
    { key: 'retireAge', label: 'Retirement age', unit: 'yr', min: 40, max: 70, step: 1, value: 60 },
    { key: 'expense', label: 'Monthly expense today', unit: '₹', min: 5000, max: 500000, step: 1000, value: 40000 },
    { key: 'inflation', label: 'Price rise per year', unit: '%', min: 0, max: 12, step: 0.5, value: 6 },
    { key: 'rate', label: 'Expected return per year', unit: '%', min: 1, max: 20, step: 0.5, value: 12 },
  ],
  inflation: [
    { key: 'amount', label: 'Amount today', unit: '₹', min: 1000, max: 10000000, step: 1000, value: 100000 },
    { key: 'inflation', label: 'Price rise per year', unit: '%', min: 1, max: 15, step: 0.5, value: 6 },
    { key: 'years', label: 'Years from now', unit: 'yr', min: 1, max: 40, step: 1, value: 10 },
  ],
  card: [
    { key: 'balance', label: 'Card balance owed', unit: '₹', min: 1000, max: 1000000, step: 1000, value: 50000 },
    { key: 'rate', label: 'Interest rate per year', unit: '%', min: 12, max: 48, step: 0.5, value: 36 },
    { key: 'payment', label: 'Payment every month', unit: '₹', min: 500, max: 100000, step: 500, value: 2500 },
  ],
  cibil: [
    { key: 'onTime', label: 'Bills and EMIs paid on time', unit: '%', min: 50, max: 100, step: 1, value: 95 },
    { key: 'used', label: 'Credit card limit used', unit: '%', min: 0, max: 100, step: 1, value: 30 },
    { key: 'age', label: 'Age of oldest loan or card', unit: 'yr', min: 0, max: 20, step: 1, value: 3 },
    { key: 'applied', label: 'Loans or cards applied for, last 12 months', unit: '', min: 0, max: 10, step: 1, value: 1 },
  ],
};
