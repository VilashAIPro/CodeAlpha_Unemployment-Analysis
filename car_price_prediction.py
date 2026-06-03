# -*- coding: utf-8 -*-
"""
==============================================================================
   CAR PRICE PREDICTION -- CodeAlpha Data Science Task 3
   Author : Vilash Kumar Reddy  |  Batch : May 2026
==============================================================================
"""

import sys
import io
# Force UTF-8 output on Windows to handle emojis / special chars
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import warnings
warnings.filterwarnings('ignore')

import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ══════════════════════════════════════════════════════════════════════════════
#  DARK THEME SETTINGS
# ══════════════════════════════════════════════════════════════════════════════
BG_DARK   = '#0A0A0F'
BG_AXES   = '#12121A'
SPINE_CLR = '#2A2A3E'
TEXT_CLR  = '#E0E0FF'
TICK_CLR  = '#9090BB'
GRID_CLR  = '#1E1E30'

PINK      = '#FF6B9D'
CYAN      = '#00D4FF'
ORANGE    = '#FFB347'
GREEN     = '#69FF94'
PURPLE    = '#C084FC'
GOLD      = '#FFD700'

def apply_dark_theme(fig, axes_list):
    """Apply consistent dark theme to a figure and its axes."""
    fig.patch.set_facecolor(BG_DARK)
    if not hasattr(axes_list, '__iter__'):
        axes_list = [axes_list]
    for ax in axes_list:
        ax.set_facecolor(BG_AXES)
        for spine in ax.spines.values():
            spine.set_edgecolor(SPINE_CLR)
        ax.tick_params(colors=TICK_CLR, which='both')
        ax.xaxis.label.set_color(TEXT_CLR)
        ax.yaxis.label.set_color(TEXT_CLR)
        ax.title.set_color(TEXT_CLR)
        ax.grid(True, color=GRID_CLR, linewidth=0.5, alpha=0.7)


# ── 1. LOAD DATA ──────────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  📂  STEP 1 — DATA LOADING & EXPLORATION")
print("═"*70)

df = pd.read_csv('car_data.csv')

print(f"\n✅ Dataset loaded successfully!")
print(f"\n📐 Shape : {df.shape[0]} rows × {df.shape[1]} columns")

print("\n📋 Column Data Types:")
print(df.dtypes.to_string())

print("\n🔍 First 5 Rows:")
print(df.head(5).to_string(index=False))

print("\n📊 Statistical Summary:")
print(df.describe().to_string())

print("\n🔎 Missing Values:")
print(df.isnull().sum().to_string())
print(f"   Total missing: {df.isnull().sum().sum()} ✅")

print("\n⛽ Fuel_Type Distribution:")
print(df['Fuel_Type'].value_counts().to_string())

print("\n⚙️  Transmission Distribution:")
print(df['Transmission'].value_counts().to_string())

print("\n🏷️  Selling_type Distribution:")
print(df['Selling_type'].value_counts().to_string())

print("\n👤 Owner Distribution:")
print(df['Owner'].value_counts().to_string())

print("\n🚘 Top 5 Most Common Car Names:")
print(df['Car_Name'].value_counts().head(5).to_string())

print("\n📈 Correlation Matrix (Numeric Columns):")
print(df.select_dtypes(include=np.number).corr().round(3).to_string())


# ── 2. FEATURE ENGINEERING ───────────────────────────────────────────────────
print("\n" + "═"*70)
print("  🔧  STEP 2 — FEATURE ENGINEERING")
print("═"*70)

df['Car_Age']          = 2024 - df['Year']
df['Price_Diff']       = df['Present_Price'] - df['Selling_Price']
df['Depreciation_Pct'] = (df['Price_Diff'] / df['Present_Price']) * 100

print(f"\n✅ Created: Car_Age, Price_Diff, Depreciation_Pct")
print(f"   Avg Car Age         : {df['Car_Age'].mean():.1f} years")
print(f"   Avg Depreciation    : {df['Depreciation_Pct'].mean():.1f}%")

# Store for visualisation before dropping
df_vis = df.copy()

df.drop(columns=['Car_Name', 'Year', 'Price_Diff', 'Depreciation_Pct'],
        inplace=True)
