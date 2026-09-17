# OceanFlow

## Backend

The active backend is in `BE/`. It uses SQLAlchemy and reads `DATABASE_URL` and `SECRET_KEY` from environment variables. MySQL is the production database; SQLite is the local default for development when no URL is configured.

```powershell
cd BE
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe run.py
```

## Frontend

```powershell
cd FE
npm install
npm run dev
```

The Vite proxy sends `/api` to Flask on port 9999. The frontend deliberately shows loading, empty, and unavailable states when no backend records exist.

## API

Base URL: `/api/v1`. Implemented persisted resources include tours, activities/schedules, passengers, ports, itinerary resources, cabins/bookings, providers/excursions, services/products, accounts, expenses, notifications, feedback, and audit/system logs. Business endpoints include activity registration/check-in, excursion registration, authentication, and idempotent offline operation intake.

## Architecture and limitations

`app/domain` contains SQLAlchemy persistence models for this current university slice; `app/services` and `app/repositories` contain application boundaries. The current API does not seed operational data. POS/service-order and full finance settlement workflows require the corresponding create/use-case endpoints to be added next; the schema foundations exist. The 3D view is a lightweight CSS visualization (no external model or license dependency), isolated under `FE/src/components/three`.
