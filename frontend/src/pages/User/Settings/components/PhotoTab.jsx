import React, { useState } from "react";
import axios from "axios";
import { FaCamera, FaTrash, FaUniversity } from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useUser } from "../../../../context/UserContext";
import ImageCropperModal from "./ImageCropperModal";
import Loader from "../../../../components/ui/Loader";

const PhotoTab = ({ user }) => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);

  // ✅ 3. Unified Cropper State (Handles both Profile and Institute)
  const [imageSrc, setImageSrc] = useState(null);
  const [cropType, setCropType] = useState(null); // 'profile' or 'institute'

  // ✅ 3. SweetAlert Delete Warning
  const confirmDelete = (type) => {
    Swal.fire({
      title: "Delete Image?",
      text: `Are you sure you want to remove your ${type === "profile" ? "Profile Photo" : "Institute Logo"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      background: "#0f172a",
      color: "#ffffff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const endpoint =
            type === "profile" ? "profile/image" : "institute/logo";
          await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/${endpoint}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          const updatedUser = { ...user };
          if (type === "profile") updatedUser.image = "";
          else updatedUser.institute.logo = "";

          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          toast.success("Image removed successfully!");
        } catch (err) {
          toast.error("Failed to remove image");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // --- Unified Photo Selection (For Cropper) ---
  const onFileChange = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result.toString());
        setCropType(type); // Record which image is being cropped
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = null; // Reset input
    }
  };

  // --- Upload Cropped Image (Handles Both) ---
  const uploadCroppedImage = async (croppedImageBlob) => {
    setImageSrc(null);
    setLoading(true);
    try {
      const formData = new FormData();
      const fileName = cropType === "profile" ? "profile.jpg" : "logo.jpg";
      const fieldName = cropType === "profile" ? "image" : "logo";
      const endpoint =
        cropType === "profile" ? "profile/image" : "institute/logo";

      formData.append(fieldName, croppedImageBlob, fileName);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const updatedUser = { ...user };
      if (cropType === "profile") {
        updatedUser.image = res.data.image;
      } else {
        updatedUser.institute = {
          ...updatedUser.institute,
          logo: res.data.logo,
        };
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(
        `${cropType === "profile" ? "Profile photo" : "Institute logo"} updated!`,
      );
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
      setCropType(null);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* ✅ 2. Full Screen Loader */}
      {loading && <Loader fullScreen={true} text="Updating Image..." />}

      <div className="flex items-center gap-3 border-b border-border pb-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-accent-1/10 flex items-center justify-center text-accent-1">
          <FaCamera size={18} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-main leading-tight">
            Media & Photos
          </h3>
          <p className="text-xs text-muted font-medium">
            Update your profile picture and institute logo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Profile Photo Area */}
        <div className="flex flex-col items-center bg-pill-bg border border-border rounded-2xl p-6">
          <h4 className="font-bold text-main mb-4">Profile Photo</h4>
          <div className="relative w-28 h-28 mb-4">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-accent-1 text-white flex items-center justify-center text-4xl font-extrabold border-4 border-card shadow-lg">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}

            <label className="absolute bottom-0 right-0 bg-accent-1 text-white p-2 rounded-full border-2 border-card cursor-pointer hover:scale-110 transition-transform shadow-md">
              <FaCamera size={14} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onFileChange(e, "profile")}
                disabled={loading}
              />
            </label>

            {user.image && (
              <button
                onClick={() => confirmDelete("profile")}
                disabled={loading}
                className="absolute bottom-0 left-0 bg-red-500 text-white p-2 rounded-full border-2 border-card cursor-pointer hover:scale-110 transition-transform shadow-md"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
          <p className="text-xs text-muted text-center">
            Recommended: 1:1 aspect ratio.
          </p>
        </div>

        {/* Institute Logo Area */}
        <div className="flex flex-col items-center bg-pill-bg border border-border rounded-2xl p-6">
          <h4 className="font-bold text-main mb-4">Institute Logo</h4>
          <div className="relative w-28 h-28 mb-4">
            {user.institute?.logo ? (
              <img
                src={user.institute.logo}
                alt="Logo"
                className="w-full h-full rounded-2xl object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-card text-muted flex items-center justify-center text-4xl border-4 border-card shadow-lg">
                <FaUniversity />
              </div>
            )}

            <label className="absolute -bottom-2 -right-2 bg-accent-1 text-white p-2 rounded-full border-2 border-card cursor-pointer hover:scale-110 transition-transform shadow-md">
              <FaCamera size={14} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onFileChange(e, "institute")}
                disabled={loading}
              />
            </label>

            {user.institute?.logo && (
              <button
                onClick={() => confirmDelete("institute")}
                disabled={loading}
                className="absolute -bottom-2 -left-2 bg-red-500 text-white p-2 rounded-full border-2 border-card cursor-pointer hover:scale-110 transition-transform shadow-md"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
          <p className="text-xs text-muted text-center">
            Recommended: Square PNG/JPG.
          </p>
        </div>
      </div>

      {imageSrc && (
        <ImageCropperModal
          imageSrc={imageSrc}
          onClose={() => {
            setImageSrc(null);
            setCropType(null);
          }}
          onCropComplete={uploadCroppedImage}
        />
      )}
    </div>
  );
};

export default PhotoTab;