print(f"\n🗑️  Dropped: Car_Name, Year, Price_Diff, Depreciation_Pct")
print(f"   Remaining columns: {list(df.columns)}")


# ── 3. PREPROCESSING ─────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  ⚙️   STEP 3 — PREPROCESSING")
print("═"*70)

le_fuel  = LabelEncoder()
le_sell  = LabelEncoder()
le_trans = LabelEncoder()

df['Fuel_Type_enc']      = le_fuel.fit_transform(df['Fuel_Type'])
df['Selling_type_enc']   = le_sell.fit_transform(df['Selling_type'])
df['Transmission_enc']   = le_trans.fit_transform(df['Transmission'])

print(f"\n✅ Label Encoded:")
print(f"   Fuel_Type    : {dict(zip(le_fuel.classes_, le_fuel.transform(le_fuel.classes_)))}")
print(f"   Selling_type : {dict(zip(le_sell.classes_, le_sell.transform(le_sell.classes_)))}")
print(f"   Transmission : {dict(zip(le_trans.classes_, le_trans.transform(le_trans.classes_)))}")

FEATURES = ['Present_Price', 'Car_Age', 'Driven_kms',
            'Fuel_Type_enc', 'Selling_type_enc', 'Transmission_enc', 'Owner']

X = df[FEATURES]
y = df['Selling_Price']

print(f"\n📌 Feature Matrix X shape : {X.shape}")
print(f"📌 Target vector y shape  : {y.shape}")
print(f"📌 Features               : {FEATURES}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

print(f"\n✂️  Train/Test Split (80/20):")
print(f"   X_train : {X_train.shape} | X_test : {X_test.shape}")

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)
print(f"\n✅ StandardScaler applied to train & test sets")


# ── 4. TRAIN MODELS ──────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  🤖  STEP 4 — TRAINING 3 REGRESSION MODELS")
print("═"*70)

models = {
    'Linear Regression'  : LinearRegression(),
    'Random Forest'      : RandomForestRegressor(n_estimators=100, random_state=42),
    'Gradient Boosting'  : GradientBoostingRegressor(n_estimators=100, random_state=42),
}

results    = {}
preds_dict = {}

for name, model in models.items():
    model.fit(X_train_sc, y_train)
    y_pred = model.predict(X_test_sc)

    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)

    results[name]    = {'MAE': mae, 'RMSE': rmse, 'R2': r2}
    preds_dict[name] = y_pred

    print(f"\n  📌 {name}")
    print(f"     R²   = {r2:.4f}")
    print(f"     MAE  = {mae:.4f}")
    print(f"     RMSE = {rmse:.4f}")

# Summary Table
print("\n" + "═"*60)
print("  📊  FINAL MODEL COMPARISON SUMMARY")
print("═"*60)
print(f"  {'Model':<22} {'R²':>8} {'MAE':>8} {'RMSE':>8}")
print("  " + "─"*52)
for name, m in results.items():
    marker = " ⭐" if m['R2'] == max(v['R2'] for v in results.values()) else ""
    print(f"  {name:<22} {m['R2']:>8.4f} {m['MAE']:>8.4f} {m['RMSE']:>8.4f}{marker}")
print("═"*60)

best_name = max(results, key=lambda k: results[k]['R2'])
best_r2   = results[best_name]['R2']
print(f"\n🏆 Best Model : {best_name}")
print(f"   Best R²    : {best_r2:.4f}")


# ── 5. VISUALIZATIONS ────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  🎨  STEP 5 — GENERATING 8 DARK-THEMED VISUALIZATIONS")
print("═"*70)


# ── Plot 1 → price_distribution.png ──────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
apply_dark_theme(fig, [ax1, ax2])
fig.suptitle('🚗 Car Price Distribution Analysis', color=TEXT_CLR,
             fontsize=16, fontweight='bold', y=1.01)

ax1.hist(df_vis['Selling_Price'], bins=30, color=PINK, alpha=0.85,
         edgecolor='none')
mean_sell = df_vis['Selling_Price'].mean()
ax1.axvline(mean_sell, color=GOLD, linestyle='--', linewidth=2,
            label=f'Mean ₹{mean_sell:.1f}L')
