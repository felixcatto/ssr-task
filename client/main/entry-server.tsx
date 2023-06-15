import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import { App } from '../common/App.jsx';

export const render = url =>
  renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>
  );
