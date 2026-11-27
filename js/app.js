// Calculator page: sliders, results, tab switching.
const state = { tab: 'loan' };
for (const tab of Object.keys(FIELDS)) {
  state[tab] = {};
  for (const field of FIELDS[tab]) state[tab][field.key] = field.value;
}

function showStats(items) {
  document.getElementById('stats').innerHTML = items
    .map(([k, v, main]) => `<div class="stat${main ? ' main' : ''}"><div class="k">${k}</div><div class="v">${v}</div></div>`)
    .join('');
}

function render() {
  const note = document.getElementById('note');
  if (state.tab === 'goal') {
    const r = calcGoal(state.goal);
    const years = state.goal.years;
    showStats([
      ['Monthly investment needed',money(r.monthly), true],
      [`Goal cost in ${years} years`, money(r.target)],
      ['You put in', money(r.invested)],
    ]);
    drawChart([
      { name: 'Your savings', cls: 'a', values: r.valueByYear },
      { name: 'Goal cost', cls: 'b', values: r.costByYear },
    ], years);
    note.textContent = r.monthly === 0
      ? `Your current savings already grow enough to cover this goal. No monthly investment needed.`
      : `Prices rise, so a ${money(state.goal.cost)} goal costs ${money(r.target)} in ${years} years. ` +
        `Invest ${money(r.monthly)} every month to reach it. Returns cover ${money(r.target - r.invested)} of the cost.`;
  } else if (state.tab === 'fd') {
    const { amount, years } = state.fd;
    const r = calcFd(state.fd);
    showStats([
      ['Maturity value', money(r.value), true],
      ['Interest earned', money(r.value - amount)],
      ['You deposit', money(amount)],
    ]);
    drawChart([
      { name: 'FD value', cls: 'a', values: r.valueByYear },
      { name: 'Amount deposited', cls: 'b', values: r.depositByYear },
    ], years);
    note.textContent = `Interest is added every 3 months. Your deposit grows ${(r.value / amount).toFixed(2)}x in ${years} years. ` +
      `FD interest is taxable, so money in hand will be lower.`;
  } else if (state.tab === 'retire') {
    const r = calcRetire(state.retire);
    showStats([
      ['Monthly investment needed', money(r.monthly), true],
      ['Retirement fund needed', money(r.corpus)],
      ['Monthly expense at retirement', money(r.expenseThen)],
    ]);
    drawChart([{ name: 'Retirement fund', cls: 'a', values: r.valueByYear }], r.years);
    note.textContent = `${r.years} years left to retire. ${money(state.retire.expense)} of monthly expense today becomes ` +
      `${money(r.expenseThen)} by then. Fund target uses the 25x rule: 25 years of expenses at retirement prices.`;
  } else if (state.tab === 'inflation') {
    const { amount, years } = state.inflation;
    const r = calcInflation(state.inflation);
    showStats([
      ['Buying power left', money(r.power), true],
      ['Same things will cost', money(r.cost)],
      ['Value lost', Math.round(100 * (1 - r.power / amount)) + '%'],
    ]);
    drawChart([
      { name: 'Cost of same things', cls: 'b', values: r.costByYear },
      { name: 'Buying power of your money', cls: 'a', values: r.powerByYear },
    ], years);
    note.textContent = `${money(amount)} kept as cash for ${years} years buys only what ${money(r.power)} buys today. ` +
      `Money must grow faster than prices to keep its value.`;
  } else if (state.tab === 'card') {
    const { balance, payment } = state.card;
    const r = calcCard(state.card);
    if (r.never) {
      showStats([
        ['Time to clear', 'Never', true],
        ['Interest each month', money(r.firstInterest)],
        ['Your payment', money(payment)],
      ]);
      drawChart([{ name: 'Balance owed', cls: 'a', values: [balance, balance] }], 1);
      note.textContent = `Payment is too small. Interest alone is ${money(r.firstInterest)} every month, ` +
        `so the balance never goes down. Pay well above that to clear the card.`;
    } else {
      showStats([
        ['Time to clear', span(r.plan.months), true],
        ['Total interest', money(r.plan.interest)],
        ['Total paid', money(balance + r.plan.interest)],
      ]);
      drawChart([{ name: 'Balance owed', cls: 'a', values: r.plan.balanceByYear }], r.plan.balanceByYear.length - 1);
      note.textContent = `Interest adds ${Math.round(100 * r.plan.interest / balance)}% on top of what you owe. ` +
        `Paying ${money(payment * 2)} instead clears it in ${span(r.double.months)} and saves ` +
        `${money(r.plan.interest - r.double.interest)} in interest.`;
    }
  } else if (state.tab === 'cibil') {
    const r = calcCibil(state.cibil);
    showStats([
      ['Estimated score', r.score, true],
      ['Rating', r.band.name],
      ['Biggest drag', r.drag.lost > 0 ? `${r.drag.name} (−${r.drag.lost})` : 'None'],
    ]);
    drawGauge(r.score, r.band);
    note.textContent = (r.drag.lost > 0 ? ADVICE[r.drag.key] : 'All four habits are at their best.') +
      ' Lenders usually prefer a score of 750 or above. This is an estimate, not your real CIBIL score.';
  } else {
    const r = calcLoan(state.loan);
    const extra = state.loan.extra;
    showStats([
      ['Monthly EMI', money(r.emi), true],
      ['Total interest', money(r.fast.interest)],
      ['Total payment', money(state.loan.amount + r.fast.interest)],
    ]);
    const series = [{ name: extra ? 'Balance with extra payment' : 'Loan balance', cls: 'a', values: r.fast.balanceByYear }];
    if (extra) series.push({ name: 'Balance with EMI only', cls: 'b', values: r.plain.balanceByYear });
    drawChart(series, state.loan.years);
    if (extra) {
      const saved = r.plain.months - r.fast.months;
      note.textContent = `Paying ${money(extra)} extra every month ends the loan ` +
        `${Math.floor(saved / 12)} years ${saved % 12} months sooner and saves ${money(r.plain.interest - r.fast.interest)} in interest.`;
    } else {
      note.textContent = `Interest adds ${Math.round(100 * r.plain.interest / state.loan.amount)}% on top of the amount borrowed. ` +
        `Try the extra payment slider to see how much sooner the loan can end.`;
    }
  }
}