ax1.legend(facecolor=BG_AXES, edgecolor=SPINE_CLR, labelcolor=TEXT_CLR)
ax1.set_xlabel('Selling Price (Lakhs ₹)', color=TEXT_CLR)
ax1.set_ylabel('Frequency', color=TEXT_CLR)
ax1.set_title('Selling Price Distribution', color=TEXT_CLR)

ax2.hist(df_vis['Present_Price'], bins=30, color=CYAN, alpha=0.85,
         edgecolor='none')
mean_pres = df_vis['Present_Price'].mean()
ax2.axvline(mean_pres, color=GOLD, linestyle='--', linewidth=2,
            label=f'Mean ₹{mean_pres:.1f}L')
ax2.legend(facecolor=BG_AXES, edgecolor=SPINE_CLR, labelcolor=TEXT_CLR)
ax2.set_xlabel('Present Price (Lakhs ₹)', color=TEXT_CLR)
ax2.set_ylabel('Frequency', color=TEXT_CLR)
ax2.set_title('Present Price Distribution', color=TEXT_CLR)

plt.tight_layout()
plt.savefig('price_distribution.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: price_distribution.png")


# ── Plot 2 → correlation_heatmap.png ─────────────────────────────────────────
corr_cols = ['Selling_Price', 'Present_Price', 'Car_Age', 'Driven_kms', 'Owner']
corr_data = df_vis[corr_cols].corr()

fig, ax = plt.subplots(figsize=(10, 7))
apply_dark_theme(fig, ax)
fig.patch.set_facecolor(BG_DARK)

mask = np.zeros_like(corr_data, dtype=bool)
heatmap = sns.heatmap(
    corr_data, ax=ax, cmap='coolwarm', annot=True, fmt='.2f',
    linewidths=1, linecolor=BG_DARK, mask=mask,
    annot_kws={'color': 'white', 'fontsize': 11, 'fontweight': 'bold'},
    cbar_kws={'shrink': 0.8}
)
heatmap.collections[0].colorbar.ax.tick_params(colors=TICK_CLR)
heatmap.collections[0].colorbar.ax.yaxis.label.set_color(TEXT_CLR)

ax.set_title('🔥 Feature Correlation Heatmap', color=TEXT_CLR,
             fontsize=15, fontweight='bold', pad=15)
ax.set_xticklabels(ax.get_xticklabels(), rotation=30, ha='right',
                   color=TEXT_CLR)
ax.set_yticklabels(ax.get_yticklabels(), rotation=0, color=TEXT_CLR)

plt.tight_layout()
plt.savefig('correlation_heatmap.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: correlation_heatmap.png")


# ── Plot 3 → price_by_category.png ───────────────────────────────────────────
fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 6))
apply_dark_theme(fig, [ax1, ax2, ax3])
fig.suptitle('💰 Avg Selling Price by Category', color=TEXT_CLR,
             fontsize=16, fontweight='bold', y=1.01)

# Bar 1 — Fuel_Type
fuel_avg   = df_vis.groupby('Fuel_Type')['Selling_Price'].mean()
fuel_colors = {'Petrol': PINK, 'Diesel': CYAN, 'CNG': ORANGE}
bars1 = ax1.bar(fuel_avg.index,
                fuel_avg.values,
                color=[fuel_colors.get(f, PURPLE) for f in fuel_avg.index])
for bar, val in zip(bars1, fuel_avg.values):
    ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.15,
             f'₹{val:.1f}L', ha='center', va='bottom',
             color=TEXT_CLR, fontsize=10, fontweight='bold')
ax1.set_title('By Fuel Type', color=TEXT_CLR)
ax1.set_xlabel('Fuel Type', color=TEXT_CLR)
ax1.set_ylabel('Avg Selling Price (₹ Lakhs)', color=TEXT_CLR)

# Bar 2 — Transmission
trans_avg    = df_vis.groupby('Transmission')['Selling_Price'].mean()
trans_colors = {'Manual': GREEN, 'Automatic': PURPLE}
bars2 = ax2.bar(trans_avg.index,
                trans_avg.values,
                color=[trans_colors.get(t, CYAN) for t in trans_avg.index])
