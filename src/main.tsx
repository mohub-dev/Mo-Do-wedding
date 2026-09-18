import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { WeddingDataProvider } from './context/WeddingDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <WeddingDataProvider>
        <App />
      </WeddingDataProvider>
    </ErrorBoundary>
  </StrictMode>,
);


