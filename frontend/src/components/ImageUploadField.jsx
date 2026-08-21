import { useRef, useState } from 'react';
import { uploadImage } from '../api/api';

export default function ImageUploadField({ value, onChange, placeholder = 'https://…' }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="image-upload-field">
      <div className="image-upload-row">
        <input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="input"
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