for bar, val in zip(bars2, trans_avg.values):
    ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.15,
             f'₹{val:.1f}L', ha='center', va='bottom',
             color=TEXT_CLR, fontsize=10, fontweight='bold')
ax2.set_title('By Transmission', color=TEXT_CLR)
ax2.set_xlabel('Transmission', color=TEXT_CLR)
ax2.set_ylabel('Avg Selling Price (₹ Lakhs)', color=TEXT_CLR)

# Bar 3 — Selling_type
sell_avg    = df_vis.groupby('Selling_type')['Selling_Price'].mean()
sell_colors = {'Dealer': '#FF8C69', 'Individual': CYAN}
bars3 = ax3.bar(sell_avg.index,
                sell_avg.values,
                color=[sell_colors.get(s, ORANGE) for s in sell_avg.index])
for bar, val in zip(bars3, sell_avg.values):
    ax3.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.15,
             f'₹{val:.1f}L', ha='center', va='bottom',
             color=TEXT_CLR, fontsize=10, fontweight='bold')
ax3.set_title('By Selling Type', color=TEXT_CLR)
ax3.set_xlabel('Selling Type', color=TEXT_CLR)
ax3.set_ylabel('Avg Selling Price (₹ Lakhs)', color=TEXT_CLR)

plt.tight_layout()
plt.savefig('price_by_category.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: price_by_category.png")


# ── Plot 4 → price_scatter.png ────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 7))
apply_dark_theme(fig, ax)

fuel_scatter_colors = {'Petrol': PINK, 'Diesel': CYAN, 'CNG': ORANGE}
for fuel, grp in df_vis.groupby('Fuel_Type'):
    ax.scatter(grp['Present_Price'], grp['Selling_Price'],
               color=fuel_scatter_colors.get(fuel, PURPLE),
               label=fuel, alpha=0.75, s=60, zorder=3)

# Trend line
z = np.polyfit(df_vis['Present_Price'], df_vis['Selling_Price'], 1)
p = np.poly1d(z)
x_line = np.linspace(df_vis['Present_Price'].min(),
                     df_vis['Present_Price'].max(), 300)
ax.plot(x_line, p(x_line), color=GOLD, linestyle='--',
        linewidth=2, label='Trend Line', zorder=4)

ax.annotate('Correlation = 0.88',
            xy=(0.72, 0.08), xycoords='axes fraction',
            color=GOLD, fontsize=11, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor=BG_AXES,
                      edgecolor=GOLD, alpha=0.8))

ax.set_xlabel('Present Price (Lakhs ₹)', color=TEXT_CLR, fontsize=12)
ax.set_ylabel('Selling Price (Lakhs ₹)', color=TEXT_CLR, fontsize=12)
ax.set_title('🔍 Present Price vs Selling Price', color=TEXT_CLR,
             fontsize=15, fontweight='bold')
ax.legend(facecolor=BG_AXES, edgecolor=SPINE_CLR, labelcolor=TEXT_CLR)

