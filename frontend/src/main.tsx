import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { WorkflowPage } from './pages/WorkflowPage';
import './index.css';

function Root() {
  const isWorkflow =
    window.location.pathname === '/workflow' ||
    window.location.search.includes('page=workflow') ||
    window.location.search.includes('tab=workflow');

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

