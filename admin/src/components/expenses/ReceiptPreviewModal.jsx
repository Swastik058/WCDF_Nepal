import { useState } from 'react';

// Cloudinary raw uploads use Content-Disposition: attachment by default.
// Inserting fl_attachment:false tells Cloudinary to serve the file inline so
// the browser can render the PDF instead of downloading it.
const getInlinePdfUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  return url.replace('/upload/', '/upload/fl_attachment:false/');
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function ReceiptPreviewModal({ expense, onClose, onDeleteReceipt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const receipts = expense?.uploadedReceipts || [];
  const active = receipts[activeIndex];
  const isImage = active?.fileType === 'image' || active?.mimeType?.startsWith('image/');
  const isPdf = active?.mimeType === 'application/pdf' || active?.fileType === 'raw';

  const handleDelete = async (receiptId) => {
    if (!onDeleteReceipt) return;
    setDeleting(receiptId);
    try {
      await onDeleteReceipt(expense._id, receiptId, expense.title);
      // Move active index back if needed
      if (activeIndex >= receipts.length - 1) {
        setActiveIndex(Math.max(0, activeIndex - 1));
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{expense.title}</h2>
            <p className="text-xs text-slate-500">
              {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} attached
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {receipts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
            No receipts attached to this expense.
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* ── Sidebar: thumbnail list ── */}
            <div className="flex w-36 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-2">
              {receipts.map((r, i) => {
                const isImg = r.fileType === 'image' || r.mimeType?.startsWith('image/');
                return (
                  <button
                    key={r._id || i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative rounded-md border-2 p-1 text-left transition ${
                      activeIndex === i ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    {isImg ? (
                      <img
                        src={r.url}
                        alt={r.originalName || `Receipt ${i + 1}`}
                        className="h-20 w-full rounded object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex h-20 w-full flex-col items-center justify-center rounded bg-slate-200 text-slate-500">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="mt-1 text-xs">PDF</span>
                      </div>
                    )}
                    <p className="mt-1 truncate text-xs text-slate-500">{r.originalName || `Receipt ${i + 1}`}</p>
                  </button>
                );
              })}
            </div>

            {/* ── Main viewer ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Viewer area */}
              <div className={`relative flex flex-1 items-center justify-center overflow-auto bg-slate-100 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                {isImage && active?.url && (
                  <img
                    src={active.url}
                    alt={active.originalName || 'Receipt'}
                    onClick={() => setZoom((z) => !z)}
                    className={`rounded transition-transform ${zoom ? 'max-w-none scale-150' : 'max-h-[420px] max-w-full object-contain'}`}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {isPdf && active?.url && (
                  <div className="flex h-full w-full flex-col" style={{ minHeight: 420 }}>
                    <iframe
                      src={getInlinePdfUrl(active.url)}
                      title="Receipt PDF"
                      className="flex-1 w-full border-0"
                      style={{ minHeight: 400 }}
                    />
                    <p className="shrink-0 py-1 text-center text-xs text-slate-400">
                      PDF not displaying?{' '}
                      <a href={active.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                        Open in new tab
                      </a>
                    </p>
                  </div>
                )}
                {!isImage && !isPdf && (
                  <div className="text-center text-slate-400">
                    <svg className="mx-auto h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Preview not available</p>
                  </div>
                )}
              </div>

              {/* File info + actions */}
              {active && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-xs">
                      {active.originalName || `Receipt ${activeIndex + 1}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {active.mimeType || active.fileType} · {formatBytes(active.fileSize)} · Uploaded {formatDate(active.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Zoom toggle (only for images) */}
                    {isImage && (
                      <button
                        onClick={() => setZoom((z) => !z)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        title={zoom ? 'Zoom out' : 'Zoom in'}
                      >
                        {zoom ? '🔍 Zoom out' : '🔍 Zoom in'}
                      </button>
                    )}
                    {/* Download */}
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      ↓ Download
                    </a>
                    {/* Delete */}
                    {onDeleteReceipt && (
                      <button
                        onClick={() => handleDelete(active._id)}
                        disabled={deleting === active._id}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                      >
                        {deleting === active._id ? 'Deleting…' : '✕ Delete'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation arrows */}
              {receipts.length > 1 && (
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 bg-white px-4 py-2">
                  <button
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-slate-500">{activeIndex + 1} / {receipts.length}</span>
                  <button
                    onClick={() => setActiveIndex((i) => Math.min(receipts.length - 1, i + 1))}
                    disabled={activeIndex === receipts.length - 1}
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
