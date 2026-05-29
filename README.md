# 📉 India Unemployment Analysis — CodeAlpha Task 2

<div align="center">

![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557c?style=for-the-badge&logo=python&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Seaborn](https://img.shields.io/badge/Seaborn-4C8CBF?style=for-the-badge&logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-69FF94?style=for-the-badge)
![Internship](https://img.shields.io/badge/CodeAlpha-May%20Batch%202026-7B61FF?style=for-the-badge)

<br/>

> **A comprehensive data-driven exploration of India's unemployment trends (2019–2020),**  
> **covering 28 states, Rural vs Urban splits, COVID-19 impact analysis, and 7 dark-themed visualizations.**

<br/>

[🌐 Live Website](#-live-demo) · [📊 Visualizations](#-visualizations) · [🚀 Quick Start](#-quick-start) · [🔍 Key Findings](#-key-findings)

</div>

---

## 📌 Project Overview

This project is **Task 2** of the **CodeAlpha Data Science Internship (May Batch 2026)**.

Using two real-world CMIE datasets on India's unemployment, this analysis:

- 📈 Tracks **monthly unemployment trends** from May 2019 to November 2020
- 🏙️ Compares **Rural vs Urban** unemployment patterns
- 🦠 Measures the **COVID-19 lockdown shock** — Pre vs Post March 2020
- 🗺️ Breaks down unemployment by **28 states** and **5 geographical zones**
- 🎨 Generates **7 premium dark-themed visualizations** using Matplotlib & Seaborn

---

## 🌐 Live Demo

The project includes a fully interactive **dark-themed website** built with HTML, CSS & Chart.js:

🔗 **[View Live Site →](https://vilashaipro.github.io/CodeAlpha_Unemployment-Analysis/)**

### Website Features
- ✅ Animated number counters on hero load
- ✅ 5 interactive Chart.js charts with hover tooltips
- ✅ Scroll-reveal animations on all cards and sections
- ✅ COVID-19 impact timeline visualization
- ✅ Zone-wise distribution breakdown
- ✅ Typewriter-animated Python output terminal
- ✅ Fully responsive — mobile, tablet, desktop

---

## 📁 Datasets Used

| Dataset | Rows | Columns | Period | Missing Values |
|---------|------|---------|--------|----------------|
| `Unemployment_in_India.csv` | 768 | 7 | May 2019 → Jun 2020 | 28 rows (dropped) |
| `Unemployment_Rate_upto_11_2020.csv` | 267 | 9 | Jan 2020 → Nov 2020 | None ✅ |

### Dataset 1 — Columns
```
Region | Date | Frequency | Estimated Unemployment Rate (%) |
Estimated Employed | Estimated Labour Participation Rate (%) | Area
```
- **Area types:** Rural | Urban
- **Regions:** 28 Indian states

### Dataset 2 — Columns
```
Region | Date | Frequency | Estimated Unemployment Rate (%) |
Estimated Employed | Estimated Labour Participation Rate (%) |
Region.1 (Zone) | longitude | latitude
```
- **Zones:** North | South | East | West | Northeast

---

## 🔍 Key Findings

| Metric | Value |
|--------|-------|
| 🇮🇳 National Average Unemployment | **11.79%** |
| 🔴 Peak Unemployment Rate | **76.74%** — Puducherry, April 2020 (Urban) |
| ⚠️ COVID Spike | **+3.73%** (9.23% → 12.96%) |
| 📅 Worst Month | **May 2020** |
| 📍 Highest State | **Haryana** (~26.8% avg) |
| ✅ Lowest State | **Meghalaya** (~7.1% avg) |
| 🌾 Rural Average | **~10.2%** |
| 🏙️ Urban Average | **~13.5%** (+3.3% vs Rural) |

### 🗺️ Zone-wise Averages

| Zone | Avg Rate | States |
|------|----------|--------|
| 🔴 North | **20.8%** | Haryana, Punjab, Delhi, Rajasthan, HP, J&K, UP, Uttarakhand |
| 🟠 East | **17.5%** | Bihar, Jharkhand, Odisha, West Bengal |
| 🟡 Northeast | **12.3%** | Assam, Meghalaya, Sikkim, Tripura |
| 🟢 South | **10.2%** | AP, Karnataka, Kerala, Tamil Nadu, Telangana, Puducherry |
| 🔵 West | **9.5%** | Gujarat, Maharashtra, Goa, Chhattisgarh, Madhya Pradesh |

### 🦠 Top 5 Most COVID-Affected States

| Rank | State | Peak Rate |
|------|-------|-----------|
| 🥇 1 | Jharkhand | +47.6% |
| 🥈 2 | Tamil Nadu | +49.8% |
| 🥉 3 | Bihar | +45.0% |
| 4 | Delhi | +45.7% |
| 5 | Madhya Pradesh | +40.4% |

---

## 📊 Visualizations

All 7 charts use a premium **dark theme** with:
- Background: `#0A0A0F` | Axes: `#12121A`
- Accent colors: `#7B61FF` · `#FF6B9D` · `#00D4FF` · `#FFB347` · `#69FF94`

| # | Plot File | Description |
|---|-----------|-------------|
| 1 | `line_trend.png` | Monthly unemployment trend with COVID-19 lockdown marker |
| 2 | `rural_vs_urban.png` | Rural vs Urban dual-line comparison over time |
| 3 | `statewise_bar.png` | Top 15 states — horizontal bar chart with color gradient |
| 4 | `covid_impact.png` | Pre vs Post COVID side-by-side bar chart per state |
| 5 | `monthly_heatmap.png` | State × Month unemployment heatmap (`YlOrRd`) |
| 6 | `zonewise_box.png` | Boxplot of unemployment distribution by zone |
| 7 | `labour_vs_unemployment.png` | Scatter plot: Labour Participation vs Unemployment + trend line |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/VilashAIPro/CodeAlpha_Unemployment-Analysis.git
cd CodeAlpha_Unemployment-Analysis
```

### 2. Install Dependencies
```bash
pip install pandas numpy matplotlib seaborn
```

### 3. Add Datasets
Place both CSV files in the project root:
```
CodeAlpha_Unemployment-Analysis/
├── Unemployment_in_India.csv
└── Unemployment_Rate_upto_11_2020.csv
```

> 📥 Download from [Kaggle — Unemployment in India](https://www.kaggle.com/datasets/gokulrajkmv/unemployment-in-india)

### 4. Run the Analysis
```bash
python unemployment_analysis.py
```

**Output:**
- ✅ 7 `.png` visualization files saved to the project folder
- ✅ Key Insights summary printed to the console

### 5. Open the Website (Optional)
```bash
# Simply open in your browser:
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

---

## 🗂️ Repository Structure

```
CodeAlpha_Unemployment-Analysis/
│
├── 📄 index.html                          # Interactive project website
├── 🎨 style.css                           # Dark theme CSS styling
├── ⚙️  script.js                           # Chart.js charts & animations
├── 🖼️  hero_banner.png                     # AI-generated hero banner
│
├── 🐍 unemployment_analysis.py            # Main Python analysis script
│
├── 📁 Unemployment_in_India.csv           # Dataset 1
├── 📁 Unemployment_Rate_upto_11_2020.csv  # Dataset 2
│
├── 📊 line_trend.png                      # Visualization 1
├── 📊 rural_vs_urban.png                  # Visualization 2
├── 📊 statewise_bar.png                   # Visualization 3
├── 📊 covid_impact.png                    # Visualization 4
├── 📊 monthly_heatmap.png                 # Visualization 5
├── 📊 zonewise_box.png                    # Visualization 6
├── 📊 labour_vs_unemployment.png          # Visualization 7
│
└── 📖 README.md                           # This file
```

---

## ⚙️ Analysis Steps (Python Script)

The `unemployment_analysis.py` script runs the following pipeline:

```
1. LOAD DATA          → Read both CSVs with pandas
2. CLEAN DATA         → Strip column spaces, parse dates, drop nulls
3. EDA                → Trend, Rural/Urban, State rankings, Zone groups
4. COVID ANALYSIS     → Pre/Post split, spike detection, top affected states
5. VISUALIZATIONS     → 7 dark-themed plots saved as PNG (dpi=150)
6. INSIGHTS SUMMARY   → Formatted print block with all key findings
```

### Technical Constraints Applied
- `matplotlib.use('Agg')` — headless mode, no display window
- `warnings.filterwarnings('ignore')` — clean output
- `dayfirst=True` — correct Indian date format (DD-MM-YYYY)
- All column names stripped of whitespace before use
- Single self-contained `.py` file — no notebooks

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| 🐍 **Python 3.x** | Core language |
| 🐼 **Pandas** | Data loading, cleaning, manipulation |
| 🔢 **NumPy** | Numerical operations & polyfit trend lines |
| 📊 **Matplotlib** | Custom dark-themed chart generation |
| 🎨 **Seaborn** | Heatmaps, boxplots & statistical styling |
| 🌐 **HTML/CSS/JS** | Interactive project website |
| 📈 **Chart.js** | Live interactive charts in the browser |
| 🗂️ **Git & GitHub** | Version control & project hosting |

---

## 📜 Data Source

> Data sourced from the **Centre for Monitoring Indian Economy (CMIE)**  
> via Kaggle: [Unemployment in India](https://www.kaggle.com/datasets/gokulrajkmv/unemployment-in-india)

---

## 🤝 Contributing

This is an internship project — contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/improve-analysis`
3. Commit your changes: `git commit -m "Add: improved zone analysis"`
4. Push & open a Pull Request

---

## 👤 Author

<div align="center">

**Vilash Kumar Reddy**  
Data Science Intern @ CodeAlpha | May Batch 2026

[![GitHub](https://img.shields.io/badge/GitHub-VilashAIPro-181717?style=flat-square&logo=github)](https://github.com/VilashAIPro)

</div>

---

## 📄 License

This project is open-source under the **MIT License** — free to use, modify, and distribute with attribution.

---

<div align="center">

Made with ❤️ and Python · CodeAlpha Data Science Internship 2026

⭐ **Star this repo** if you found it helpful!

</div>
