import { renderToString } from 'react-dom/server';
import { Router } from 'wouter';
import { App } from '../common/App.jsx';
import { getCssText } from '../lib/utils.jsx';

export const render = url => {
  const appHtml = renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>
  );

  const stitchesCss = getCssText();

  return { appHtml, stitchesCss };
};
