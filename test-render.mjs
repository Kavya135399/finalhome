import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TaxiBookingPage } from './src/pages/TaxiBookingPage';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';

try {
  console.log("Starting server-side rendering test...");
  
  const html = ReactDOMServer.renderToString(
    React.createElement(MemoryRouter, {},
      React.createElement(ToastProvider, {},
        React.createElement(AuthProvider, {},
          React.createElement(TaxiBookingPage)
        )
      )
    )
  );
  
  console.log("Render completed successfully! HTML length:", html.length);
} catch (err) {
  console.error("Render failed with exception:", err);
}
