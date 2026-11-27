// Line chart with hover, and the CIBIL score gauge.
const chartEl = document.getElementById('chart');
const tip = document.getElementById('tip');
let plot = null;

function hideTip() {
  tip.hidden = true;
  const hover = document.getElementById('hover');
  if (hover) hover.innerHTML = '';
}

function drawChart(series, years) {
  const W = 640, H = 320, left = 64, right = 16, top = 16, bottom = 28;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i) => left + (W - left - right) * i / years;
  const y = (v) => top + (H - top - bottom) * (1 - v / max);
  let svg = '<defs><linearGradient id="fill-a" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" style="stop-color:var(--a);stop-opacity:0.32"/>' +
    '<stop offset="1" style="stop-color:var(--a);stop-opacity:0"/></linearGradient></defs>';
  for (let i = 0; i <= 4; i++) {
    const v = max * i / 4;
    svg += `<line class="gridline" x1="${left}" x2="${W - right}" y1="${y(v)}" y2="${y(v)}"/>`;
    svg += `<text class="axis" x="${left - 8}" y="${y(v) + 4}" text-anchor="end">${compact(v)}</text>`;
  }
  const tick = Math.max(1, Math.ceil(years / 6));
  for (let i = 0; i <= years; i += tick) {
    svg += `<text class="axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${i === 0 ? 'Now' : 'Yr ' + i}</text>`;
  }
  for (const s of series) {
    const last = s.values.length - 1;
    const points = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    if (s.cls === 'a') svg += `<polygon fill="url(#fill-a)" points="${x(0)},${y(0)} ${points} ${x(last)},${y(0)}"/>`;
    svg += `<polyline class="line-${s.cls}" points="${points}"/>`;
    svg += `<circle class="dot-${s.cls}" r="4" cx="${x(last)}" cy="${y(s.values[last])}"/>`;
  }
  chartEl.innerHTML = svg + '<g id="hover"></g>';
  document.getElementById('legend').innerHTML = series
    .map((s) => `<span><i style="background:var(--${s.cls})"></i>${s.name}</span>`).join('');
  plot = { series, years, x, y, W, H, left, right, top, bottom };
  hideTip();
}

chartEl.addEventListener('pointermove', (event) => {
  if (!plot) return;
  const box = chartEl.getBoundingClientRect();
  const svgX = (event.clientX - box.left) / box.width * plot.W;
  const span = plot.W - plot.left - plot.right;
  const i = Math.min(plot.years, Math.max(0, Math.round((svgX - plot.left) / span * plot.years)));
  const guideX = plot.x(i);
  let marks = `<line class="guide" x1="${guideX}" x2="${guideX}" y1="${plot.top}" y2="${plot.H - plot.bottom}"/>`;
  let rows = `<b>${i === 0 ? 'Now' : 'Year ' + i}</b>`;
  for (const s of plot.series) {
    marks += `<circle class="dot-${s.cls}" r="4.5" cx="${guideX}" cy="${plot.y(s.values[i])}"/>`;
    rows += `<div><i style="background:var(--${s.cls})"></i>${s.name}: ${money(s.values[i])}</div>`;
  }
  document.getElementById('hover').innerHTML = marks;
  tip.innerHTML = rows;
  tip.hidden = false;
  const pixelX = guideX / plot.W * box.width;
  let tipLeft = pixelX + 12;
  if (tipLeft + tip.offsetWidth > box.width) tipLeft = pixelX - 12 - tip.offsetWidth;
  tip.style.left = Math.max(0, Math.min(tipLeft, box.width - tip.offsetWidth)) + 'px';
});
chartEl.addEventListener('pointerleave', hideTip);

function drawGauge(score, band) {
  const cx = 320, cy = 280, r = 210;
  const point = (value, radius) => {
    const angle = Math.PI * (1 - (value - 300) / 600);
    return [(cx + radius * Math.cos(angle)).toFixed(1), (cy - radius * Math.sin(angle)).toFixed(1)];
  };
  const label = (value) => {
    const [x, y] = point(value, r + 28);
    return `<text class="axis" x="${x}" y="${+y + 4}" text-anchor="middle">${value}</text>`;
  };
  let svg = '';
  for (const b of BANDS) {
    const [x1, y1] = point(b.from + 3, r), [x2, y2] = point(b.to - 3, r);
    svg += `<path d="M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="${b.color}" ` +
      `stroke-width="22" opacity="${b === band ? 1 : 0.28}"/>` + label(b.from);
  }
  const [markX, markY] = point(score, r);
  svg += label(900);
  svg += `<circle cx="${markX}" cy="${markY}" r="13" fill="#ffffff" stroke="${band.color}" stroke-width="5"/>`;
  svg += `<text x="${cx}" y="${cy - 62}" text-anchor="middle" style="font-size:76px;font-weight:700;fill:var(--text)">${score}</text>`;
  svg += `<text x="${cx}" y="${cy - 24}" text-anchor="middle" style="font-size:20px;font-weight:600;fill:${band.color}">${band.name}</text>`;
  chartEl.innerHTML = svg;
  document.getElementById('legend').innerHTML = BANDS
    .map((b) => `<span><i style="background:${b.color}"></i>${b.name} ${b.from}–${b.to}</span>`).join('');
  plot = null;
  hideTip();
}
