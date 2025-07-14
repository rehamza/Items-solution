import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (params = {}, isActiveRef) => {
    try {
      const query = new URLSearchParams({
        q: params.q || '',
        limit: params.limit?.toString() || '500',
        page: params.page?.toString() || '1',
      });

      const res = await fetch(`http://localhost:3001/api/items?${query}`);
      const json = await res.json();

      if (isActiveRef?.current === false) return;
      setItems(json.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
