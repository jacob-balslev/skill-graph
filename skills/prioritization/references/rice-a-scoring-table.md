# RICE-A Scoring Table

Use this table to standardize the input values for the RICE-A prioritization formula.

## 1. Reach (Absolute Number)
Estimate the number of users or organizations affected by the feature in a 90-day period.
- **High**: > 100 orgs (Core feature)
- **Medium**: 20 - 100 orgs (Common feature)
- **Low**: < 20 orgs (Edge case / Niche)

## 2. Impact (Multiplier)
How much does this feature contribute to the core product promise (profit reconciliation)?
- **3.0 (Massive)**: Essential for the product's existence
- **2.0 (High)**: Significantly improves core value
- **1.0 (Medium)**: Useful, but not core
- **0.5 (Low)**: Minor enhancement
- **0.25 (Minimal)**: Cosmetic or ultra-niche

## 3. Confidence (Percentage)
How sure are we about the Reach, Impact, and Effort estimates?
- **100% (High Confidence)**: Proven by data, baseline model is working
- **80% (Medium Confidence)**: Supported by early feedback or similar features
- **50% (Low Confidence)**: An educated guess or "Vibe"
- **< 50% (Wild Guess)**: Move to ICE research phase first

## 4. Effort (Person-Weeks)
The total time for one engineer to implement, test, and ship.
- **1**: < 1 week (Trivial/Standard)
- **2**: 1-2 weeks (Standard/Complex)
- **4**: ~1 month (Architectural)
- **8+**: Multi-month initiative (Break down further)

## 5. Ambiguity (A) (Scale 1-5)
The research uncertainty and model unpredictability.
- **1 (Deterministic)**: Standard CRUD, no AI logic
- **2 (Low Ambiguity)**: Simple prompt with working baseline
- **3 (Medium Ambiguity)**: New prompt/model with known data
- **4 (High Ambiguity)**: Experimental model with messy data
- **5 (Extreme Ambiguity)**: Research project with unknown feasibility

---

## Example Calculation

**Feature**: Multi-market currency reconciliation for Shopify
- **Reach**: 150 (High)
- **Impact**: 2.0 (High)
- **Confidence**: 80% (Medium)
- **Effort**: 4 (Architectural)
- **Ambiguity**: 3 (Medium)

$$Score = \frac{150 \times 2.0 \times 0.8}{4 \times (\frac{3}{2})} = \frac{240}{6} = 40.0$$
