// App.js
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { Worker } from '@react-pdf-viewer/core';
import AppRoutes from './routes/index.js';
import config from './config.ts';

function App() {
  //disable console logs in production and staging/uat
  // if (config.envKey === 'production' || config.envKey === 'staging') {
  //   console.log = () => {};
  //   console.warn = () => {};
  //   console.error = () => {};
  //   console.info = () => {};
  //   console.debug = () => {};
  // }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <Router>
        <AppRoutes />
      </Router>
    </Worker>
  );
}

export default App;
