import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, File, X, Loader2 } from "lucide-react";

const ACCEPTED_TYPES = [
  { ext: "PDF", mime: "application/pdf" },
  { ext: "DOCX", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { ext: "JPG", mime: "image/jpeg" },
  { ext: "PNG", mime: "image/png" },
  { ext: "TXT", mime: "text/plain" },
  { ext: "EML", mime: "message/rfc822" },
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
}

export function UploadForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);

    if (f.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setFile(f);

    // Generate preview for images
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  async function handleSubmit() {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      let extractedText = "";

      if (file.type === "text/plain" || file.type === "message/rfc822") {
        extractedText = await file.text();
      } else if (file.type.startsWith("image/")) {
        extractedText = `[Image uploaded: ${file.name}]`;
      } else {
        // PDF/DOCX: placeholder for demo
        extractedText = `[Document uploaded: ${file.name}, ${formatSize(file.size)}]`;
      }

      // Call extraction API
      const res = await fetch("/api/form/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, source: "upload", filename: file.name }),
      });

      if (!res.ok) throw new Error("Extraction failed");

      const data = await res.json();
      navigate("/form/confirm", { state: { extracted: data, source: "upload" } });
    } catch {
      setError("Something went wrong processing your file. Please try again.");
      setProcessing(false);
    }
  }

  const FileIcon = file ? getFileIcon(file.type) : Upload;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Upload a file</h1>
        <p className="text-sm text-on-surface-muted mt-1">
          Upload a flyer, email, or screenshot and we'll extract the details automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 p-10 rounded-xl transition-colors min-h-[240px] cursor-pointer ${
          dragOver
            ? "bg-primary-container/10 ring-2 ring-primary"
            : file
              ? "bg-surface-container-low"
              : "bg-surface-container-low hover:bg-surface-container-high"
        }`}
        onClick={() => !file && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload file drop zone"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.map((t) => t.mime).join(",")}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Choose file to upload"
        />

        {file ? (
          <div className="flex flex-col items-center gap-3 w-full">
            {preview ? (
              <img src={preview} alt={`Preview of ${file.name}`} className="max-h-32 rounded-xl object-contain" />
            ) : (
              <FileIcon className="w-12 h-12 text-primary" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-on-surface">{file.name}</p>
              <p className="text-xs text-on-surface-muted">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-muted hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Remove selected file"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-on-surface">
                Drag and drop your file here
              </p>
              <p className="text-xs text-on-surface-muted mt-1">or click to browse</p>
            </div>
          </>
        )}
      </div>

      {/* File type badges */}
      <div className="flex flex-wrap justify-center gap-2">
        {ACCEPTED_TYPES.map((t) => (
          <span
            key={t.ext}
            className="px-3 py-1 rounded-full bg-surface-container-highest text-xs font-medium text-on-surface-muted"
          >
            {t.ext}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full bg-surface-container-highest text-xs text-on-surface-muted">
          Max 10 MB
        </span>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-secondary font-medium text-center">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || processing}
        className="self-center flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
            Processing...
          </>
        ) : (
          "Extract & Continue"
        )}
      </button>
    </div>
  );
}
