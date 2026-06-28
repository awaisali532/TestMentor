import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaTimes } from "react-icons/fa";
import { getCroppedImg } from "../../../../utils/cropUtils";

const ImageCropperModal = ({ imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-pop-up">
        <div className="flex justify-between items-center p-4 border-b border-border bg-card">
          <h5 className="font-extrabold text-main m-0">Adjust Photo</h5>
          <button
            onClick={onClose}
            className="text-muted hover:text-red-500 transition-colors p-1 cursor-pointer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="relative w-full h-72 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-5 bg-card">
          <label className="block text-sm font-bold text-main mb-3">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(e.target.value)}
            className="w-full mb-6 accent-accent-1"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold bg-pill-bg text-muted hover:text-main transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl font-bold bg-accent-1 text-white hover:bg-accent-2 transition-colors cursor-pointer"
            >
              Set Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
