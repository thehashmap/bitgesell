import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (params = {}) => {
    const { limit = 500, q = "", signal } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit);
    if (q) queryParams.append("q", q);

    const url = `http://localhost:3001/api/items${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Failed to fetch items: ${res.status}`);
    }

    const json = await res.json();

    // Only update state if request wasn't aborted
    if (!signal?.aborted) {
      setItems(json);
    }

    return json;
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems, setItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
