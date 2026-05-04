import { useState, useRef, useCallback } from 'react';
import './ImageUploader.css';

const API = 'http://localhost:5000/api';

export default function ImageUploader({ value, onChange, token, productId, gallery = [], onGalleryChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const galleryRef = useRef(null);

  const uploadFile = async (file) => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryFiles = async (files) => {
    if (!productId || !onGalleryChange) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of files) formData.append('images', f);
      const res = await fetch(`${API}/upload/product/${productId}/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      onGalleryChange([...gallery, ...data.images.map((img, i) => ({ id: Date.now() + i, image_url: img.url }))]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = async (imageId) => {
    if (!productId) return;
    try {
      await fetch(`${API}/upload/product/${productId}/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onGalleryChange(gallery.filter(g => g.id !== imageId));
    } catch {}
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadGalleryFiles(files);
  };

  const previewUrl = value ? (value.startsWith('/') ? `http://localhost:5000${value}` : value) : null;

  return (
    <div className="img-uploader">
      {/* Primary Image */}
      <label className="img-uploader__label">Primary Image</label>

      <div
        className={`img-uploader__dropzone ${dragActive ? 'img-uploader__dropzone--active' : ''} ${uploading ? 'img-uploader__dropzone--uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {previewUrl ? (
          <div className="img-uploader__preview">
            <img src={previewUrl} alt="Product preview" />
            <div className="img-uploader__overlay">
              <span>Click or drop to replace</span>
            </div>
          </div>
        ) : uploading ? (
          <div className="img-uploader__loading">
            <div className="img-uploader__spinner"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="img-uploader__placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Drop an image here or click to browse</span>
            <span className="img-uploader__hint">JPG, PNG, WebP, AVIF · Max 5 MB</span>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} hidden />

      {/* Manual URL fallback */}
      <div className="img-uploader__url-row">
        <span className="img-uploader__or">or paste URL</span>
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="img-uploader__url-input"
        />
      </div>

      {error && <div className="img-uploader__error">{error}</div>}

      {/* Gallery (only for existing products) */}
      {productId && onGalleryChange && (
        <div className="img-uploader__gallery-section">
          <div className="img-uploader__gallery-header">
            <label className="img-uploader__label">Gallery Images</label>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => galleryRef.current?.click()}
              disabled={uploading}
            >
              + Add Images
            </button>
            <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGallerySelect} hidden />
          </div>

          {gallery.length > 0 ? (
            <div className="img-uploader__gallery-grid">
              {gallery.map(img => (
                <div key={img.id} className="img-uploader__gallery-item">
                  <img src={img.image_url.startsWith('/') ? `http://localhost:5000${img.image_url}` : img.image_url} alt="" />
                  <button
                    type="button"
                    className="img-uploader__gallery-remove"
                    onClick={() => removeGalleryImage(img.id)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="img-uploader__gallery-empty">No gallery images. Add images to create a product gallery.</p>
          )}
        </div>
      )}
    </div>
  );
}
