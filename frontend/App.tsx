import React, { useCallback, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useOutletContext,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import PromptFormModal from './components/prompts/PromptFormModal';
import PromptDetailsModal from './components/prompts/PromptDetailsModal';
import ImportExportModal from './components/modals/ImportExportModal';
import DeleteDialog from './components/common/DeleteDialog';
import Dashboard from './pages/Dashboard';
import AllPromptsPage from './pages/AllPromptsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PromptProvider, usePrompts } from './context/PromptContext';
import type { CategoryName, Prompt } from './types/prompt';

/** Shared handlers every page receives through the router outlet. */
export interface ShellContext {
  openCreate: (category?: CategoryName) => void;
  openEdit: (prompt: Prompt) => void;
  openDetails: (prompt: Prompt) => void;
  requestDelete: (prompt: Prompt) => void;
  openImportExport: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShell() {
  return useOutletContext<ShellContext>();
}

function Shell() {
  const { removePrompt } = usePrompts();
  const { isDark } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<CategoryName | undefined>();
  const [details, setDetails] = useState<Prompt | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Prompt | null>(null);
  const [ioOpen, setIoOpen] = useState(false);

  const openCreate = useCallback((category?: CategoryName) => {
    setEditing(null);
    setDefaultCategory(category);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((prompt: Prompt) => {
    setEditing(prompt);
    setDefaultCategory(undefined);
    setFormOpen(true);
  }, []);

  const openDetails = useCallback((prompt: Prompt) => setDetails(prompt), []);
  const requestDelete = useCallback((prompt: Prompt) => setPendingDelete(prompt), []);
  const openImportExport = useCallback(() => setIoOpen(true), []);

  const context: ShellContext = {
    openCreate,
    openEdit,
    openDetails,
    requestDelete,
    openImportExport,
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNewPrompt={() => openCreate()}
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setDrawerOpen(true)}
          onNewPrompt={() => openCreate()}
          onImportExport={openImportExport}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet context={context} />
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 border-t border-edge pt-5 text-[12px] text-muted sm:flex-row">
            <p>Promptsmith — a personal library for prompts worth keeping.</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">
              Local-first · exportable · yours
            </p>
          </div>
        </footer>
      </div>

      {/* Global modals */}
      <PromptFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        prompt={editing}
        defaultCategory={defaultCategory}
      />
      <PromptDetailsModal
        open={Boolean(details)}
        prompt={details}
        onClose={() => setDetails(null)}
        onEdit={openEdit}
        onDelete={requestDelete}
      />
      <ImportExportModal open={ioOpen} onClose={() => setIoOpen(false)} />
      <DeleteDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        itemName={pendingDelete?.title}
        onConfirm={async () => {
          if (pendingDelete) await removePrompt(pendingDelete.id);
        }}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2600,
          style: {
            background: isDark ? '#221d18' : '#fffdf8',
            color: isDark ? '#f3ead9' : '#221c15',
            border: `1px solid ${isDark ? '#322a23' : '#e2d7c3'}`,
            borderRadius: '12px',
            fontSize: '13.5px',
            fontFamily: 'Karla, system-ui, sans-serif',
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
            maxWidth: '380px',
          },
          success: { iconTheme: { primary: isDark ? '#56c2a4' : '#1f6f5c', secondary: isDark ? '#1a1613' : '#fffdf8' } },
          error: { iconTheme: { primary: isDark ? '#f2705f' : '#b3261e', secondary: isDark ? '#1a1613' : '#fffdf8' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PromptProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prompts" element={<AllPromptsPage scope="all" />} />
              <Route path="/favorites" element={<AllPromptsPage scope="favorites" />} />
              <Route path="/pinned" element={<AllPromptsPage scope="pinned" />} />
              <Route
                path="/categories/:categoryId"
                element={<AllPromptsPage scope="category" />}
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PromptProvider>
    </ThemeProvider>
  );
}
