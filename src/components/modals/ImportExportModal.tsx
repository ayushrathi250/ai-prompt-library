import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, Download, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePrompts } from '../../context/PromptContext';
import toast from 'react-hot-toast';

export const ImportExportModal: React.FC = () => {
  const {
    isImportExportModalOpen,
    setIsImportExportModalOpen,
    importPrompts,
    exportPrompts,
  } = usePrompts();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewCount, setFilePreviewCount] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    setIsImportExportModalOpen(false);
    setSelectedFile(null);
    setFilePreviewCount(null);
    setParsedData(null);
    setValidationError(null);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setValidationError('Please select a valid .json file');
      return;
    }

    setValidationError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!Array.isArray(json)) {
          setValidationError('JSON file must contain an array of prompt objects');
          setParsedData(null);
          setFilePreviewCount(null);
          return;
        }

        setParsedData(json);
        setFilePreviewCount(json.length);
      } catch (err) {
        setValidationError('Failed to parse JSON file syntax');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    const success = await importPrompts(parsedData);
    if (success) handleClose();
  };

  return (
    <Modal
      isOpen={isImportExportModalOpen}
      onClose={handleClose}
      title="Import & Export Prompts"
      subtitle="Backup or bulk load JSON prompt templates to your database."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Export Section */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Export Prompt Library
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
              Download all your prompts in JSON format.
            </p>
          </div>
          <button
            onClick={exportPrompts}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 font-bold text-slate-400">
              Or Bulk Import
            </span>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative p-8 text-center border-2 border-dashed rounded-2xl transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag and drop your <span className="text-indigo-600 dark:text-indigo-400">.json</span> file here
            </p>
            <p className="text-xs text-slate-400">or click to browse from computer</p>
          </div>
        </div>

        {/* File Preview & Validation Status */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            {validationError}
          </div>
        )}

        {selectedFile && filePreviewCount !== null && !validationError && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold">{selectedFile.name}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Ready to import <span className="font-bold">{filePreviewCount}</span> prompt templates.
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedData || !!validationError}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Confirm Import
          </button>
        </div>
      </div>
    </Modal>
  );
};
