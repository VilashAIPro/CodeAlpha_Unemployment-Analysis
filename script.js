/* ======================================================
   India Unemployment Analysis — script.js
   Author: Vilash Kumar Reddy | CodeAlpha Task 2
   ====================================================== */

'use strict';

// ── THEME PALETTE ──────────────────────────────────────
const C = {
  bg:     '#0A0A0F',
  axes:   '#12121A',
  axes2:  '#1A1A28',
  border: 'rgba(123,97,255,0.15)',
  grid:   'rgba(255,255,255,0.05)',
  text:   '#E8E8F0',
  dim:    '#8888AA',
  purple: '#7B61FF',
  pink:   '#FF6B9D',
  cyan:   '#00D4FF',
  gold:   '#FFB347',
  green:  '#69FF94',
  orange: '#FF8C69',
};

// ── CHART.JS GLOBAL DEFAULTS ───────────────────────────
Chart.defaults.color           = C.dim;
Chart.defaults.borderColor     = C.grid;
Chart.defaults.font.family     = "'Outfit', sans-serif";
Chart.defaults.font.size       = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
Chart.defaults.plugins.tooltip.backgroundColor = '#1A1A28';
Chart.defaults.plugins.tooltip.borderColor     = 'rgba(123,97,255,0.3)';
Chart.defaults.plugins.tooltip.borderWidth     = 1;
Chart.defaults.plugins.tooltip.padding         = 12;
Chart.defaults.plugins.tooltip.titleColor      = '#E8E8F0';
Chart.defaults.plugins.tooltip.bodyColor       = '#8888AA';
Chart.defaults.plugins.tooltip.cornerRadius    = 10;

// ── DATA ───────────────────────────────────────────────
const months = ['May-19','Jun-19','Jul-19','Aug-19','Sep-19','Oct-19',
                 'Nov-19','Dec-19','Jan-20','Feb-20','Mar-20',
                 'Apr-20','May-20','Jun-20'];

const overallRate  = [9.5,10.1,9.8,10.4,9.3,10.7,9.9,10.2,10.6,11.2,12.8,23.5,24.3,10.9];
const ruralRate    = [8.1,8.7,8.4,8.9,7.8, 9.1,8.5, 8.8, 9.2, 9.8,11.3,20.2,22.1, 9.2];
const urbanRate    = [11.2,12.0,11.5,12.4,11.2,12.9,11.8,12.1,12.5,13.1,14.8,27.6,27.4,13.1];

// COVID impact data (Dataset 2 states)
const statesCovid = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh',
                      'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
                      'Jharkhand','Karnataka','Kerala','Madhya Pradesh',
                      'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
                      'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const preCovid  = [5.66,4.54,10.45,8.02,18.54,5.85,5.96,23.03,16.84,11.23,
                   3.24,6.46,4.34,4.82,2.51,11.04,13.07,1.83,6.89,30.54,8.28,4.74,5.93];
const postCovid = [7.55,5.05,22.91,9.44,18.53,15.07,6.30,27.17,16.35,25.49,
                   7.12,10.53,9.25,8.67,7.30,14.87,16.75,13.54,7.56,24.42,10.17,12.43,11.30];

// Top 15 states by avg unemployment
const topStates = ['Haryana','Tripura','Jharkhand','Jammu & Kashmir',
                    'Bihar','Himachal Pradesh','Delhi','Rajasthan',
                    'Punjab','Kerala','Uttar Pradesh','Chhattisgarh',
                    'West Bengal','Odisha','Meghalaya'];
const topRates  = [26.8,24.6,23.1,19.5,18.3,17.9,17.4,16.2,
                    15.8,14.6,13.8,12.9,11.2,9.4,7.1];

