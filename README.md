# 🌊 OceanFlow — Cruise Service & Activity Management System

OceanFlow is a **Cruise Service and Activity Management System** developed as part of a **Software Engineering university project**.

The system is designed to digitalize cruise operations and passenger services, including cruise tours, itineraries, ports, onboard services, shore excursions, activities, and passenger bookings.

---

## ✨ Project Overview

OceanFlow supports two main types of users:

* **Admin** — manages cruise tours, itineraries, ports, cruise stops, activities, schedules, onboard services, shore excursions, passengers, and bookings.
* **Passenger** — views cruise information, itineraries, bookings, activities, services, and manages activity registrations.

### Key Features

* 🚢 Cruise tour management
* 🗺️ Itinerary, port, and cruise stop management
* 🎭 Activity and activity schedule management
* 🍽️ Onboard service management
* 🏝️ Shore excursion management
* 🎫 Passenger booking management
* 👤 Passenger management
* 📝 Activity registration and cancellation
* 💬 Passenger support and feedback
* 📋 Itinerary viewing by cruise tour

---

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

The backend follows **Clean Architecture** principles by separating API, application services, repositories, and domain models.

This structure helps improve code organization, maintainability, testing, and future extensibility.

---

## 📁 Project Structure

```text
OceanFlow
├── BE/                         # Flask Backend
│   ├── app/
│   │   ├── api/
│   │   ├── domain/
│   │   ├── services/
│   │   └── repositories/
│   └── run.py
│
├── frontend/                   # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend

Open a terminal and run:

```powershell
cd BE
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe run.py
```

The Flask backend runs on:

```text
http://localhost:9999
```

The backend uses SQLAlchemy and can read `DATABASE_URL` and `SECRET_KEY` from environment variables.

SQLite is used as the default database for local development, while MySQL can be configured for production.

---

### 2. Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is built with React and Vite.

During local development, the Vite proxy forwards `/api` requests to the Flask backend running on port `9999`.

---

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
* Cabins & Bookings
* Shore Excursions
* Onboard Services
* Onboard Accounts
* Notifications
* Feedback
* Authentication

Business operations include activity registration and cancellation, excursion registration, authentication, and other system operations.

---

## 🏗️ Architecture

The project is organized around several main backend layers:

```text
Frontend (React + Vite)
          │
          ▼
      REST API
          │
          ▼
   Application Services
          │
          ▼
     Repositories
          │
          ▼
       Database
```

The main backend directories are:

```text
app/
├── api/            # API routes and HTTP layer
├── domain/         # Domain and persistence models
├── services/       # Application/business logic
└── repositories/   # Data access boundaries
```

---

## 👥 User Roles

### Admin

Administrators can manage operational data such as:

* Cruise tours
* Itineraries
* Ports
* Cruise stops
* Activities
* Activity schedules
* Onboard services
* Shore excursions
* Passengers
* Bookings and booking status

### Passenger

Passengers can:

* View cruise information
* View their bookings
* View itineraries
* View activities and schedules
* Register for activities
* Cancel activity registrations
* View onboard services
* Register for shore excursions
* Send feedback and support requests

---

## 🎓 Project Information

**Project:** Cruise Activity and Service Management System
**Project Name:** OceanFlow
**Type:** University Software Engineering Project

OceanFlow is developed to simulate a real-world cruise management system, focusing on cruise operational data, passenger services, bookings, activities, and itinerary management.

---

## ⚠️ Current Limitations

This project is developed as a university software engineering project.

Some advanced production workflows, such as complete POS processing and full financial settlement, are not fully implemented yet.

The project currently focuses on the core management, booking, passenger service, activity, excursion, and itinerary workflows.

---

## 📌 Notes

* The local development database uses SQLite.
* Production deployment can be configured with MySQL.
* The frontend and backend are developed as separate applications.
* The project is structured to support future feature expansion.
