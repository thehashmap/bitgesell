# Setup Instructions

## Prerequisites

- Node.js version 18.x
- npm or yarn package manager

## Quick Start

### 1. Install Node.js 18

```bash
nvm install 18
nvm use 18
```

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on http://localhost:3001

### 3. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm install react-window  # For virtualization feature
npm start
```

The frontend will run on http://localhost:3000

## Important Notes

- **Proxy Configuration**: The frontend has a proxy configured to route `/api` requests to `http://localhost:3001`
- **Backend Must Be Running**: Make sure the backend is running before starting the frontend
- **Data File**: Sample data is in `/data/items.json` with 100 items across multiple categories

## Component Features:

1. **Paginated View** (`/`) - Traditional pagination with enhanced UI
2. **Virtualized View** (`/virtualized`) - Handles large datasets with react-window

Both views support:

- Debounced search
- Memory leak prevention
- Error handling
- Loading states
- Responsive design

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```