function buildControls() {
  const box = document.getElementById('controls');
  box.innerHTML = '';
  for (const field of FIELDS[state.tab]) {
    const id = `${state.tab}-${field.key}`;
    const isMoney = field.unit === '₹';
    const show = (v) => (isMoney ? v.toLocaleString('en-IN') : String(v));
    const end = (v) => (isMoney ? compact(v) : v + (field.unit === '%' ? '%' : ' ' + field.unit));
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML =
      `<div class="field-head"><label for="${id}">${field.label}</label>` +
      `<div class="num">${isMoney ? '<span>₹</span>' : ''}` +
      `<input type="text" inputmode="decimal" autocomplete="off" aria-label="${field.label}">` +
      `${isMoney ? '' : `<span>${field.unit}</span>`}</div></div>` +
      `<input type="range" id="${id}" min="${field.min}" max="${field.max}" step="${field.step}">` +
      `<div class="ends"><span>${end(field.min)}</span><span>${end(field.max)}</span></div>`;
    const [number, range] = wrap.querySelectorAll('input');
    const set = (raw) => {
      const parsed = Number(String(raw).replace(/[^0-9.]/g, ''));
      const value = Math.min(field.max, Math.max(field.min, parsed || field.min));
      state[state.tab][field.key] = value;
      number.value = show(value);
      range.value = value;
      render();
    };
    number.value = show(state[state.tab][field.key]);
    range.value = state[state.tab][field.key];
    range.addEventListener('input', () => set(range.value));
    number.addEventListener('change', () => set(number.value));
    number.addEventListener('focus', () => number.select());
    number.addEventListener('keydown', (event) => { if (event.key === 'Enter') number.blur(); });
    box.appendChild(wrap);
  }
}


function selectTab(tab, updateHash) {
  state.tab = tab;
  for (const button of document.querySelectorAll('#nav button')) {
    button.setAttribute('aria-selected', String(button.dataset.tab === tab));
  }
  document.getElementById('calc-title').textContent = CALCS[tab].title;
  document.getElementById('calc-desc').textContent = CALCS[tab].desc;
  document.getElementById('method').textContent = CALCS[tab].method;
  document.title = CALCS[tab].title + ' — MoneyCurve';
  if (updateHash) history.replaceState(null, '', '#' + tab);
  buildControls();
  render();
}

const nav = document.getElementById('nav');
for (const [tab, calc] of Object.entries(CALCS)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.dataset.tab = tab;
  button.textContent = calc.name;
  button.addEventListener('click', () => selectTab(tab, true));
  nav.appendChild(button);
}

document.getElementById('reset').addEventListener('click', () => {
  for (const field of FIELDS[state.tab]) state[state.tab][field.key] = field.value;
  buildControls();
  render();
});

// calculator.html#fd opens the FD tool directly.
const tabFromHash = () => (CALCS[location.hash.slice(1)] ? location.hash.slice(1) : 'loan');
window.addEventListener('hashchange', () => selectTab(tabFromHash(), false));
selectTab(tabFromHash(), false);
