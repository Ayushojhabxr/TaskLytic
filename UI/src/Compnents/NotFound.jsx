
// NotFound.js component for 404 page
import React from 'react';

const NotFound = () => {
  return (
    <div 
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}
    >
      <h1 
        style={{
          fontSize: '8rem',
          fontWeight: 'bold',
          color: '#343a40',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '2rem',
          color: '#6c757d',
          marginTop: '1rem',
          marginBottom: '2rem'
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: '1.2rem',
          color: '#6c757d',
          textAlign: 'center',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          ':hover': {
            backgroundColor: '#0056b3'
          }
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;