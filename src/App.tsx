import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { PromptProvider, usePrompts } from './context/PromptContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardPage } from './pages/Dashboard';
import { AllPromptsPage } from './pages/AllPromptsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PromptDetailsModal } from './components/prompts/PromptDetailsModal';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { ImportExportModal } from './components/modals/ImportExportModal';
import { DeleteDialog } from './components/common/DeleteDialog';

const MainContent: React.FC = () => {
  const { activeTab, promptToDelete, setPromptToDelete, deletePrompt } = usePrompts();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return;
    setIsDeleting(true);
    await deletePrompt(promptToDelete._id);
    setIsDeleting(false);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'settings':
        return <SettingsPage />;
      case 'all':
      case 'favorites':
      case 'pinned':
      case 'category':
      default:
        return <AllPromptsPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Top Header */}
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <PromptDetailsModal />
      <PromptFormModal />
      <ImportExportModal />
      <DeleteDialog
        isOpen={!!promptToDelete}
        prompt={promptToDelete}
        onClose={() => setPromptToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <PromptProvider>
        <MainContent />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontSize: '13px',
              borderRadius: '14px',
              padding: '12px 16px',
            },
          }}
        />
      </PromptProvider>
    </ThemeProvider>
  );
}
