import '../css/index.css'; // Import FIRST
import { hydrateRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { App } from '../common/App.jsx';

// because of Vite specific behavior we need some hacks in dev mode
const isDevelopment = import.meta.env.DEV;
if (isDevelopment) {
  // add server rendered CSS in JS
  const headEl = document.querySelector('head')!;
  const styleTag = document.createElement('style');
  const styleContent = document.createTextNode(window.stitchesCss);
  styleTag.appendChild(styleContent);
  headEl.appendChild(styleTag);

  // avoid FOUC
  document.body.style.display = '';
}

hydrateRoot(
  document.getElementById('root')!,
  <Router>
    <App />
  </Router>
);
