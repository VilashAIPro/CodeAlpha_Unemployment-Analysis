/* ══════════════════════════════════════════════════════════
   Unemployment Observatory — app.js
   Real CSV parsing + live analysis engine
   Author: Vilash Kumar Reddy | CodeAlpha Task 2
   ══════════════════════════════════════════════════════════ */

'use strict';

// ── CHART.JS THEME ─────────────────────────────────────
const YLW = '#F5C400';
const YDK = '#D4A800';
const YLT = '#FFF3B0';
const CHR = '#1C1C1E';
const GRY = '#6B6B6B';
const CRL = '#FF6B35';
const GRN = '#30D158';
const BLU = '#0A84FF';
const GRD = 'rgba(0,0,0,0.05)';

Chart.defaults.color         = GRY;
Chart.defaults.borderColor   = 'rgba(0,0,0,0.06)';
Chart.defaults.font.family   = "'Space Grotesk', sans-serif";
Chart.defaults.font.size     = 11;
Chart.defaults.plugins.tooltip.backgroundColor = CHR;
Chart.defaults.plugins.tooltip.borderColor     = YLW;
Chart.defaults.plugins.tooltip.borderWidth     = 1;
Chart.defaults.plugins.tooltip.padding         = 12;
Chart.defaults.plugins.tooltip.cornerRadius    = 10;
Chart.defaults.plugins.tooltip.titleColor      = '#FFFFFF';
Chart.defaults.plugins.tooltip.bodyColor       = 'rgba(255,255,255,0.6)';
Chart.defaults.plugins.legend.labels.usePointStyle = true;

// ── STATE ──────────────────────────────────────────────
let ds1 = null; // Dataset 1 (Unemployment_in_India.csv)
let ds2 = null; // Dataset 2 (Unemployment_Rate_upto_11_2020.csv)
let uploadCount = 0;
const charts = {};

// ── LOADER ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('fade-out'), 800);
});

// ── NAV SCROLL ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── SCROLL REVEAL ──────────────────────────────────────
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
}, { threshold: 0.08 });
function applyReveal() {
  document.querySelectorAll('.chart-panel,.kpi-card,.ig-card,.sf-card,.ct-block').forEach(el => {
    el.classList.add('reveal'); ro.observe(el);
  });
}

// ── UPLOAD ZONES ───────────────────────────────────────
function setupZone(zoneId, fileInputId, dsNum) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(fileInputId);

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, dsNum);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) handleFile(input.files[0], dsNum);
  });
}
setupZone('zone1', 'file1', 1);
setupZone('zone2', 'file2', 2);

