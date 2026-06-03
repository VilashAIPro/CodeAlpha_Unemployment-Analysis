# 🚗 Car Price Prediction — CodeAlpha Task 3

## Overview
This project builds and evaluates machine learning regression models to predict used car selling prices based on features like present price, car age, mileage, fuel type, and transmission. Gradient Boosting achieves the best performance with R² = 0.9641, explaining ~96% of price variance.

## Dataset
| Property | Value |
|---|---|
| Rows | 301 |
| Columns | 9 |
| Target | Selling_Price (Lakhs ₹) |
| Missing Values | None |
| Year Range | 2003 – 2018 |
| Source | Used Car Sales Data |

### Feature Overview
| Feature | Type | Description |
|---|---|---|
| Car_Name | Categorical | Car model name (dropped — 98 unique) |
| Year | Integer | Manufacturing year → converted to `Car_Age` |
| Selling_Price | Float | 🎯 TARGET — price in Lakhs ₹ |
| Present_Price | Float | Current showroom price in Lakhs ₹ |
| Driven_kms | Integer | Total kilometres driven |
| Fuel_Type | Categorical | Petrol (239) / Diesel (60) / CNG (2) |
| Selling_type | Categorical | Dealer (195) / Individual (106) |
| Transmission | Categorical | Manual (261) / Automatic (40) |
| Owner | Integer | Number of previous owners (0/1/3) |

## Feature Engineering
Three new features were created before modelling:
- **Car_Age** = 2024 − Year
- **Price_Diff** = Present_Price − Selling_Price *(dropped after use)*
- **Depreciation_Pct** = (Price_Diff / Present_Price) × 100 *(dropped after use)*

Final 7 model features: `Present_Price`, `Car_Age`, `Driven_kms`, `Fuel_Type_enc`, `Selling_type_enc`, `Transmission_enc`, `Owner`

## Model Results
| Model | R² | MAE | RMSE |
|---|---|---|---|
| Linear Regression | 0.8467 | 1.2219 | 1.8792 |
| Random Forest | 0.9610 | 0.6235 | 0.9481 |
| Gradient Boosting ⭐ | 0.9641 | 0.5612 | 0.9088 |

> **Best Model:** Gradient Boosting Regressor (`n_estimators=100, random_state=42`)

## Key Insights
- **Best Model:** Gradient Boosting (R²=0.9641) — outperforms both Linear Regression and Random Forest
- **Most Important Feature:** Present_Price (correlation = 0.88 with Selling_Price)
- **Fuel Type Impact:** Diesel cars avg ₹10.28L vs Petrol ₹3.26L (+₹7.02L premium)
- **Transmission Impact:** Automatic avg ₹9.42L vs Manual ₹3.93L (+₹5.49L premium)
- **Average Depreciation:** 36.6% across the dataset
- **Age Effect:** Prices drop significantly after the first 3–5 years

## Visualizations

| File | Description |
|---|---|
| `price_distribution.png` | Histogram of Selling & Present prices with mean lines |
| `correlation_heatmap.png` | Heatmap of Pearson correlations between numeric features |
| `price_by_category.png` | Avg price grouped by Fuel Type, Transmission, and Seller |
| `price_scatter.png` | Present Price vs Selling Price scatter with trend line |
| `age_vs_price.png` | Depreciation curve — avg price by car age |
| `actual_vs_predicted.png` | Actual vs predicted scatter for all 3 models |
| `model_comparison.png` | Side-by-side R², MAE, RMSE bar charts |
| `feature_importance.png` | Random Forest feature importance (horizontal bar) |

All plots use a custom dark theme (bg `#0A0A0F`) with a vibrant neon palette.

## Tech Stack
Python | Pandas | NumPy | Scikit-learn | Matplotlib | Seaborn

## How to Run
```bash
pip install pandas numpy matplotlib seaborn scikit-learn
python car_price_prediction.py
```

> ⚠️ Make sure `car_data.csv` is in the same directory as the script.

## Project Structure
```
📁 repository/
├── car_data.csv                  ← Input dataset
├── car_price_prediction.py       ← Main ML script
├── README.md                     ← This file
├── price_distribution.png
├── correlation_heatmap.png
├── price_by_category.png
├── price_scatter.png
├── age_vs_price.png
├── actual_vs_predicted.png
├── model_comparison.png
└── feature_importance.png
```

## Author
**Vilash Kumar Reddy** | CodeAlpha Data Science Intern | May Batch 2026
