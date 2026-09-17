# 🌊 OceanFlow — Cruise Service & Activity Management System

**OceanFlow** is a cruise service and activity management system developed as part of a **Software Engineering university project**.

The system is designed to digitalize the management of cruise operations and passenger experiences, including cruise tours, itineraries, ports, onboard services, shore excursions, activities, and passenger bookings.

## ✨ Project Overview

OceanFlow supports two main types of users:

* **Admin** — manages cruise information, schedules, services, activities, excursions, and bookings.
* **Passenger** — views cruise information, itineraries, services, activities, and manages activity registrations.

### Key Features

* 🚢 Cruise tour management
* 🗺️ Itinerary, port, and cruise stop management
* 🎭 Onboard activity and activity schedule management
* 🍽️ Onboard service management
* 🏝️ Shore excursion management
* 🎫 Passenger booking management
* 👤 Passenger management
* 📝 Activity registration and cancellation
* 💬 Passenger support and feedback
* 📋 Itinerary viewing by cruise tour

## 🛠️ Technologies

### Backend

* **Python**
* **Flask**
* **SQLAlchemy**
* **REST API**
* **SQLite** — local development
* **MySQL** — production

### Frontend

* **React**
* **Vite**
* **JavaScript**
* **HTML5**
* **CSS3**

### Architecture

The project follows **Clean Architecture** principles, separating API, application services, repositories, and domain models to improve maintainability, testing, and future extensibility.

## 📁 Project Structure

```text
OceanFlow
├── BE/                  # Flask Backend
│   ├── app/
│   │   ├── api/
│   │   ├── domain/
│   │   ├── services/
│   │   └── repositories/
│   └── run.py
│
├── frontend/            # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Backend

```bash
cd BE
python -m pip install -r requirements.txt
python run.py
```

The backend runs on:

```text
http://localhost:9999
```

### Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses Vite to communicate with the Flask REST API.

## 🔌 API

The API uses the following base path:

```text
/api/v1
```

Main API resources include:

* Cruise Tours
* Activities & Activity Schedules
* Passengers
* Ports & Cruise Stops
* Itineraries
* Bookings
* Shore Excursions
* Onboard Services
* Feedback
* Authentication

## 🎓 Project Information

**Project:** Cruise Activity and Service Management System
**Project Name:** OceanFlow
**Type:** University Software Engineering Project

> OceanFlow is developed to simulate a real-world cruise management system, focusing on operational data management, passenger services, activity registration, and cruise itinerary management.

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
