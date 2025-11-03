import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/Dashboard';
import './App.css';

/**
 * The root component of the application.
 * It renders the main Dashboard page and the ToastContainer
 * for global notifications.
 */
function App() {
  return (
    <div className="App">
      <Dashboard />
      
      {/* This component is for showing toast notifications (alerts).
        We configure its position, theme, and behavior here.
      */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;