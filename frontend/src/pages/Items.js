import React, { useEffect } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

function Items() {
  const { items, fetchItems } = useData();

  useEffect(() => {
    const abortController = new AbortController();

    // Fetch items with abort signal to prevent memory leaks
    const loadItems = async () => {
      try {
        await fetchItems({ signal: abortController.signal });
      } catch (error) {
        // Only log error if request wasn't aborted (component still mounted)
        if (!abortController.signal.aborted) {
          console.error("Failed to fetch items:", error);
        }
      }
    };

    loadItems();

    // Clean-up to avoid memory leak - abort the fetch request
    return () => {
      abortController.abort();
    };
  }, [fetchItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <Link to={"/items/" + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;
