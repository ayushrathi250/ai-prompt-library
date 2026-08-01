import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import Modal from './Modal';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  description?: string;
  confirmLabel?: string;
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete prompt',
  itemName,
  description = 'This permanently removes the prompt from your library. This action cannot be undone.',
  confirmLabel = 'Delete permanently',
}: DeleteDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      size="sm"
      title={title}
      icon={<AlertTriangle className="h-5 w-5 text-danger" strokeWidth={2} />}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="focus-ring rounded-lg border border-edge px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        {itemName && (
          <>
            You're about to delete{' '}
            <span className="font-semibold text-ink">“{itemName}”</span>.{' '}
          </>
        )}
        {description}
      </p>
      <div className="mt-4 rounded-lg border border-danger/25 bg-danger/8 px-3.5 py-2.5 text-[13px] text-danger">
        Tip: export your library first if you might want it back.
      </div>
    </Modal>
  );
}

export default DeleteDialog;
