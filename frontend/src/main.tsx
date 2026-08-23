import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { WorkflowPage } from './pages/WorkflowPage';
import './index.css';

function Root() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname + window.location.search + window.location.hash
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search + window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const isWorkflow =
    window.location.pathname.endsWith('/workflow') ||
    window.location.pathname.includes('/workflow') ||
    window.location.search.includes('page=workflow') ||
    window.location.search.includes('workflow=true') ||
    window.location.search.includes('tab=workflow') ||
    window.location.hash.includes('workflow');

  if (isWorkflow) {
    return <WorkflowPage />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
