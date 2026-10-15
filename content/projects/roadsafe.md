---
nodeIds: [p3, py, pg]
---

# RoadSafe AI

US road safety analytics. Python, PostgreSQL, Docker, Pandas, NumPy, scikit-learn, Tableau.

- Modeled 100K US crash records into a dbt and Postgres star schema (one fact and four dimensions) with no imputation in the raw load.
- The national rain-versus-clear severity gap is state composition, not weather. California +0.46 percentage points. Florida +9.45 percentage points.
- Junction proximity stayed near 27.9% severe across three baselines, the one condition that survived base-rate correction.
- An 80.55% majority-class floor that weather and time features failed to beat. Findings published to a Tableau dashboard.
