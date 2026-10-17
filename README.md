# CyberVault — Full Stack Java Mini Project

A beginner-friendly college project using React, Spring Boot, REST API, and MySQL.

## Requirements
- JDK 17 or newer
- VS Code + Extension Pack for Java + Spring Boot Extension Pack
- Node.js LTS (includes npm)
- MySQL Server (8.x recommended) and MySQL Workbench (optional)

## 1. Create the database
Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE cybervault_db;
```

## 2. Configure the backend database password
Open `backend/src/main/resources/application.properties`.
Replace `YOUR_MYSQL_PASSWORD` with the password you set for your local MySQL user.
The default username is `root`; change it if you use another MySQL user.

## 3. Start the backend
Open a VS Code terminal in the `backend` folder and run:

Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:
```bash
./mvnw spring-boot:run
```

If the Maven wrapper scripts are missing from your generated project, use the VS Code Spring Boot Dashboard or install Maven and run `mvn spring-boot:run`.
Backend API: http://localhost:8080/api/incidents

## 4. Start the React frontend
Open a SECOND VS Code terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## How the project works
React (browser) -> HTTP REST request -> Spring Boot Controller -> JPA Repository -> MySQL database.

The password analyzer runs locally in your browser and does not send the password to the backend.
Threat incidents are simulated sample records entered by the user; this app does not monitor real networks.

## Useful API endpoints
- GET `/api/incidents` — list incidents
- GET `/api/incidents/{id}` — get one incident
- POST `/api/incidents` — create an incident
- PUT `/api/incidents/{id}` — update an incident
- DELETE `/api/incidents/{id}` — delete an incident