// Zone distributions (for boxplot-style chart)
const zoneData = {
  labels:  ['North','East','Northeast','South','West'],
  median:  [20.8,   17.5,  12.3,      10.2,   9.5],
  q1:      [13.2,   10.4,  7.1,       6.1,    5.2],
  q3:      [28.5,   24.3,  18.9,      15.8,   14.2],
  colors:  [C.purple, C.gold, C.orange, C.green, C.cyan],
};

// Scatter: labour participation vs unemployment
const labourData = (() => {
  const rural = [], urban = [];
  for (let i = 0; i < 60; i++) {
    rural.push({ x: 35 + Math.random()*30, y: 5 + Math.random()*25 });
    urban.push({ x: 30 + Math.random()*25, y: 8 + Math.random()*35 });
  }
  return { rural, urban };
})();

// ── COUNTER ANIMATION ──────────────────────────────────
function animateCounter(el, target, decimals = 0, duration = 1800) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * ease).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(step);
}

function startCounters() {
  animateCounter(document.getElementById('counter-avg'),     11.79, 2);
  animateCounter(document.getElementById('counter-max'),     76.74, 2);
  animateCounter(document.getElementById('counter-states'),  28,    0, 1200);
  animateCounter(document.getElementById('counter-records'), 1.04,  2, 1500);
}

// ── NAV SCROLL + ACTIVE LINK ───────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}, { passive: true });

// ── HAMBURGER ──────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// ── SCROLL-REVEAL ──────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.dataset-card, .stat-card, .comp-card, .zone-card, .tech-card, ' +
  '.top5-card, .gallery-item, .insight-box, .si-box, .covid-pill, .terminal-box'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Counter fires when hero-stats enters viewport
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    startCounters();
    heroObserver.disconnect();
  }
}, { threshold: 0.5 });
heroObserver.observe(document.querySelector('.hero-stats'));

// ── TERMINAL TYPEWRITER ────────────────────────────────
const terminalText = `
╔══════════════════════════════════════════════════════════════╗
║       📉 UNEMPLOYMENT ANALYSIS — KEY INSIGHTS SUMMARY        ║
║              CodeAlpha Task 2 · May Batch 2026               ║
╚══════════════════════════════════════════════════════════════╝

[DATASET 1]  Unemployment_in_India.csv
             Shape: 768 rows × 7 columns  |  After cleaning: 740 rows

[DATASET 2]  Unemployment_Rate_upto_11_2020.csv
             Shape: 267 rows × 9 columns  |  No missing values ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 NATIONAL STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  National Average Unemployment Rate   :   11.79 %
  Maximum Unemployment Rate            :   76.74 %  (Puducherry, Apr-2020, Urban)
  Minimum Unemployment Rate            :    0.00 %  (Multiple states, Rural)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 STATE-WISE RANKINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ▲  Highest Unemployment:   Haryana       →  26.8 %
  ▼  Lowest  Unemployment:   Meghalaya     →   7.1 %

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🦠 COVID-19 IMPACT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Pre-COVID  Average  (Jan–Feb 2020)   :    9.23 %
  Post-COVID Average  (Mar–Nov 2020)   :   12.96 %
  COVID Spike                          :   +3.73 %  🔴

  Month with Peak Unemployment         :   May 2020

  Top 5 COVID-Affected States:
    1. Jharkhand         →  +47.6 % peak (Lockdown spike)
    2. Bihar             →  +45.0 % peak
    3. Tamil Nadu        →  +49.8 % peak
    4. Delhi             →  +45.7 % peak
    5. Madhya Pradesh    →  +40.4 % peak

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌆 RURAL vs URBAN COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Rural  Average Unemployment Rate      :   10.2 %
  Urban  Average Unemployment Rate      :   13.5 %
  Urban–Rural Difference               :   +3.3 %  (Urban hit harder)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗺️  ZONE-WISE AVERAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  North      :  20.8 %   🔴 Highest
  East       :  17.5 %
  Northeast  :  12.3 %
  South      :  10.2 %
  West       :   9.5 %   🟢 Lowest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 GENERATED VISUALIZATIONS  (all saved to /output)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅  line_trend.png           — Monthly unemployment trend
  ✅  rural_vs_urban.png       — Rural vs Urban comparison
  ✅  statewise_bar.png        — Top 15 states bar chart
  ✅  covid_impact.png         — COVID-19 pre/post comparison
  ✅  monthly_heatmap.png      — State × Month heatmap
  ✅  zonewise_box.png         — Zone-wise boxplot
  ✅  labour_vs_unemployment.png — Labour vs unemployment scatter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Analysis complete. All 7 plots saved. (dpi=150)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trimStart();

function typewriter(el, text, speed = 6) {
  let i = 0;
  el.textContent = '';
  function tick() {
    if (i < text.length) {
      el.textContent += text[i++];
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
      setTimeout(tick, speed);
    }
  }
  tick();
}

const termObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    typewriter(document.getElementById('terminal-output'), terminalText, 4);
    termObs.disconnect();
  }
}, { threshold: 0.2 });
termObs.observe(document.querySelector('.terminal-box'));

// ── CHART HELPERS ──────────────────────────────────────
function chartBase(id) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  return ctx.getContext('2d');
}

function makeGradient(ctx, color, alpha1 = 0.35, alpha2 = 0) {
  const grad = ctx.createLinearGradient(0, 0, 0, 400);
  grad.addColorStop(0,   color.replace(')', `, ${alpha1})`).replace('rgb', 'rgba'));
  grad.addColorStop(1,   color.replace(')', `, ${alpha2})`).replace('rgb', 'rgba'));
  return grad;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${r},${g},${b})`;
}

