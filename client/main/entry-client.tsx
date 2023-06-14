import '../css/index.css'; // Import FIRST
import { createRoot } from 'react-dom/client';
import { App } from '../common/App.jsx';

createRoot(document.getElementById('root')!).render(<App />);
