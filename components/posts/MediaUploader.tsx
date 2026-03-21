'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { uploadApi, UploadedFile } from '@/lib/api-upload';

interface MediaUploaderProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
}

export default function MediaUploader({
  onUploadComplete,
  maxFiles = 10,
  accept = 'image/*,video/*',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Solo puedes subir hasta ${maxFiles} archivos`);
      return;
    }

    setUploading(true);

    // Create previews
    const newPreviews: { [key: string]: string } = {};
    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews[`temp-${index}`] = reader.result as string;
          setPreviews((prev) => ({ ...prev, ...newPreviews }));
        };
        reader.readAsDataURL(file);
      }
    });

    try {
      const uploaded = await uploadApi.uploadMultiple(files, (fileIndex, progress) => {
        setUploadProgress((prev) => ({ ...prev, [fileIndex]: progress }));
      });

      const newFiles = [...uploadedFiles, ...uploaded];
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);

      // Create permanent previews
      uploaded.forEach((file) => {
        if (file.mime_type.startsWith('image/')) {
          setPreviews((prev) => ({ ...prev, [file.url]: file.url }));
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      {uploadedFiles.length < maxFiles && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <ImageIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">Foto/video</span>
        </Button>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-2 space-y-2">
          {Object.entries(uploadProgress).map(([index, progress]) => (
            <div key={index} className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Grid */}
      {uploadedFiles.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden">
              {file.mime_type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-900 flex items-center justify-center">
                  <Video className="w-12 h-12 text-white" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
