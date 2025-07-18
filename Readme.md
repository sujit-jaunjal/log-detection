# Log Detection System

## Problem Statement
Develop a script that will simulate a large number of logs (e.g. Windows event logs, Apache server access logs, etc).
Then develop a solution that can monitor these simulated logs, and identify and flag suspicious activities or anomalies.
Make sure it is customizable so that we can add our custom rules to flag suspicious events.

## Project Architecture

### 1. Frontend (React)
- Modern React application with TypeScript
- Features:
  - Real-time log visualization dashboard
  - Rule management interface
    - Create/Edit/Delete rules through UI
    - Rule testing playground
  - Alert monitoring and management
  - Log search and filtering
  - Interactive analytics and charts
- Technologies:
  - `@mui/material` for UI components
  - `react-query` for API data management
  - `socket.io-client` for real-time updates
  - `recharts` for data visualizations
  - `@monaco-editor/react` for rule editing

### 2. Backend (Node.js)
#### Log Generator Module
- Configurable log generation patterns using `faker.js`
- Support for multiple log formats:
  - Windows Event Logs
  - Apache Access Logs
  - Custom log formats
- Controllable generation rate using Node.js streams
- Normal and anomalous behavior simulation

#### Log Monitoring System
- Real-time log ingestion pipeline using `chokidar`
- Pattern matching and anomaly detection
- Customizable rule engine
- Alert generation system with WebSocket notifications
- REST API for frontend communication

#### Rule Engine
- YAML-based rule configuration using `js-yaml`
- Support for:
  - Pattern matching rules
  - Threshold-based rules
  - Time-window analysis using `moment.js`
  - Correlation rules
- Priority levels for alerts
- Custom rule addition interface

## Project Structure
```
log-detection/
├── frontend/                # React Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile           # Dockerfile for Frontend
├── backend/
│   ├── src/
│   ├── config/
│   ├── package.json
│   └── Dockerfile           # Dockerfile for Backend
├── logs/                    # Generated logs directory
├── docker-compose.yml       # Docker Compose for orchestration
└── README.md                # Project documentation
```

## Implementation Plan

1. **Phase 1: Backend Foundation**
   - Set up Express.js server
   - Implement log generators
   - Create basic REST API endpoints
   - Set up WebSocket server

2. **Phase 2: Frontend Setup**
   - Create React application with TypeScript
   - Implement basic UI components
   - Set up API integration
   - Add real-time WebSocket connection

3. **Phase 3: Rule Management UI**
   - Build rule editor interface
   - Implement rule testing playground
   - Create rule validation system
   - Add rule import/export functionality

4. **Phase 4: Dashboard & Monitoring**
   - Create real-time log viewer
   - Implement analytics dashboard
   - Add alert management system
   - Create visualization components

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start the backend server
cd ../backend
npm run dev

# In another terminal, start the frontend
cd ../frontend
npm start
```

## Containerization with Docker

The entire application can be run using Docker and Docker Compose for a consistent and isolated development environment.

### Backend `Dockerfile`
Located at `backend/Dockerfile`:
```dockerfile
# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Stage 2: Build the source code (if using TypeScript)
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# If you use TypeScript, you would have a build step here
# RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
EXPOSE 4000
CMD ["npm", "start"]
```

### Frontend `Dockerfile`
Located at `frontend/Dockerfile`:
```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
# Copy a custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (`docker-compose.yml`)
Located at the project root:
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    volumes:
      - ./logs:/usr/src/app/logs
      - ./backend/src:/usr/src/app/src
      - ./backend/config:/usr/src/app/config
    environment:
      - NODE_ENV=development

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### Running with Docker Compose
```bash
# Build and start the containers in detached mode
docker-compose up --build -d

# Stop the containers
docker-compose down
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI for components
- React Query for API state management
- Socket.io-client for real-time updates
- Recharts for visualizations
- Monaco Editor for rule editing

### Backend
- Node.js with Express
- Socket.io for real-time communication
- Winston for logging
- Jest for testing
- TypeScript for type safety

## Frontend Features

### Dashboard
- Real-time log stream viewer
- Log statistics and metrics
- Active rules overview
- Recent alerts display
- System health indicators

### Rule Management
- Visual rule builder
- Rule testing playground
- Rule templates
- Import/Export functionality
- Rule versioning

### Alert Management
- Real-time alert notifications
- Alert filtering and search
- Alert severity levels
- Alert investigation tools
- Alert history

### Analytics
- Log pattern visualization
- Anomaly detection graphs
- Time-series analysis
- Custom report generation
- Export capabilities

## API Documentation

[To be added: API endpoints documentation]

## Contributing

Guidelines for adding new rules and extending the system will be provided here.