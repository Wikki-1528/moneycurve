// Shared by every page: mobile menu, footer year, lists built from js/data.js.
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');
menuToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

for (const el of document.querySelectorAll('[data-year]')) el.textContent = new Date().getFullYear();

for (const grid of document.querySelectorAll('[data-tool-grid]')) {
  grid.innerHTML = Object.entries(CALCS).map(([key, calc]) =>
    `<a class="tool-card" href="calculator.html#${key}"><h3>${calc.title}</h3><p>${calc.desc}</p><span class="go">Open tool →</span></a>`
  ).join('');
}

for (const list of document.querySelectorAll('[data-tool-links]')) {
  list.innerHTML = Object.entries(CALCS).map(([key, calc]) => `<a href="calculator.html#${key}">${calc.name}</a>`).join('');
}

for (const box of document.querySelectorAll('[data-methods]')) {
  box.innerHTML = Object.values(CALCS).map((calc) => `<h3>${calc.title}</h3><p>${calc.method}</p>`).join('');
}
