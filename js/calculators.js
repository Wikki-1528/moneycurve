// Pure math. No page code in this file.
const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const money = (n) => rupee.format(Math.round(n));

function compact(n) {
  if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(1) + ' L';
  if (n >= 1e3) return '₹' + +(n / 1e3).toFixed(0) + 'K';
  return '₹' + Math.round(n);
}

function payoff(amount, monthlyRate, payment, years) {
  let balance = amount, interest = 0, months = 0;
  const balanceByYear = [amount];
  while (balance > 0.005 && months < years * 12) {
    const monthInterest = balance * monthlyRate;
    interest += monthInterest;
    balance = Math.max(0, balance + monthInterest - payment);
    months++;
    if (months % 12 === 0) balanceByYear.push(balance);
  }
  while (balanceByYear.length < years + 1) balanceByYear.push(0);
  return { interest, months, balanceByYear };
}

function calcLoan({ amount, rate, years, extra }) {
  const monthlyRate = rate / 1200, count = years * 12;
  const growth = Math.pow(1 + monthlyRate, count);
  const emi = amount * monthlyRate * growth / (growth - 1);
  return {
    emi,
    plain: payoff(amount, monthlyRate, emi, years),
    fast: payoff(amount, monthlyRate, emi + extra, years),
  };
}

function calcGoal({ cost, years, inflation, rate, saved }) {
  const monthlyRate = rate / 1200, count = years * 12;
  const growth = Math.pow(1 + monthlyRate, count);
  const target = cost * Math.pow(1 + inflation / 100, years);
  const gap = Math.max(0, target - saved * growth);
  const monthly = gap * monthlyRate / ((growth - 1) * (1 + monthlyRate));
  let value = saved;
  const valueByYear = [saved], costByYear = [cost];
  for (let month = 1; month <= count; month++) {
    value = (value + monthly) * (1 + monthlyRate);
    if (month % 12 === 0) {
      valueByYear.push(value);
      costByYear.push(cost * Math.pow(1 + inflation / 100, month / 12));
    }
  }
  return { target, monthly, invested: saved + monthly * count, valueByYear, costByYear };
}

function calcFd({ amount, rate, years }) {
  const valueByYear = [], depositByYear = [];
  for (let year = 0; year <= years; year++) {
    valueByYear.push(amount * Math.pow(1 + rate / 400, 4 * year));
    depositByYear.push(amount);
  }
  return { value: valueByYear[years], valueByYear, depositByYear };
}

function calcRetire({ age, retireAge, expense, inflation, rate }) {
  const years = Math.max(1, retireAge - age);
  const monthlyRate = rate / 1200, count = years * 12;
  const growth = Math.pow(1 + monthlyRate, count);
  const expenseThen = expense * Math.pow(1 + inflation / 100, years);
  const corpus = expenseThen * 12 * 25;
  const monthly = corpus * monthlyRate / ((growth - 1) * (1 + monthlyRate));
  let value = 0;
  const valueByYear = [0];
  for (let month = 1; month <= count; month++) {
    value = (value + monthly) * (1 + monthlyRate);
    if (month % 12 === 0) valueByYear.push(value);
  }
  return { years, expenseThen, corpus, monthly, valueByYear };
}

function calcInflation({ amount, inflation, years }) {
  const powerByYear = [], costByYear = [];
  for (let year = 0; year <= years; year++) {
    const factor = Math.pow(1 + inflation / 100, year);
    powerByYear.push(amount / factor);
    costByYear.push(amount * factor);
  }
  return { power: powerByYear[years], cost: costByYear[years], powerByYear, costByYear };
}

function calcCard({ balance, rate, payment }) {
  const monthlyRate = rate / 1200;
  const firstInterest = balance * monthlyRate;
  const monthsFor = (pay) => Math.ceil(-Math.log(1 - firstInterest / pay) / Math.log(1 + monthlyRate));
  if (payment <= firstInterest || monthsFor(payment) > 600) return { never: true, firstInterest };
  const run = (pay) => payoff(balance, monthlyRate, pay, Math.ceil(monthsFor(pay) / 12));
  return { never: false, plan: run(payment), double: run(payment * 2) };
}

const span = (months) => `${Math.floor(months / 12)} yr ${months % 12} mo`;

const BANDS = [
  { from: 300, to: 550, name: 'Poor', color: '#dc2626' },
  { from: 550, to: 650, name: 'Average', color: '#f97316' },
  { from: 650, to: 750, name: 'Good', color: '#ca8a04' },
  { from: 750, to: 900, name: 'Excellent', color: '#16a34a' },
];

const ADVICE = {
  onTime: 'Pay every EMI and card bill on or before the due date. Payment history carries the most weight.',
  used: 'Keep card spending under 30% of your limit, or ask the bank for a higher limit.',
  age: 'Keep your oldest card or account open. A longer credit history helps.',
  applied: 'Avoid applying for many loans or cards in a short time. Each application is recorded.',
};

function calcCibil({ onTime, used, age, applied }) {
  const usedValue = used <= 10 ? 1 : used <= 30 ? 1 - (used - 10) * 0.0075 : 0.85 * (100 - used) / 70;
  const factors = [
    { key: 'onTime', name: 'Late payments', weight: 0.40, value: Math.pow((onTime - 50) / 50, 2) },
    { key: 'used', name: 'High card usage', weight: 0.30, value: usedValue },
    { key: 'age', name: 'Short credit history', weight: 0.15, value: 0.2 + 0.8 * Math.min(1, age / 8) },
    { key: 'applied', name: 'Many applications', weight: 0.15, value: Math.max(0, 1 - applied * 0.15) },
  ];
  const score = Math.round(300 + 600 * factors.reduce((sum, f) => sum + f.weight * f.value, 0));
  const drag = factors
    .map((f) => ({ key: f.key, name: f.name, lost: Math.round(600 * f.weight * (1 - f.value)) }))
    .sort((x, y) => y.lost - x.lost)[0];
  const band = BANDS.find((b) => score < b.to) || BANDS[BANDS.length - 1];
  return { score, band, drag };
}