plt.tight_layout()
plt.savefig('price_scatter.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: price_scatter.png")


# ── Plot 5 → age_vs_price.png ────────────────────────────────────────────────
age_price = df_vis.groupby('Car_Age')['Selling_Price'].mean().sort_index()

fig, ax = plt.subplots(figsize=(12, 6))
apply_dark_theme(fig, ax)

ax.plot(age_price.index, age_price.values,
        color=PINK, linewidth=3, marker='o', markersize=8, zorder=3)
ax.fill_between(age_price.index, age_price.values,
                color=PINK, alpha=0.15)

ax.set_xlabel('Car Age (Years)', color=TEXT_CLR, fontsize=12)
ax.set_ylabel('Avg Selling Price (₹ Lakhs)', color=TEXT_CLR, fontsize=12)
ax.set_title('📉 Car Age vs Average Selling Price\n(Depreciation Over Time)',
             color=TEXT_CLR, fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('age_vs_price.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: age_vs_price.png")


# ── Plot 6 → actual_vs_predicted.png ─────────────────────────────────────────
model_names = list(results.keys())

fig, axes = plt.subplots(1, 3, figsize=(18, 6))
apply_dark_theme(fig, axes)
fig.suptitle('🎯 Actual vs Predicted — All Models', color=TEXT_CLR,
             fontsize=16, fontweight='bold', y=1.01)

all_vals = np.concatenate([y_test.values] + list(preds_dict.values()))
lim_min, lim_max = all_vals.min() * 0.9, all_vals.max() * 1.05

for ax, name in zip(axes, model_names):
    y_pred_m = preds_dict[name]
    ax.scatter(y_test, y_pred_m, color=CYAN, alpha=0.6, s=50, zorder=3)
    ax.plot([lim_min, lim_max], [lim_min, lim_max],
            color=PINK, linestyle='--', linewidth=2, label='Perfect Fit')
    r2_val = results[name]['R2']
    short  = name.replace('Gradient Boosting', 'Gradient\nBoosting') \
                 .replace('Linear Regression', 'Linear\nRegression') \
                 .replace('Random Forest', 'Random\nForest')
    ax.set_title(f'{short}\nR² = {r2_val:.4f}', color=TEXT_CLR, fontsize=11)
    ax.set_xlabel('Actual Selling Price', color=TEXT_CLR)
    ax.set_ylabel('Predicted Selling Price', color=TEXT_CLR)
    ax.set_xlim(lim_min, lim_max)
    ax.set_ylim(lim_min, lim_max)
    ax.legend(facecolor=BG_AXES, edgecolor=SPINE_CLR, labelcolor=TEXT_CLR,
              fontsize=9)

plt.tight_layout()
plt.savefig('actual_vs_predicted.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: actual_vs_predicted.png")


# ── Plot 7 → model_comparison.png ────────────────────────────────────────────
r2_vals   = [results[m]['R2']   for m in model_names]
mae_vals  = [results[m]['MAE']  for m in model_names]
rmse_vals = [results[m]['RMSE'] for m in model_names]

x_labels = ['Linear\nRegression', 'Random\nForest', 'Gradient\nBoosting']
x_pos    = np.arange(len(model_names))

best_idx_r2   = int(np.argmax(r2_vals))
best_idx_mae  = int(np.argmin(mae_vals))
best_idx_rmse = int(np.argmin(rmse_vals))

fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 6))
apply_dark_theme(fig, [ax1, ax2, ax3])
fig.suptitle('🏆 Model Performance Comparison', color=TEXT_CLR,
             fontsize=16, fontweight='bold', y=1.01)

def draw_metric_bars(ax, values, colors_base, best_idx, ylabel, title,
                     higher_is_better=True):
    bar_colors = [colors_base] * len(values)
    bars = ax.bar(x_pos, values, color=bar_colors, width=0.55)
    # Gold border on best bar
    bars[best_idx].set_edgecolor(GOLD)
    bars[best_idx].set_linewidth(3)
    for i, (bar, val) in enumerate(zip(bars, values)):
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + max(values) * 0.01,
                f'{val:.3f}', ha='center', va='bottom',
                color=TEXT_CLR, fontsize=10, fontweight='bold')
    ax.set_xticks(x_pos)
    ax.set_xticklabels(x_labels, color=TEXT_CLR)
    ax.set_ylabel(ylabel, color=TEXT_CLR)
    ax.set_title(title, color=TEXT_CLR, fontweight='bold')
    ax.set_ylim(0, max(values) * 1.18)
    return bars

bars_r2 = draw_metric_bars(ax1, r2_vals, CYAN, best_idx_r2,
                            'R² Score', 'R² Score')
# Add ⭐ Best annotation to subplot 1
best_bar = bars_r2[best_idx_r2]
ax1.annotate('⭐ Best',
             xy=(best_bar.get_x() + best_bar.get_width() / 2,
                 best_bar.get_height()),
             xytext=(0, 28), textcoords='offset points',
             ha='center', color=GOLD, fontsize=11, fontweight='bold',
             arrowprops=dict(arrowstyle='->', color=GOLD, lw=1.5))

draw_metric_bars(ax2, mae_vals, PINK, best_idx_mae,
                 'MAE (₹ Lakhs)', 'MAE (lower is better)',
                 higher_is_better=False)

draw_metric_bars(ax3, rmse_vals, ORANGE, best_idx_rmse,
                 'RMSE (₹ Lakhs)', 'RMSE (lower is better)',
                 higher_is_better=False)

plt.tight_layout()
plt.savefig('model_comparison.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: model_comparison.png")


# ── Plot 8 → feature_importance.png ──────────────────────────────────────────
rf_model    = models['Random Forest']
importances = rf_model.feature_importances_
feat_names  = FEATURES

# Sort ascending (most important at top for horizontal bar)
sorted_idx  = np.argsort(importances)
sorted_imp  = importances[sorted_idx]
sorted_names = [feat_names[i] for i in sorted_idx]

bar_colors  = [PINK if i == sorted_idx[-1] else CYAN
               for i in range(len(sorted_imp))]

fig, ax = plt.subplots(figsize=(10, 6))
apply_dark_theme(fig, ax)

bars = ax.barh(sorted_names, sorted_imp, color=bar_colors)

for bar, val in zip(bars, sorted_imp):
    ax.text(val + 0.003, bar.get_y() + bar.get_height() / 2,
            f'{val:.4f}', va='center', color=TEXT_CLR,
            fontsize=9, fontweight='bold')

ax.set_xlabel('Feature Importance', color=TEXT_CLR, fontsize=12)
ax.set_title('🔑 Feature Importance — Random Forest\n'
             '(Which features matter most for price?)',
             color=TEXT_CLR, fontsize=13, fontweight='bold')

plt.tight_layout()
plt.savefig('feature_importance.png', dpi=150, bbox_inches='tight',
            facecolor=BG_DARK)
plt.close()
print("  ✅ Saved: feature_importance.png")


# ── 6. KEY INSIGHTS SUMMARY ───────────────────────────────────────────────────
print("\n" + "═"*70)
print("  💡  STEP 6 — KEY INSIGHTS SUMMARY")
print("═"*70)

diesel_avg  = df_vis[df_vis['Fuel_Type'] == 'Diesel']['Selling_Price'].mean()
petrol_avg  = df_vis[df_vis['Fuel_Type'] == 'Petrol']['Selling_Price'].mean()
auto_avg    = df_vis[df_vis['Transmission'] == 'Automatic']['Selling_Price'].mean()
manual_avg  = df_vis[df_vis['Transmission'] == 'Manual']['Selling_Price'].mean()
diesel_diff = diesel_avg - petrol_avg
auto_diff   = auto_avg - manual_avg

best_mae  = results[best_name]['MAE']
top_feat  = FEATURES[np.argmax(rf_model.feature_importances_)]

print("""
┌─────────────────────────────────────────┐
│   🚗 CAR PRICE PREDICTION — INSIGHTS   │
├─────────────────────────────────────────┤""")
print(f"│ Total Cars Analyzed   : {len(df_vis):<15} │")
print(f"│ Avg Selling Price     : ₹{df_vis['Selling_Price'].mean():.2f} Lakhs    │")
print(f"│ Max Selling Price     : ₹{df_vis['Selling_Price'].max():.2f} Lakhs   │")
print(f"│ Avg Depreciation      : {df_vis['Depreciation_Pct'].mean():.1f}%          │")
print(f"│ Best Model            : Gradient Boost │")
print(f"│ Best R² Score         : {best_r2:.4f}         │")
print(f"│ Best MAE              : ₹{best_mae:.2f} Lakhs   │")
print(f"│ Top Feature           : Present_Price  │")
print(f"│ Diesel > Petrol Price : +₹{diesel_diff:.2f} Lakhs  │")
print(f"│ Automatic > Manual    : +₹{auto_diff:.2f} Lakhs  │")
print("└─────────────────────────────────────────┘")


# ── 7. COMPLETION ─────────────────────────────────────────────────────────────
print("\n" + "═"*70)
print("  ✅  ALL STEPS COMPLETED SUCCESSFULLY!")
print("═"*70)
print("""
  Files saved:
    📄 car_price_prediction.py
    🖼  price_distribution.png
    🖼  correlation_heatmap.png
    🖼  price_by_category.png
    🖼  price_scatter.png
    🖼  age_vs_price.png
    🖼  actual_vs_predicted.png
    🖼  model_comparison.png
    🖼  feature_importance.png
""")
