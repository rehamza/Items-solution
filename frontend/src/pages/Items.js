// Required dependencies: react-window, react-router-dom, react-loading-skeleton, lodash.debounce
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useData } from '../state/DataContext';
import debounce from 'lodash.debounce';

const PAGE_SIZE = 50;

function ItemsTable() {
  const { items, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const isActiveRef = useRef(true);

  // Debounce effect for search
  const debouncedUpdate = useMemo(() => debounce((value) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 400), []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    debouncedUpdate(e.target.value);
  }, [debouncedUpdate]);

  useEffect(() => {
    isActiveRef.current = true;
    setLoading(true);
    fetchItems({ q: debouncedSearch, limit: PAGE_SIZE, page }, isActiveRef)
      .finally(() => {
        if (isActiveRef.current) setLoading(false);
      });
    return () => { isActiveRef.current = false; };
  }, [debouncedSearch, page, fetchItems]);

  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return null;
    return (
      <div
        style={{
          ...style,
          padding: '8px 16px',
          borderBottom: '1px solid #eee',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <Link to={`/items/${item.id}`}>{item.name}</Link> – <em>{item.category}</em> – ${item.price}
      </div>
    );
  };

  return (
    <div style={{ padding: 16, maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <h2>Items List</h2>

      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search by name..."
        style={{ padding: 8, marginBottom: 16, width: '100%', maxWidth: 400 }}
      />

      {loading ? (
        <Skeleton count={8} height={40} style={{ marginBottom: 8 }} />
      ) : (
        <div style={{ height: 400, border: '1px solid #ddd', overflowX: 'hidden' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={items.length}
                itemSize={50}
                width={width}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page}</span>
        <button disabled={items.length < PAGE_SIZE} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default ItemsTable;