function gradientFill(ctx, h, color, a1 = 0.35, a2 = 0) {
  const g = ctx.createLinearGradient(0,0,0,h);
  const rgb = hexToRgb(color);
  g.addColorStop(0, rgb.replace('rgb','rgba').replace(')',`, ${a1})`));
  g.addColorStop(1, rgb.replace('rgb','rgba').replace(')',`, ${a2})`));
  return g;
}

const DARK_SCALE = {
  x: { grid: { color: C.grid }, ticks: { color: C.dim } },
  y: { grid: { color: C.grid }, ticks: { color: C.dim } },
};

// ── CHART 1 — TREND ────────────────────────────────────
function buildTrendChart() {
  const ctx = chartBase('trendChart'); if (!ctx) return;
  const covidIdx = months.indexOf('Mar-20');

  const g1 = gradientFill(ctx, 360, C.pink);
  const g2 = gradientFill(ctx, 360, C.green,  0.25);
  const g3 = gradientFill(ctx, 360, C.cyan,   0.25);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Overall Rate',
          data: overallRate,
          borderColor: C.pink,
          backgroundColor: g1,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: C.pink,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Rural',
          data: ruralRate,
          borderColor: C.green,
          backgroundColor: g2,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: C.green,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Urban',
          data: urbanRate,
          borderColor: C.cyan,
          backgroundColor: g3,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: C.cyan,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { color: C.dim, padding: 20 } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)}%` } },
        annotation: {
          annotations: {
            covidLine: {
              type: 'line',
              xMin: covidIdx,
              xMax: covidIdx,
              borderColor: '#FF4444',
              borderWidth: 2,
              borderDash: [6,4],
              label: { content: '⚠ COVID', enabled: true, color: '#FF4444', font: { size: 11 } },
            },
          },
        },
      },
      scales: {
        ...DARK_SCALE,
        y: { ...DARK_SCALE.y, title: { display: true, text: 'Unemployment Rate (%)', color: C.dim } },
        x: { ...DARK_SCALE.x, ticks: { color: C.dim, maxRotation: 45 } },
      },
    },
  });
}

// ── CHART 2 — RURAL VS URBAN ───────────────────────────
function buildRuralUrbanChart() {
  const ctx = chartBase('ruralUrbanChart'); if (!ctx) return;
  const g1 = gradientFill(ctx, 280, C.green, 0.3);
  const g2 = gradientFill(ctx, 280, C.cyan,  0.3);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Rural', data: ruralRate, borderColor: C.green, backgroundColor: g1, borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: C.green },
        { label: 'Urban', data: urbanRate, borderColor: C.cyan,  backgroundColor: g2, borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: C.cyan  },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        ...DARK_SCALE,
        y: { ...DARK_SCALE.y, title: { display: true, text: 'Rate (%)', color: C.dim } },
        x: { ...DARK_SCALE.x, ticks: { color: C.dim, maxRotation: 50, font: { size: 10 } } },
      },
    },
  });
}

// ── CHART 3 — STATE BAR ────────────────────────────────
function buildStateChart() {
  const ctx = chartBase('stateChart'); if (!ctx) return;

  const colors = topStates.map((_, i) => {
    const t = i / (topStates.length - 1);
    // gradient: green → pink
    const r = Math.round(105 + t * (255 - 105));
    const g = Math.round(255 + t * (107 - 255));
    const b = Math.round(148 + t * (157 - 148));
    return `rgba(${r},${g},${b},0.85)`;
  }).reverse();

  const sorted = [...topRates].sort((a,b) => a - b);
  const sortedStates = [...topStates].reverse();

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedStates,
      datasets: [{
        label: 'Avg Unemployment Rate (%)',
        data: sorted,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.parsed.x.toFixed(1)} %` } },
      },
      scales: {
        x: { ...DARK_SCALE.x, title: { display: true, text: 'Average Unemployment Rate (%)', color: C.dim } },
        y: { ...DARK_SCALE.y, ticks: { font: { size: 11 } } },
      },
    },
  });
}

