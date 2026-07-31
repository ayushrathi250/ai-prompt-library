import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Prompt } from '../../types/prompt';

interface DeleteDialogProps {
  isOpen: boolean;
  prompt: Prompt | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  prompt,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!prompt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="text-center sm:text-left">
        <div className="mx-auto sm:mx-0 flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-4 border border-rose-200 dark:border-rose-900/50">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Delete Prompt?
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            "{prompt.title}"
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Prompt'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