function handleFile(file, dsNum) {
  const fillEl = document.getElementById(`fill${dsNum}`);
  const textEl = document.getElementById(`text${dsNum}`);
  const zone   = document.getElementById(`zone${dsNum}`);
  const iconEl = document.getElementById(`uz-icon${dsNum}`);

  textEl.textContent = `Parsing ${file.name}…`;
  fillEl.style.width = '30%';

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      fillEl.style.width = '100%';
      textEl.textContent = `✓ ${result.data.length} rows loaded`;
      zone.classList.add('done');
      iconEl.innerHTML = `<svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#F5C400"/>
        <path d="M20 32l10 10 14-18" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

      if (dsNum === 1) ds1 = cleanDataset1(result.data);
      if (dsNum === 2) ds2 = cleanDataset2(result.data);

      uploadCount++;
      updateUploadState();
    },
    error: () => {
      textEl.textContent = '✗ Error reading file';
      fillEl.style.background = CRL;
    }
  });
}

function updateUploadState() {
  const counter = document.getElementById('upload-counter');
  counter.textContent = `${uploadCount} / 2 files uploaded`;
  if (uploadCount >= 1) document.getElementById('an-d1') && document.querySelector('.an-d1').classList.add('done');
  if (uploadCount >= 2) document.getElementById('an-d2') && document.querySelector('.an-d2').classList.add('done');

  const btn = document.getElementById('analyse-btn');
  if (uploadCount >= 2) {
    btn.disabled = false;
    btn.querySelector('.ab-hint').textContent = 'Click to generate insights';
  } else {
    btn.querySelector('.ab-hint').textContent = `${2 - uploadCount} more file needed`;
  }
}

// ── ANALYSE BUTTON ─────────────────────────────────────
document.getElementById('analyse-btn').addEventListener('click', () => {
  if (!ds1 || !ds2) return;
  runAnalysis();
});

// ── PRINT / RESET ──────────────────────────────────────
document.getElementById('btn-print') && document.getElementById('btn-print').addEventListener('click', () => window.print());
document.getElementById('btn-reset') && document.getElementById('btn-reset').addEventListener('click', () => location.reload());

// ══════════════════════════════════════════════════════
// DATA CLEANING
// ══════════════════════════════════════════════════════

function parseDate(str) {
  if (!str) return null;
  str = str.trim();
  // DD-MM-YYYY or DD/MM/YYYY
  const parts = str.split(/[-\/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return new Date(+y, +m - 1, +d);
  }
  return new Date(str);
}

function cleanDataset1(raw) {
  return raw
    .map(row => {
      const cleaned = {};
      Object.keys(row).forEach(k => { cleaned[k.trim()] = typeof row[k] === 'string' ? row[k].trim() : row[k]; });
      return cleaned;
    })
    .filter(row => {
      const rate = parseFloat(row['Estimated Unemployment Rate (%)']);
      return row['Region'] && row['Date'] && !isNaN(rate);
    })
    .map(row => ({
      region: row['Region'],
      date:   parseDate(row['Date']),
      rate:   parseFloat(row['Estimated Unemployment Rate (%)']),
      employed: parseFloat(row['Estimated Employed']) || 0,
      labour:   parseFloat(row['Estimated Labour Participation Rate (%)']) || 0,
      area:     row['Area'] || row[' Area'] || '',
      freq:     row['Frequency'] || '',
    }))
    .filter(r => r.date && !isNaN(r.date.getTime()));
}

function cleanDataset2(raw) {
  return raw
    .map(row => {
      const cleaned = {};
      Object.keys(row).forEach(k => { cleaned[k.trim()] = typeof row[k] === 'string' ? row[k].trim() : row[k]; });
      return cleaned;
    })
    .filter(row => row['Region'] && row['Date'])
    .map(row => {
      // Dataset 2 has duplicate "Region" col — pandas renames 2nd to "Region.1"
      const keys = Object.keys(row);
      // find zone column (second Region or Region.1)
      const zoneKey = keys.find(k => k === 'Region.1') ||
                      keys.filter(k => k.startsWith('Region'))[1] ||
                      keys.find(k => ['North','South','East','West','Northeast'].includes(row[k]));
      return {
        region:  row['Region'],
        date:    parseDate(row['Date']),
        rate:    parseFloat(row['Estimated Unemployment Rate (%)']) || 0,
        employed:parseFloat(row['Estimated Employed']) || 0,
        labour:  parseFloat(row['Estimated Labour Participation Rate (%)']) || 0,
        zone:    zoneKey ? row[zoneKey] : guessZone(row['Region']),
        lng:     parseFloat(row['longitude']) || 0,
        lat:     parseFloat(row['latitude'])  || 0,
      };
    })
    .filter(r => r.date && !isNaN(r.date.getTime()));
}

function guessZone(region) {
  const map = {
    North:     ['Haryana','Punjab','Delhi','Rajasthan','Himachal Pradesh','Jammu & Kashmir','Uttar Pradesh','Uttarakhand','Chandigarh'],
    South:     ['Andhra Pradesh','Karnataka','Kerala','Tamil Nadu','Telangana','Puducherry'],
    East:      ['Bihar','Jharkhand','Odisha','West Bengal'],
    West:      ['Gujarat','Maharashtra','Goa','Chhattisgarh','Madhya Pradesh'],
    Northeast: ['Assam','Meghalaya','Sikkim','Tripura','Manipur','Mizoram','Nagaland','Arunachal Pradesh'],
  };
  for (const [z, states] of Object.entries(map)) {
    if (states.some(s => region.includes(s) || s.includes(region))) return z;
  }
  return 'Other';
}

// ══════════════════════════════════════════════════════
// ANALYSIS ENGINE
// ══════════════════════════════════════════════════════

function runAnalysis() {
  const overlay = document.getElementById('processing-overlay');
  overlay.classList.remove('hidden');
  const steps = ['pstep1','pstep2','pstep3','pstep4','pstep5','pstep6'];

  function stepDone(idx) {
    document.getElementById(steps[idx]).classList.remove('active');
    document.getElementById(steps[idx]).classList.add('done');
    if (idx + 1 < steps.length) document.getElementById(steps[idx+1]).classList.add('active');
  }

  setTimeout(() => { stepDone(0); }, 300);
  setTimeout(() => { stepDone(1); }, 700);
  setTimeout(() => {
    const stats = computeStats();
    stepDone(2);
    setTimeout(() => {
      stepDone(3);
      setTimeout(() => {
        renderDashboard(stats);
        stepDone(4);
        setTimeout(() => {
          stepDone(5);
          setTimeout(() => {
            overlay.classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            applyReveal();
            document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
          }, 600);
        }, 800);
      }, 600);
    }, 500);
  }, 1000);
}

function computeStats() {
  const rates = ds1.map(r => r.rate);
  const nationalAvg  = mean(rates);
  const nationalMax  = Math.max(...rates);
  const nationalMin  = Math.min(...rates);
  const peakRow      = ds1.reduce((a,b) => b.rate > a.rate ? b : a);

  // Rural vs Urban
  const rural = ds1.filter(r => r.area.toLowerCase().includes('rural'));
  const urban = ds1.filter(r => r.area.toLowerCase().includes('urban'));
  const ruralAvg = mean(rural.map(r => r.rate));
  const urbanAvg = mean(urban.map(r => r.rate));

  // Monthly trend (mean per month-year)
  const byMonth = groupBy(ds1, r => `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}`);
  const monthlyLabels = Object.keys(byMonth).sort();
  const monthlyRates  = monthlyLabels.map(k => mean(byMonth[k].map(r => r.rate)));
  const monthlyRural  = monthlyLabels.map(k => mean(byMonth[k].filter(r=>r.area.toLowerCase().includes('rural')).map(r=>r.rate)));
  const monthlyUrban  = monthlyLabels.map(k => mean(byMonth[k].filter(r=>r.area.toLowerCase().includes('urban')).map(r=>r.rate)));

  // State-wise averages (ds1)
  const byState = groupBy(ds1, r => r.region);
  const stateAvgs = Object.entries(byState)
    .map(([s, rows]) => ({ state:s, avg: mean(rows.map(r=>r.rate)) }))
    .sort((a,b) => b.avg - a.avg);

  // COVID split (ds2: March 2020 boundary)
  const covidCut   = new Date(2020, 2, 1); // March 1 2020
  const preCovid   = ds2.filter(r => r.date < covidCut);
  const postCovid  = ds2.filter(r => r.date >= covidCut);
  const preAvg     = mean(preCovid.map(r=>r.rate));
  const postAvg    = mean(postCovid.map(r=>r.rate));

  // States COVID impact (avg post - avg pre per state)
  const ds2ByState = groupBy(ds2, r=>r.region);
  const covidImpact = Object.entries(ds2ByState).map(([s,rows]) => {
    const pre  = mean(rows.filter(r=>r.date<covidCut).map(r=>r.rate));
    const post = mean(rows.filter(r=>r.date>=covidCut).map(r=>r.rate));
    return { state:s, pre: isNaN(pre)?0:pre, post: isNaN(post)?0:post, delta: isNaN(post-pre)?0:(post-pre) };
  }).sort((a,b)=>b.delta-a.delta);

  // Peak month (ds2)
  const byMonthDs2 = groupBy(ds2, r => `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}`);
  let peakMonth = '', peakMonthRate = 0;
  Object.entries(byMonthDs2).forEach(([k,rows]) => {
    const avg = mean(rows.map(r=>r.rate));
    if (avg > peakMonthRate) { peakMonthRate = avg; peakMonth = k; }
  });

  // Zone-wise (ds2)
  const byZone = groupBy(ds2, r=>r.zone);
  const zoneStats = Object.entries(byZone).map(([z,rows]) => ({
    zone:z, avg:mean(rows.map(r=>r.rate)),
    min:Math.min(...rows.map(r=>r.rate)),
    max:Math.max(...rows.map(r=>r.rate)),
  })).sort((a,b)=>b.avg-a.avg);

  // Labour scatter
  const scatterRural = ds1.filter(r=>r.area.toLowerCase().includes('rural') && r.labour>0);
  const scatterUrban = ds1.filter(r=>r.area.toLowerCase().includes('urban') && r.labour>0);

  // Monthly heatmap — top 8 states × months (ds2)
  const top8States = stateAvgs.slice(0,8).map(s=>s.state);
  const heatMonths = Object.keys(byMonthDs2).sort().slice(0,11); // Jan-Nov 2020
  const heatData   = top8States.map(state =>
    heatMonths.map(mo => {
      const rows = (byMonthDs2[mo]||[]).filter(r=>r.region===state);
      return rows.length ? mean(rows.map(r=>r.rate)) : 0;
    })
  );

  return {
    nationalAvg, nationalMax, nationalMin,
    peakRow, ruralAvg, urbanAvg,
    monthlyLabels, monthlyRates, monthlyRural, monthlyUrban,
    stateAvgs, byState,
    preAvg, postAvg, covidImpact,
    peakMonth, peakMonthRate,
    zoneStats, byZone,
    scatterRural, scatterUrban,
    top8States, heatMonths, heatData,
    ds1Total: ds1.length, ds2Total: ds2.length,
  };
}

// ══════════════════════════════════════════════════════
// RENDER DASHBOARD
// ══════════════════════════════════════════════════════

function renderDashboard(s) {
  renderKPI(s);
  renderTrendChart(s);
  renderAreaChart(s);
  renderAreaCallout(s);
  renderStateChart(s);
  renderStateFacts(s);
  renderCovidTimeline(s);
  renderCovidChart(s);
  renderZoneChart(s);
  renderScatterChart(s);
  renderHeatChart(s);
  renderInsights(s);
}

// ── KPI STRIP ──────────────────────────────────────────
function renderKPI(s) {
  const fmtMonth = mo => {
    if (!mo) return 'N/A';
    const [y,m] = mo.split('-');
    return new Date(+y, +m-1).toLocaleString('default',{month:'short',year:'numeric'});
  };

  const kpis = [
    { label:'National Avg Rate',   val:s.nationalAvg.toFixed(2)+'%', sub:`From ${s.ds1Total} data points`, tag:null },
    { label:'Peak Rate',           val:s.nationalMax.toFixed(2)+'%', sub:s.peakRow.region+' · '+fmtDate(s.peakRow.date), tag:{text:'COVID Spike',cls:'up'} },
    { label:'Rural Average',       val:s.ruralAvg.toFixed(2)+'%',   sub:'All states combined', tag:null },
    { label:'Urban Average',       val:s.urbanAvg.toFixed(2)+'%',   sub:'All states combined', tag:{text:'+'+(s.urbanAvg-s.ruralAvg).toFixed(2)+'% vs Rural',cls:'up'} },
    { label:'Pre-COVID Avg',       val:s.preAvg.toFixed(2)+'%',     sub:'Jan–Feb 2020 (Dataset 2)', tag:{text:'Lower',cls:'down'} },
    { label:'Post-COVID Avg',      val:s.postAvg.toFixed(2)+'%',    sub:'Mar–Nov 2020 (Dataset 2)', tag:{text:'+'+(s.postAvg-s.preAvg).toFixed(2)+'% jump',cls:'up'} },
    { label:'Peak Unemployment Month', val:fmtMonth(s.peakMonth), sub:s.peakMonthRate.toFixed(1)+'% avg that month', tag:null },
    { label:'States Analyzed',     val:s.stateAvgs.length+'',      sub:`Dataset 1 regions`, tag:null },
  ];

  document.getElementById('kpi-strip').innerHTML = kpis.map(k => `
    <div class="kpi-card reveal">
      <div class="kc-label">${k.label}</div>
      <div class="kc-val">${k.val}</div>
      ${k.sub  ? `<div class="kc-sub">${k.sub}</div>` : ''}
      ${k.tag  ? `<span class="kc-tag ${k.tag.cls}">${k.tag.text}</span>` : ''}
    </div>
  `).join('');
}

// ── TREND CHART ────────────────────────────────────────
function renderTrendChart(s) {
  const ctx = document.getElementById('chartTrend').getContext('2d');
  const labels = s.monthlyLabels.map(l => fmtMonthLabel(l));
  const covidIdx = s.monthlyLabels.findIndex(l => l >= '2020-03');

  const gOverall = ctx.createLinearGradient(0,0,0,300);
  gOverall.addColorStop(0, 'rgba(245,196,0,0.3)');
  gOverall.addColorStop(1, 'rgba(245,196,0,0)');

  charts.trend = new Chart(ctx, {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'National Avg', data:s.monthlyRates, borderColor:YLW, backgroundColor:gOverall, borderWidth:3, tension:0.4, fill:true, pointRadius:4, pointBackgroundColor:YLW, pointBorderColor:'#fff', pointBorderWidth:2 },
        { label:'Rural',        data:s.monthlyRural, borderColor:GRN, borderWidth:2, tension:0.4, fill:false, pointRadius:3, pointBackgroundColor:GRN },
        { label:'Urban',        data:s.monthlyUrban, borderColor:CRL, borderWidth:2, tension:0.4, fill:false, pointRadius:3, pointBackgroundColor:CRL },
      ],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label:c=>` ${c.dataset.label}: ${c.parsed.y.toFixed(1)}%` } },
        annotation: covidIdx >= 0 ? {
          annotations:{
            covid:{
              type:'line', xMin:covidIdx, xMax:covidIdx,
              borderColor:CRL, borderWidth:2, borderDash:[6,4],
              label:{
                content:'⚠ COVID-19 Lockdown', enabled:true,
                position:'start', color:CRL,
                backgroundColor:'rgba(255,107,53,0.1)',
                font:{size:11,weight:'bold'},
              },
            },
          },
        } : {},
      },
      scales:{
        x:{ grid:{color:GRD}, ticks:{color:GRY, maxRotation:45} },
        y:{ grid:{color:GRD}, ticks:{color:GRY, callback:v=>v+'%'}, title:{display:true,text:'Unemployment Rate (%)',color:GRY} },
      },
    },
  });

  // Legend
  document.getElementById('legend-trend').innerHTML = [
    {c:YLW,l:'National'},{c:GRN,l:'Rural'},{c:CRL,l:'Urban'}
  ].map(i=>`<div class="legend-item"><span class="legend-dot" style="background:${i.c}"></span>${i.l}</div>`).join('');
}

// ── AREA CHART ─────────────────────────────────────────
function renderAreaChart(s) {
  const ctx = document.getElementById('chartArea').getContext('2d');
  const labels = s.monthlyLabels.map(l => fmtMonthLabel(l));

  charts.area = new Chart(ctx, {
    type:'bar',
    data:{
      labels,
      datasets:[
        { label:'Rural', data:s.monthlyRural, backgroundColor:'rgba(48,209,88,0.7)', borderRadius:4, borderSkipped:false },
        { label:'Urban', data:s.monthlyUrban, backgroundColor:'rgba(255,107,53,0.7)', borderRadius:4, borderSkipped:false },
      ],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{ legend:{ position:'top', labels:{color:GRY,boxWidth:10} } },
      scales:{
        x:{ grid:{display:false}, ticks:{color:GRY, maxRotation:50, font:{size:9}} },
        y:{ grid:{color:GRD}, ticks:{color:GRY,callback:v=>v+'%'} },
      },
    },
  });
}

function renderAreaCallout(s) {
  document.getElementById('area-callout').innerHTML = `
    <div class="ac-item">
      <div class="ac-emoji">🌾</div>
      <div class="ac-label">Rural Avg</div>
      <div class="ac-val" style="color:${GRN}">${s.ruralAvg.toFixed(2)}%</div>
    </div>
    <div class="ac-item">
      <div class="ac-emoji">🏙️</div>
      <div class="ac-label">Urban Avg</div>
      <div class="ac-val" style="color:${CRL}">${s.urbanAvg.toFixed(2)}%</div>
    </div>
  `;
}

// ── STATE CHART ────────────────────────────────────────
function renderStateChart(s) {
  const top15 = s.stateAvgs.slice(0,15).reverse();
  const ctx = document.getElementById('chartStates').getContext('2d');

  const colors = top15.map((_,i) => {
    const t = i / (top15.length - 1);
    const r = Math.round(48  + t*(245-48));
    const g = Math.round(209 + t*(196-209));
    const b = Math.round(88  + t*(0-88));
    return `rgba(${r},${g},${b},0.85)`;
  });

  charts.states = new Chart(ctx, {
    type:'bar',
    data:{
      labels:top15.map(s=>s.state),
      datasets:[{ label:'Avg Unemployment %', data:top15.map(s=>s.avg), backgroundColor:colors, borderRadius:6, borderSkipped:false }],
    },
    options:{
      indexAxis:'y',
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{ callbacks:{ label:c=>` ${c.parsed.x.toFixed(2)}%` } },
      },
      scales:{
        x:{ grid:{color:GRD}, ticks:{color:GRY,callback:v=>v+'%'}, title:{display:true,text:'Average Unemployment Rate (%)',color:GRY} },
        y:{ grid:{display:false}, ticks:{color:CHR,font:{size:11}} },
      },
    },
  });
}

function renderStateFacts(s) {
  const top5   = s.stateAvgs.slice(0,5);
  const maxAvg = top5[0].avg;
  document.getElementById('state-facts').innerHTML = `
    <div class="sf-header">Top 5 States</div>
    ${top5.map((st,i)=>`
      <div class="sf-card reveal">
        <span class="sf-rank">#${i+1}</span>
        <span class="sf-name">${st.state}</span>
        <div class="sf-bar-wrap"><div class="sf-bar" style="width:${(st.avg/maxAvg*100).toFixed(0)}%"></div></div>
        <span class="sf-val">${st.avg.toFixed(1)}%</span>
      </div>
    `).join('')}
    <div class="sf-header" style="margin-top:8px">3 Lowest States</div>
    ${s.stateAvgs.slice(-3).reverse().map((st,i)=>`
      <div class="sf-card reveal" style="border-left:3px solid ${GRN}">
        <span class="sf-rank" style="color:${GRN}">✓</span>
        <span class="sf-name">${st.state}</span>
        <div class="sf-bar-wrap"><div class="sf-bar" style="width:${(st.avg/maxAvg*100).toFixed(0)}%;background:${GRN}"></div></div>
        <span class="sf-val" style="color:${GRN}">${st.avg.toFixed(1)}%</span>
      </div>
    `).join('')}
  `;
}

// ── COVID TIMELINE ─────────────────────────────────────
function renderCovidTimeline(s) {
  document.getElementById('covid-timeline').innerHTML = `
    <div class="ct-block ct-pre">
      <div class="ct-period">Jan – Feb 2020</div>
      <div class="ct-rate">${s.preAvg.toFixed(2)}%</div>
      <div class="ct-desc">Pre-COVID Average</div>
    </div>
    <div class="ct-block ct-arrow ct-highlight">
      <div class="ct-period">March 2020</div>
      <div class="ct-rate">+${(s.postAvg-s.preAvg).toFixed(2)}%</div>
      <div class="ct-desc">⚠ Lockdown Begins — Unemployment Surges</div>
    </div>
    <div class="ct-block ct-post">
      <div class="ct-period">Mar – Nov 2020</div>
      <div class="ct-rate">${s.postAvg.toFixed(2)}%</div>
      <div class="ct-desc">Post-COVID Average</div>
    </div>
    <div class="ct-block">
      <div class="ct-period">Peak Month</div>
      <div class="ct-rate" style="color:${YDK}">${fmtMonthLabel(s.peakMonth)}</div>
      <div class="ct-desc">${s.peakMonthRate.toFixed(1)}% national avg</div>
    </div>
  `;
}

// ── COVID IMPACT CHART ─────────────────────────────────
function renderCovidChart(s) {
  const ctx = document.getElementById('chartCovid').getContext('2d');
  const top = s.covidImpact.slice(0,12);

  charts.covid = new Chart(ctx, {
    type:'bar',
    data:{
      labels:top.map(t=>t.state),
      datasets:[
        { label:'Pre-COVID', data:top.map(t=>t.pre),  backgroundColor:'rgba(48,209,88,0.75)', borderRadius:4 },
        { label:'Post-COVID',data:top.map(t=>t.post), backgroundColor:'rgba(255,107,53,0.75)', borderRadius:4 },
      ],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ position:'top', labels:{color:CHR} },
        tooltip:{ callbacks:{ label:c=>` ${c.dataset.label}: ${c.parsed.y.toFixed(1)}%` } },
      },
      scales:{
        x:{ grid:{display:false}, ticks:{color:GRY,maxRotation:50,font:{size:9}} },
        y:{ grid:{color:GRD}, ticks:{color:GRY,callback:v=>v+'%'} },
      },
    },
  });
}

// ── ZONE CHART ─────────────────────────────────────────
function renderZoneChart(s) {
  const ctx = document.getElementById('chartZone').getContext('2d');
  const zColors = { North:BLU, South:GRN, East:YLW, West:CRL, Northeast:'#BF5AF2', Other:'#636366' };

  charts.zone = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:s.zoneStats.map(z=>z.zone),
      datasets:[{
        data:s.zoneStats.map(z=>z.avg),
        backgroundColor:s.zoneStats.map(z=>zColors[z.zone]||'#636366'),
        borderWidth:3, borderColor:'#FFFDF5',
        hoverOffset:8,
      }],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:'60%',
      plugins:{
        legend:{ position:'right', labels:{color:CHR,padding:16,font:{size:12}} },
        tooltip:{ callbacks:{ label:c=>`${c.label}: ${c.parsed.toFixed(1)}%` } },
      },
    },
  });
}

// ── SCATTER CHART ──────────────────────────────────────
function renderScatterChart(s) {
  const ctx = document.getElementById('chartScatter').getContext('2d');

  // Trend line via least squares
  function trendLine(pts) {
    const n=pts.length, sx=pts.reduce((a,p)=>a+p.x,0), sy=pts.reduce((a,p)=>a+p.y,0);
    const sxy=pts.reduce((a,p)=>a+p.x*p.y,0), sxx=pts.reduce((a,p)=>a+p.x*p.x,0);
    const m=(n*sxy-sx*sy)/(n*sxx-sx*sx);
    const b=(sy-m*sx)/n;
    const xs=[Math.min(...pts.map(p=>p.x)), Math.max(...pts.map(p=>p.x))];
    return xs.map(x=>({ x, y: m*x+b }));
  }

  const rd = s.scatterRural.slice(0,80).map(r=>({ x:r.labour, y:r.rate }));
  const ud = s.scatterUrban.slice(0,80).map(r=>({ x:r.labour, y:r.rate }));
  const rtl = rd.length > 2 ? trendLine(rd) : [];
  const utl = ud.length > 2 ? trendLine(ud) : [];

  charts.scatter = new Chart(ctx, {
    type:'scatter',
    data:{
      datasets:[
        { label:'Rural', data:rd, backgroundColor:'rgba(48,209,88,0.5)', pointRadius:4 },
        { label:'Urban', data:ud, backgroundColor:'rgba(255,107,53,0.5)', pointRadius:4 },
        ...(rtl.length ? [{ label:'Rural Trend', data:rtl, type:'line', borderColor:GRN, borderWidth:2, pointRadius:0, fill:false }] : []),
        ...(utl.length ? [{ label:'Urban Trend', data:utl, type:'line', borderColor:CRL, borderWidth:2, pointRadius:0, fill:false }] : []),
      ],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{color:CHR} } },
      scales:{
        x:{ grid:{color:GRD}, ticks:{color:GRY}, title:{display:true,text:'Labour Participation Rate (%)',color:GRY} },
        y:{ grid:{color:GRD}, ticks:{color:GRY}, title:{display:true,text:'Unemployment Rate (%)',color:GRY} },
      },
    },
  });
}

// ── HEATMAP (scatter tiles) ────────────────────────────
function renderHeatChart(s) {
  const ctx = document.getElementById('chartHeat').getContext('2d');
  const flatPts = [], flatColors = [];

  s.top8States.forEach((state, si) => {
    s.heatMonths.forEach((mo, mi) => {
      const v = s.heatData[si][mi];
      const t = Math.min(v / 70, 1);
      // Yellow → Orange → Red
      const r = Math.round(245 + t*(220-245));
      const g = Math.round(196 + t*(0-196));
      const b = Math.round(0);
      flatPts.push({ x: mi, y: si, v });
      flatColors.push(`rgba(${r},${g},${b},0.85)`);
    });
  });

  charts.heat = new Chart(ctx, {
    type:'scatter',
    data:{
      datasets:[{
        data: flatPts.map(p=>({ x:p.x, y:p.y })),
        backgroundColor: flatColors,
        pointStyle: 'rect',
        pointRadius: 16,
        pointHoverRadius: 18,
      }],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ display:false },
        tooltip:{
          callbacks:{
            title: items => {
              const {x,y} = items[0].parsed;
              return `${s.top8States[y] || ''} · ${fmtMonthLabel(s.heatMonths[x]||'')}`;
            },
            label: item => {
              const {x,y} = item.parsed;
              const v = s.heatData[y]?.[x];
              return ` Rate: ${v != null ? v.toFixed(1)+'%' : 'N/A'}`;
            },
          },
        },
      },
      scales:{
        x:{
          min:-0.5, max:s.heatMonths.length-0.5,
          grid:{display:false},
          ticks:{
            stepSize:1,
            callback: v => fmtMonthLabel(s.heatMonths[v]||''),
            color:GRY, font:{size:9}, maxRotation:45,
          },
        },
        y:{
          min:-0.5, max:s.top8States.length-0.5,
          grid:{display:false},
          ticks:{
            stepSize:1,
            callback: v => s.top8States[v] || '',
            color:CHR, font:{size:10},
          },
        },
      },
    },
  });
}

// ── INSIGHTS ───────────────────────────────────────────
function renderInsights(s) {
  const diff = s.urbanAvg - s.ruralAvg;
  const highest = s.stateAvgs[0];
  const lowest  = s.stateAvgs[s.stateAvgs.length-1];
  const covidJump = s.postAvg - s.preAvg;
  const top3Covid = s.covidImpact.slice(0,3).map(t=>t.state).join(', ');

  const cards = [
    { icon:'🇮🇳', title:'National Average', text:`India's average unemployment rate stands at <span class="ig-highlight">${s.nationalAvg.toFixed(2)}%</span> across ${s.stateAvgs.length} states and ${s.ds1Total} monthly data points from 2019–2020.` },
    { icon:'🌾', title:'Rural vs Urban Gap', text:`Urban areas averaged <span class="ig-highlight">${s.urbanAvg.toFixed(2)}%</span> unemployment vs rural <span class="ig-highlight">${s.ruralAvg.toFixed(2)}%</span> — a gap of <span class="ig-highlight">${diff.toFixed(2)}%</span>, showing urban economies were hit harder.` },
    { icon:'📍', title:'Highest & Lowest State', text:`<span class="ig-highlight">${highest.state}</span> leads with ${highest.avg.toFixed(1)}% average, while <span class="ig-highlight">${lowest.state}</span> had the lowest at just ${lowest.avg.toFixed(1)}% — a ${(highest.avg-lowest.avg).toFixed(1)}% spread.` },
    { icon:'🦠', title:'COVID-19 Shock', text:`The national average jumped from <span class="ig-highlight">${s.preAvg.toFixed(2)}%</span> pre-lockdown to <span class="ig-highlight">${s.postAvg.toFixed(2)}%</span> post-lockdown — a surge of <span class="ig-highlight">+${covidJump.toFixed(2)}%</span> within weeks.` },
    { icon:'📅', title:'Peak Month', text:`<span class="ig-highlight">${fmtMonthLabel(s.peakMonth)}</span> recorded the highest national average unemployment of <span class="ig-highlight">${s.peakMonthRate.toFixed(1)}%</span> — the deepest point of the COVID economic crisis.` },
    { icon:'🗺️', title:'Worst-Affected Regions', text:`States <span class="ig-highlight">${top3Covid}</span> saw the largest absolute COVID-19 unemployment surges based on pre vs post-lockdown comparisons from Dataset 2.` },
  ];

  document.getElementById('insights-grid').innerHTML = cards.map(c=>`
    <div class="ig-card reveal">
      <div class="ig-icon">${c.icon}</div>
      <div class="ig-title">${c.title}</div>
      <div class="ig-text">${c.text}</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════

function mean(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const k = fn(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

function fmtDate(d) {
  if (!d) return '';
  return d.toLocaleString('default',{month:'short',year:'numeric'});
}

function fmtMonthLabel(str) {
  if (!str) return '';
  const [y,m] = str.split('-');
  if (!y || !m) return str;
  return new Date(+y,+m-1).toLocaleString('default',{month:'short',year:'2-digit'});
}
