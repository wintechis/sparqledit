import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';

// workaround to suppress console logs in builds
if (process.env.NODE_ENV !== 'development') {
  console.log = () => {}
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