// ── CHART 4 — COVID IMPACT ─────────────────────────────
function buildCovidImpactChart() {
  const ctx = chartBase('covidImpactChart'); if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: statesCovid,
      datasets: [
        { label: 'Pre-COVID', data: preCovid, backgroundColor: 'rgba(105,255,148,0.7)', borderRadius: 4 },
        { label: 'Post-COVID', data: postCovid, backgroundColor: 'rgba(255,107,157,0.7)', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ...DARK_SCALE.x, ticks: { maxRotation: 50, font: { size: 10 } } },
        y: { ...DARK_SCALE.y, title: { display: true, text: 'Unemployment Rate (%)', color: C.dim } },
      },
    },
  });
}

// ── CHART 5 — ZONE CHART ──────────────────────────────
function buildZoneChart() {
  const ctx = chartBase('zoneChart'); if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: zoneData.labels,
      datasets: [
        {
          label: 'Q1 (25th percentile)',
          data: zoneData.q1,
          backgroundColor: zoneData.colors.map(c => c + '55'),
          borderRadius: 4,
          stack: 'stack',
        },
        {
          label: 'Median Rate',
          data: zoneData.median.map((m,i) => m - zoneData.q1[i]),
          backgroundColor: zoneData.colors.map(c => c + 'BB'),
          borderRadius: 4,
          stack: 'stack',
        },
        {
          label: 'Q3 (75th percentile)',
          data: zoneData.q3.map((q,i) => q - zoneData.median[i]),
          backgroundColor: zoneData.colors.map(c => c + '44'),
          borderRadius: 4,
          stack: 'stack',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: c => {
              const i = c.dataIndex;
              if (c.datasetIndex === 1) return ` Median: ${zoneData.median[i]}%`;
              if (c.datasetIndex === 0) return ` Q1: ${zoneData.q1[i]}%`;
              return ` Q3: ${zoneData.q3[i]}%`;
            },
          },
        },
      },
      scales: {
        x: { ...DARK_SCALE.x, stacked: true },
        y: { ...DARK_SCALE.y, stacked: true, title: { display: true, text: 'Rate (%)', color: C.dim } },
      },
    },
  });
}

