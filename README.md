# Eco-Nest Living — App Specification

This document is a refined, software-ingestible specification for **Eco-Nest Living**. It is designed to be mapped directly into no-code/low-code builders (Glide, FlutterFlow, Bubble, Adalo) or handed to a developer as a single source of truth.

## 1) App build target
- **App type:** PWA (installable on iOS/Android home screen)
- **Auth:** Email (magic link) or optional guest mode
- **Region:** UK (v1)
- **Currency:** GBP

## 2) Data model (platform-neutral)

### Entities
- **User**
- **Upgrade**
- **Calculation**
- **PlanItem**
- **NewTechnology**
- **SavedTech**
- **Assumption**

### Relationships
- User 1—* Calculations
- User 1—* PlanItems
- Upgrade 1—* Calculations
- Upgrade 1—* PlanItems
- User 1—* SavedTech
- NewTechnology 1—* SavedTech

## 3) Screen map (navigation)

Bottom tabs:
1. Home
2. Calculators
3. My Plan
4. New Tech
5. Profile

## 4) Calculator logic (platform-neutral formulas)

### Common conversions
- `price_gbp_per_kwh = electricity_price_p_kwh * 0.01`

### LED calculator

**Inputs:** `qty`, `hours_per_day_band`, `electricity_price_p_kwh`

**Constants:** `old_watts = 60`, `led_watts = 9`

**Band mapping (hours per day):**
- `1–2 -> 1.5`
- `3–4 -> 3.5`
- `5+ -> 5.5`
- `default -> 3.0`

**kWh saved/year:**
- `kwh_saved = qty * (old_watts - led_watts) * hours_per_day * 365 / 1000`

**Annual savings (mid):**
- `annual_mid = kwh_saved * price_gbp_per_kwh`

**Range:**
- `annual_low = annual_mid * 0.9`
- `annual_high = annual_mid * 1.1`

**Upfront cost from Upgrade:**
- `upfront_low = qty * cost_low_gbp`
- `upfront_high = qty * cost_high_gbp`
- `upfront_mid = (upfront_low + upfront_high) / 2`

**Payback months:**
- `payback_months = upfront_mid / (annual_mid / 12)` (guard `annual_mid > 0`)

**10-year savings:**
- `ten_low = annual_low * 10 - upfront_high`
- `ten_high = annual_high * 10 - upfront_low`

### Smart plug calculator

**Inputs:** `qty`, `standby_watts_band`, `electricity_price_p_kwh`

**Band mapping (standby watts):**
- `Low -> 5`
- `Medium -> 10`
- `High -> 20`

**kWh saved/year:**
- `kwh_saved = qty * standby_watts * 24 * 365 / 1000`

**Annual savings (mid):**
- `annual_mid = kwh_saved * price_gbp_per_kwh`

**Range (wider variance):**
- `annual_low = annual_mid * 0.85`
- `annual_high = annual_mid * 1.15`

**Upfront + payback + 10-year:**
- Same method as LED

## 5) Premium gating rules

- If `user.is_premium = false`:
  - Show dashboard preview blurred
  - Show “Unlock whole-home savings” CTA
  - Allow calculators + basic plan features
- If `user.is_premium = true`:
  - Show dashboard totals + export + reminders

## 6) Seed categories

Suggested seed categories for `Upgrade` / `NewTechnology`:
- Lighting
- Smart Plugs
- Heating & Insulation
- Appliances
- Water Efficiency
- Solar & Storage
- Tariffs & Monitoring

## 7) Installable JSON spec (single source of truth)

```json
{
  "app": {
    "name": "Eco-Nest Living",
    "type": "PWA",
    "auth": {
      "mode": ["magic_link", "guest"],
      "primary": "magic_link"
    },
    "region": "UK",
    "currency": "GBP",
    "navigation": {
      "bottom_tabs": ["Home", "Calculators", "My Plan", "New Tech", "Profile"]
    }
  },
  "data_model": {
    "entities": [
      "User",
      "Upgrade",
      "Calculation",
      "PlanItem",
      "NewTechnology",
      "SavedTech",
      "Assumption"
    ],
    "relationships": [
      { "from": "User", "to": "Calculation", "type": "1_to_many" },
      { "from": "User", "to": "PlanItem", "type": "1_to_many" },
      { "from": "Upgrade", "to": "Calculation", "type": "1_to_many" },
      { "from": "Upgrade", "to": "PlanItem", "type": "1_to_many" },
      { "from": "User", "to": "SavedTech", "type": "1_to_many" },
      { "from": "NewTechnology", "to": "SavedTech", "type": "1_to_many" }
    ]
  },
  "calculators": {
    "common": {
      "price_gbp_per_kwh": "electricity_price_p_kwh * 0.01"
    },
    "led": {
      "inputs": ["qty", "hours_per_day_band", "electricity_price_p_kwh"],
      "constants": {
        "old_watts": 60,
        "led_watts": 9
      },
      "band_mapping": {
        "1-2": 1.5,
        "3-4": 3.5,
        "5+": 5.5,
        "default": 3.0
      },
      "formulas": {
        "kwh_saved": "qty * (old_watts - led_watts) * hours_per_day * 365 / 1000",
        "annual_mid": "kwh_saved * price_gbp_per_kwh",
        "annual_low": "annual_mid * 0.9",
        "annual_high": "annual_mid * 1.1",
        "upfront_low": "qty * cost_low_gbp",
        "upfront_high": "qty * cost_high_gbp",
        "upfront_mid": "(upfront_low + upfront_high) / 2",
        "payback_months": "upfront_mid / (annual_mid / 12)",
        "ten_low": "annual_low * 10 - upfront_high",
        "ten_high": "annual_high * 10 - upfront_low"
      },
      "guards": ["annual_mid > 0"]
    },
    "smart_plug": {
      "inputs": ["qty", "standby_watts_band", "electricity_price_p_kwh"],
      "band_mapping": {
        "Low": 5,
        "Medium": 10,
        "High": 20
      },
      "formulas": {
        "kwh_saved": "qty * standby_watts * 24 * 365 / 1000",
        "annual_mid": "kwh_saved * price_gbp_per_kwh",
        "annual_low": "annual_mid * 0.85",
        "annual_high": "annual_mid * 1.15",
        "upfront_low": "qty * cost_low_gbp",
        "upfront_high": "qty * cost_high_gbp",
        "upfront_mid": "(upfront_low + upfront_high) / 2",
        "payback_months": "upfront_mid / (annual_mid / 12)",
        "ten_low": "annual_low * 10 - upfront_high",
        "ten_high": "annual_high * 10 - upfront_low"
      },
      "guards": ["annual_mid > 0"]
    }
  },
  "premium_gating": {
    "is_premium_false": [
      "show_dashboard_preview_blurred",
      "show_unlock_cta",
      "allow_calculators",
      "allow_basic_plan_features"
    ],
    "is_premium_true": [
      "show_dashboard_totals",
      "enable_export",
      "enable_reminders"
    ],
    "cta": "Unlock whole-home savings"
  },
  "seed_categories": [
    "Lighting",
    "Smart Plugs",
    "Heating & Insulation",
    "Appliances",
    "Water Efficiency",
    "Solar & Storage",
    "Tariffs & Monitoring"
  ]
}
```
