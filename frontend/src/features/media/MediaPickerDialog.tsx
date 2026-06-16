import { X } from "lucide-react";
import { demoMedia } from "../../services/demoData";
import type { MediaAsset } from "../../services/cmsTypes";

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}

export function MediaPickerDialog({ open, onClose, onSelect }: MediaPickerDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-lg border border-ld bg-white p-6 shadow-md dark:border-[#333f55] dark:bg-dark">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="card-title">Media Picker</h2>
          <button className="h-9 w-9 rounded-full hover:bg-lightprimary hover:text-primary" type="button" aria-label="닫기" onClick={onClose}>
            <X className="mx-auto h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {demoMedia.map((asset) => (
            <button key={asset.id} className="rounded-md border border-ld p-3 text-left hover:bg-primary/10 dark:border-[#333f55]" type="button" onClick={() => onSelect(asset)}>
              <div className="mb-3 aspect-video overflow-hidden rounded-md bg-lightsecondary">
                {asset.mimeType.startsWith("image/") ? <img className="h-full w-full object-cover" src={asset.url} alt={asset.altText ?? asset.fileName} /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">PDF</div>}
              </div>
              <p className="truncate text-sm font-semibold">{asset.fileName}</p>
              <p className={`text-xs ${asset.altText ? "text-muted-foreground" : "text-error"}`}>{asset.altText ?? "altText 누락"}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
