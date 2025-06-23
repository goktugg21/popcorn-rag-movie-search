import React from 'react';

const SearchPanel = ({
  activeSearchTab,
  setActiveSearchTab,
  searchFilters,
  setSearchFilters,
  aiQuery,
  setAiQuery,
  aiResponse,
  aiLoading,
  isSearchMode,
  applyFilters,
  handleAiSearch,
  clearSearch,
  isLoggedIn,
  showFavoritesOnly,
  setShowFavoritesOnly
}) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  }}>
    <h3 style={{ marginTop: 0 }}>🔍 Search Movies</h3>
    
    {/* Search Tabs */}
    <div style={{ 
      display: 'flex', 
      borderBottom: '1px solid #ddd', 
      marginBottom: '20px' 
    }}>
      <button
        onClick={() => setActiveSearchTab('filters')}
        style={{
          padding: '10px 20px',
          backgroundColor: activeSearchTab === 'filters' ? '#007bff' : 'transparent',
          color: activeSearchTab === 'filters' ? 'white' : '#007bff',
          border: 'none',
          borderBottom: activeSearchTab === 'filters' ? '2px solid #007bff' : '2px solid transparent',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        📊 Filter Search
      </button>
      <button
        onClick={() => setActiveSearchTab('ai')}
        style={{
          padding: '10px 20px',
          backgroundColor: activeSearchTab === 'ai' ? '#007bff' : 'transparent',
          color: activeSearchTab === 'ai' ? 'white' : '#007bff',
          border: 'none',
          borderBottom: activeSearchTab === 'ai' ? '2px solid #007bff' : '2px solid transparent',
          cursor: 'pointer'
        }}
      >
        🤖 AI Search
      </button>
    </div>

    {/* Filter Search Tab */}
    {activeSearchTab === 'filters' && (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Keyword:</label>
            <input
              type="text"
              value={searchFilters.keyword}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Genres:</label>
            <input
              type="text"
              value={searchFilters.genres.join(', ')}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                genres: e.target.value.split(',').map(g => g.trim()).filter(g => g) 
              }))}
              placeholder="Action, Comedy, Drama"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Year:</label>
            <input
              type="text"
              value={searchFilters.year.join(', ')}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                year: e.target.value.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y))
              }))}
              placeholder="2015, 2016"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Rating:</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={searchFilters.rating || ''}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                rating: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Favorites Filter - Sadece login olan kullanıcılar için */}
        {isLoggedIn && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold' }}>❤️ Show only my favorites</span>
            </label>
          </div>
        )}

        <button
          onClick={applyFilters}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔍 Search
        </button>
        {isSearchMode && (
          <button
            onClick={clearSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Categories
          </button>
        )}
      </div>
    )}

    {/* AI Search Tab */}
    {activeSearchTab === 'ai' && (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ask AI about movies:
          </label>
          <textarea
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g., 'Show me action movies with great visual effects'"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>
        <button
          onClick={handleAiSearch}
          disabled={aiLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: aiLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {aiLoading ? '🤖 Searching...' : '🤖 AI Search'}
        </button>
        {isSearchMode && activeSearchTab === 'ai' && (
          <button
            onClick={clearSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Categories
          </button>
        )}
        {aiResponse && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🤖 AI Response:</h4>
            <p style={{ margin: 0, color: '#6c757d', lineHeight: '1.5' }}>{aiResponse}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

export default SearchPanel;