import { ImageUp } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { CommunityCreationRequest } from '../api/communityCreationClient';

interface ImageUploaderProps {
  request: CommunityCreationRequest;
  saving: boolean;
  onUpload: (file: File) => Promise<void>;
  onNext: () => void;
}

export function ImageUploader({ request, saving, onUpload, onNext }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    await onUpload(file);
  }

  return (
    <section className="editor-stack">
      <div className="image-uploader">
        <div className="image-preview">
          {previewUrl ? <img src={previewUrl} alt="대표 이미지 미리보기" /> : <ImageUp size={44} aria-hidden="true" />}
        </div>
        <div>
          <strong>대표 이미지</strong>
          <p>PNG, JPEG, WebP 형식과 5MB 이하 파일을 사용할 수 있습니다. 최소 권장 크기는 400x240입니다.</p>
          <label className="file-button">
            이미지 선택
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleFile(event)} />
          </label>
          {request.representativeImageId ? <span className="field-hint success">대표 이미지 메타데이터가 저장되었습니다.</span> : null}
        </div>
      </div>
      <div className="form-actions">
        <button className="primary-button" type="button" onClick={onNext} disabled={saving}>
          다음
        </button>
      </div>
    </section>
  );
}
