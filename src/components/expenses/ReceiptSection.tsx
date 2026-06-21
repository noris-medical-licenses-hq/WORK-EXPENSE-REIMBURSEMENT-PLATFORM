"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Image, Trash2, Loader2, ExternalLink } from "lucide-react";
import { ReceiptService } from "@/lib/services/receipt.service";
import type { Receipt } from "@/lib/types/expense.types";

interface Props {
  expenseId: string;
  userId: string;
  onReceiptStatusChange?: () => void;
}

export function ReceiptSection({ expenseId, userId, onReceiptStatusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadReceipts() {
    try {
      const data = await ReceiptService.findByExpense(expenseId);
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReceipts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    setUploading(true);
    setError(null);
    try {
      const receipt = await ReceiptService.upload(userId, expenseId, file);
      setReceipts((prev) => [receipt, ...prev]);
      onReceiptStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(receipt: Receipt) {
    if (!confirm(`Delete ${receipt.file_name}?`)) return;
    setDeletingId(receipt.id);
    setError(null);
    try {
      await ReceiptService.remove(
        userId,
        expenseId,
        receipt.id,
        receipt.file_path,
        receipts.length
      );
      setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
      onReceiptStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleView(receipt: Receipt) {
    try {
      const url = await ReceiptService.getSignedUrl(receipt.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open receipt");
    }
  }

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-700">Receipts</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              Add Receipt
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {error && (
        <div className="mx-4 my-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : receipts.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center gap-2 py-8 text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs">Tap to upload receipt</span>
          <span className="text-[10px] text-slate-300">JPEG, PNG, WebP, HEIC, PDF · max 10 MB</span>
        </button>
      ) : (
        <ul className="divide-y divide-slate-100">
          {receipts.map((receipt) => (
            <li key={receipt.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {isImage(receipt.file_type) ? (
                  <Image className="w-4 h-4 text-slate-500" />
                ) : (
                  <FileText className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 truncate">{receipt.file_name}</p>
                <p className="text-xs text-slate-400">
                  {(receipt.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleView(receipt)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="View receipt"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(receipt)}
                  disabled={deletingId === receipt.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete receipt"
                >
                  {deletingId === receipt.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {receipts.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full text-xs text-blue-600 hover:text-blue-700 py-1 disabled:opacity-50 transition-colors"
          >
            + Add another receipt
          </button>
        </div>
      )}
    </div>
  );
}
