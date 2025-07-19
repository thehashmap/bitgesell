import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

function Items() {
  const { items, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      loadItems(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load items function with proper cleanup
  const loadItems = useCallback(
    async (query = "") => {
      setLoading(true);
      setError(null);

      try {
        await fetchItems({
          q: query,
          limit: 1000, // Load more items for client-side pagination
        });
      } catch (error) {
        setError("Failed to load items. Please try again.");
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchItems]
  );

  // Initial load
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Filter items based on search query (client-side for better UX)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
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
            Showing{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredItems.length
            )}
            -{Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
            {filteredItems.length} items
            {searchQuery && ` for "${searchQuery}"`}
          </>
        ) : searchQuery ? (
          `No items found for "${searchQuery}"`
        ) : (
          "No items available"
        )}
      </div>

      {/* Items List */}
      {paginatedItems.length > 0 ? (
        <>
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 16,
                  border: "1px solid #e1e5e9",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
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
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e1e5e9",
                  backgroundColor: currentPage === 1 ? "#f8f9fa" : "#fff",
                  color: currentPage === 1 ? "#999" : "#333",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #e1e5e9",
                      backgroundColor:
                        page === currentPage ? "#007bff" : "#fff",
                      color: page === currentPage ? "#fff" : "#333",
                      borderRadius: 4,
                      cursor: "pointer",
                      minWidth: 40,
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e1e5e9",
                  backgroundColor:
                    currentPage === totalPages ? "#f8f9fa" : "#fff",
                  color: currentPage === totalPages ? "#999" : "#333",
                  borderRadius: 4,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
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

export default Items;
