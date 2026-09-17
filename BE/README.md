# OceanFlow backend

## Run

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

The API uses `DATABASE_URL` when provided (MySQL-compatible URLs are supported), otherwise a local SQLite database is created. The database starts empty; no operational records are seeded.

## Endpoints

- `GET /health`
- `GET|POST /api/v1/cruise-tours`
- `GET /api/v1/activities`
- `GET /api/v1/activity-schedules`
- `GET /api/v1/passengers`
- `POST /api/v1/activity-registrations` — validates passenger, active activity, duplicate registration, and capacity
- `POST /api/v1/activity-checkins` — validates registration and duplicate check-in
