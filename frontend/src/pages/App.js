import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemsVirtualized from './ItemsVirtualized';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <nav style={{padding: 16, borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa'}}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#007bff',
              fontWeight: 600 
            }}
          >
            Items (Paginated)
          </Link>
          <span style={{ color: '#dee2e6' }}>|</span>
          <Link 
            to="/virtualized" 
            style={{ 
              textDecoration: 'none', 
              color: '#007bff',
              fontWeight: 600 
            }}
          >
            Items (Virtualized)
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/virtualized" element={<ItemsVirtualized />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </DataProvider>
  );
}

export default App;