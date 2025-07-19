# Frontend Dependencies to Install

To run the virtualized version, you need to install react-window:

```bash
cd frontend
npm install react-window
```

This enables the virtualized list component for handling large datasets efficiently.

## Component Features:

1. **Paginated View** (`/`) - Traditional pagination with enhanced UI
2. **Virtualized View** (`/virtualized`) - Handles large datasets with react-window

Both views support:
- Debounced search
- Memory leak prevention
- Error handling
- Loading states
- Responsive design
