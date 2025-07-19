import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/items/${id}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Item not found');
          }
          throw new Error(`Failed to load item: ${response.status}`);
        }
        
        const itemData = await response.json();
        
        if (!abortController.signal.aborted) {
          setItem(itemData);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setError(error.message);
          console.error('Failed to fetch item:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      abortController.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        padding: 32, 
        maxWidth: 600, 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Loading skeleton */}
        <div style={{ 
          height: 32, 
          backgroundColor: '#f0f0f0', 
          borderRadius: 4, 
          marginBottom: 16,
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ 
          height: 20, 
          backgroundColor: '#f0f0f0', 
          borderRadius: 4, 
          marginBottom: 12,
          width: '60%',
          margin: '0 auto 12px'
        }} />
        <div style={{ 
          height: 20, 
          backgroundColor: '#f0f0f0', 
          borderRadius: 4, 
          width: '40%',
          margin: '0 auto'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 32, 
        maxWidth: 600, 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div 
          role="alert"
          style={{ 
            color: '#dc3545', 
            marginBottom: 24,
            fontSize: 18,
            fontWeight: 600
          }}
        >
          {error}
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Back to Items
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ 
        padding: 32, 
        maxWidth: 600, 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <p>Item not found</p>
        <button onClick={() => navigate('/')}>Back to Items</button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 32, 
      maxWidth: 600, 
      margin: '0 auto'
    }}>
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: '1px solid #e1e5e9',
          borderRadius: 6,
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: 14,
          color: '#666',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.borderColor = '#007bff';
          e.target.style.color = '#007bff';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.borderColor = '#e1e5e9';
          e.target.style.color = '#666';
        }}
        aria-label="Go back to items list"
      >
        <span>←</span> Back to Items
      </button>

      {/* Item details card */}
      <div style={{ 
        border: '1px solid #e1e5e9',
        borderRadius: 12,
        padding: 32,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 24px 0', 
          color: '#333',
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.2
        }}>
          {item.name}
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gap: 16,
          marginBottom: 24
        }}>
          <div>
            <label style={{ 
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#666',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Category
            </label>
            <span style={{ 
              display: 'inline-block',
              backgroundColor: '#e9ecef', 
              padding: '6px 12px', 
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              color: '#495057'
            }}>
              {item.category}
            </span>
          </div>
          
          <div>
            <label style={{ 
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#666',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Price
            </label>
            <span style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: '#007bff'
            }}>
              ${item.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Additional actions */}
        <div style={{ 
          display: 'flex', 
          gap: 12,
          paddingTop: 24,
          borderTop: '1px solid #e9ecef'
        }}>
          <button
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            aria-label={`Add ${item.name} to cart`}
          >
            Add to Cart
          </button>
          
          <button
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #e1e5e9',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.color = '#007bff';
              e.target.style.borderColor = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
              e.target.style.borderColor = '#e1e5e9';
            }}
            aria-label={`Add ${item.name} to wishlist`}
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;