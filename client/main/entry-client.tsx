import '../css/index.css'; // Import FIRST
import { hydrateRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { App } from '../common/App.jsx';

hydrateRoot(
  document.getElementById('root')!,
  <Router>
    <App />
  </Router>
);