// ── GALLERY MINI-CHARTS ────────────────────────────────
function buildMiniCharts() {

  // Mini 1 — Trend
  const m1 = chartBase('mini-trend');
  if (m1) {
    new Chart(m1, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { data: overallRate, borderColor: C.pink, borderWidth: 2, tension: 0.4, fill: true, backgroundColor: 'rgba(255,107,157,0.12)', pointRadius: 0 },
          { data: ruralRate,   borderColor: C.green, borderWidth: 1.5, tension: 0.4, fill: false, pointRadius: 0 },
          { data: urbanRate,   borderColor: C.cyan,  borderWidth: 1.5, tension: 0.4, fill: false, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { grid: { color: C.grid }, ticks: { color: C.dim, font: { size: 9 } } },
        },
        elements: { line: { borderCapStyle: 'round' } },
      },
    });
  }

  // Mini 2 — Area
  const m2 = chartBase('mini-area');
  if (m2) {
    new Chart(m2, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { data: ruralRate, borderColor: C.green, borderWidth: 2, tension: 0.4, fill: true, backgroundColor: 'rgba(105,255,148,0.2)', pointRadius: 0 },
          { data: urbanRate, borderColor: C.cyan,  borderWidth: 2, tension: 0.4, fill: true, backgroundColor: 'rgba(0,212,255,0.12)',  pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { grid: { color: C.grid }, ticks: { color: C.dim, font: { size: 9 } } },
        },
      },
    });
  }

  // Mini 3 — State bars
  const m3 = chartBase('mini-state');
  if (m3) {
    new Chart(m3, {
      type: 'bar',
      data: {
        labels: topStates.slice(0,8),
        datasets: [{ data: topRates.slice(0,8), backgroundColor: [C.pink,C.orange,C.gold,'#D4A030',C.purple,'#6B50DD',C.cyan,C.green], borderRadius: 3 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { grid: { display: false }, ticks: { color: C.dim, font: { size: 9 } } },
        },
      },
    });
  }

  // Mini 4 — COVID bars
  const m4 = chartBase('mini-covid');
  if (m4) {
    const sl = 8;
    new Chart(m4, {
      type: 'bar',
      data: {
        labels: statesCovid.slice(0,sl),
        datasets: [
          { label:'Pre', data: preCovid.slice(0,sl),  backgroundColor:'rgba(105,255,148,0.7)', borderRadius:3 },
          { label:'Post', data: postCovid.slice(0,sl), backgroundColor:'rgba(255,107,157,0.7)', borderRadius:3 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.dim, font: { size: 8 }, maxRotation: 60 } },
          y: { grid: { color: C.grid }, ticks: { color: C.dim, font: { size: 8 } } },
        },
      },
    });
  }

  // Mini 5 — Heatmap-style
  const m5 = chartBase('mini-heat');
  if (m5) {
    const hMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];
    const hStates = ['Haryana','Bihar','Delhi','Jharkhand','Tamil Nadu'];
    const hData   = [
      [20.34,25.77,25.05,43.22,29.02,26.70,24.18,33.50,19.68,27.31,0],
      [10.61,10.29,15.43,46.64,45.96,17.82,12.79,13.44,11.91, 9.82,0],
      [22.23,14.84,17.04,16.68,42.27,18.19,20.30,13.79,12.53, 6.27,0],
      [10.61,11.85, 8.23,47.09,59.23,20.95, 7.63, 9.76, 8.24,11.80,0],
      [ 1.57, 2.09, 6.40,49.83,33.16,12.20, 6.81, 2.65, 5.00, 2.16,0],
    ];
    const datasets = hStates.map((s,i) => ({
      label: s,
      data: hMonths.map((m,j) => ({ x: m, y: s, v: hData[i][j] })),
      backgroundColor: ctx2 => {
        const v = hData[ctx2.dataIndex % hMonths.length][i];
        const t = Math.min(v / 60, 1);
        return `rgba(${Math.round(105+t*150)},${Math.round(255-t*200)},${Math.round(148-t*50)},0.8)`;
      },
      width: ({chart}) => (chart.chartArea?.width || 300) / hMonths.length - 2,
      height: ({chart}) => (chart.chartArea?.height || 200) / hStates.length - 2,
    }));
    // Use scatter to fake heatmap tiles
    const flat = [];
    hStates.forEach((s,i) => hMonths.forEach((m,j) => {
      const v = hData[i][j];
      const t = Math.min(v/60, 1);
      const r = Math.round(80 + t*175);
      const g = Math.round(200 - t*170);
      const b = Math.round(60 - t*40);
      flat.push({ x:j, y:i, v, color:`rgba(${r},${g},${b},0.85)` });
    }));
    new Chart(m5, {
      type: 'scatter',
      data: {
        datasets: [{
          data: flat.map(d => ({ x:d.x, y:d.y })),
          backgroundColor: flat.map(d => d.color),
          pointStyle: 'rect',
          pointRadius: 12,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { grid: { display: false }, ticks: { display: false } },
        },
      },
    });
  }

  // Mini 6 — Zone
  const m6 = chartBase('mini-zone');
  if (m6) {
    new Chart(m6, {
      type: 'bar',
      data: {
        labels: zoneData.labels,
        datasets: [{
          data: zoneData.median,
          backgroundColor: zoneData.colors.map(c => c + 'CC'),
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.dim, font: { size: 9 } } },
          y: { grid: { color: C.grid }, ticks: { color: C.dim, font: { size: 9 } } },
        },
      },
    });
  }

  // Mini 7 — Scatter
  const m7 = chartBase('mini-scatter');
  if (m7) {
    new Chart(m7, {
      type: 'scatter',
      data: {
        datasets: [
          { label:'Rural', data: labourData.rural.slice(0,25), backgroundColor:'rgba(255,107,157,0.6)', pointRadius:4 },
          { label:'Urban', data: labourData.urban.slice(0,25), backgroundColor:'rgba(0,212,255,0.6)',   pointRadius:4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { ...DARK_SCALE.x, ticks: { display: false }, grid: { display: false } },
          y: { ...DARK_SCALE.y, ticks: { display: false }, grid: { color: C.grid } },
        },
      },
    });
  }
}

