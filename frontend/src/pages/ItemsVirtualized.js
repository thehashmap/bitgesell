import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

// Individual item component for virtualization
const ItemRow = ({ index, style, data }) => {
  const item = data[index];

  return (
    <div style={style}>
      <div
        style={{
          padding: 16,
          margin: "8px 16px",
          border: "1px solid #e1e5e9",
          borderRadius: 8,
          backgroundColor: "#fff",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
      >
        <Link
          to={`/items/${item.id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              color: "#333",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {item.name}
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
              color: "#666",
            }}
          >
            <span
              style={{
                backgroundColor: "#f8f9fa",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {item.category}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#007bff",
              }}
            >
              ${item.price}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

function ItemsVirtualized() {
  const { items, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemHeight = 100; // Fixed height for each item

  // Load items function with proper cleanup
  const loadItems = useCallback(
    async (query = "") => {
      const abortController = new AbortController();
      setLoading(true);
      setError(null);

      try {
        // Load all items for virtualization
        await fetchItems({
          q: query,
          limit: 10000, // Load large dataset for virtualization demo
          signal: abortController.signal,
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          setError("Failed to load items. Please try again.");
          console.error("Failed to fetch items:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }

      return () => abortController.abort();
    },
    [fetchItems]
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadItems]);

  // Initial load
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading && !items.length) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <div>Loading items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: "red", marginBottom: 16 }}>{error}</div>
        <button
          onClick={() => loadItems(searchQuery)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ padding: 16, maxWidth: 800, margin: "0 auto", height: "100vh" }}
    >
      {/* Search Input */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search items by name or category..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: 12,
            border: "2px solid #e1e5e9",
            borderRadius: 8,
            fontSize: 16,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#e1e5e9")}
        />
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
        {filteredItems.length > 0 ? (
          <>
            {filteredItems.length} items found
            {searchQuery && ` for "${searchQuery}"`}
            {filteredItems.length > 100 && " (virtualized for performance)"}
          </>
        ) : searchQuery ? (
          `No items found for "${searchQuery}"`
        ) : (
          "No items available"
        )}
      </div>

      {/* Virtualized Items List */}
      {filteredItems.length > 0 ? (
        <div
          style={{
            height: "calc(100vh - 200px)",
            border: "1px solid #e1e5e9",
            borderRadius: 8,
          }}
        >
          <List
            height={window.innerHeight - 200}
            itemCount={filteredItems.length}
            itemSize={itemHeight}
            itemData={filteredItems}
            overscanCount={5} // Render 5 extra items outside visible area
          >
            {ItemRow}
          </List>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "#666",
          }}
        >
          {searchQuery ? (
            <>
              <div style={{ fontSize: 18, marginBottom: 8 }}>
                No items found
              </div>
              <div>Try adjusting your search terms</div>
            </>
          ) : (
            "No items available"
          )}
        </div>
      )}
    </div>
  );
}

export default ItemsVirtualized;