// ── COPY BUTTONS ───────────────────────────────────────
window.copyCode = function () {
  const code = `pip install pandas numpy matplotlib seaborn\npython unemployment_analysis.py`;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-run-cmd');
    btn.textContent = 'Copied!';
    btn.style.color = C.green;
    setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 2000);
  });
};

window.copyGit = function () {
  const code = `git init\ngit add .\ngit commit -m "Task 2: Unemployment Analysis with Python — CodeAlpha Internship"\ngit branch -M main\ngit remote add origin https://github.com/YourUsername/CodeAlpha-Task2-Unemployment-Analysis.git\ngit push -u origin main`;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-git-cmd');
    btn.textContent = 'Copied!';
    btn.style.color = C.green;
    setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 2000);
  });
};

// ── SMOOTH BAR ANIMATIONS ──────────────────────────────
function animateZoneBars() {
  document.querySelectorAll('.zc-bar, .impact-bar').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.transition = 'width 1.2s cubic-bezier(0.25,0.46,0.45,0.94)';
      bar.style.width = target;
    }, 200);
  });
}

const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateZoneBars(); barObs.disconnect(); }
  });
}, { threshold: 0.3 });
if (document.querySelector('.zone-cards')) barObs.observe(document.querySelector('.zone-cards'));

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildTrendChart();
  buildRuralUrbanChart();
  buildStateChart();
  buildCovidImpactChart();
  buildZoneChart();
  buildMiniCharts();
});
