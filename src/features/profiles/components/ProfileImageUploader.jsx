import { useEffect, useRef, useState } from "react";

import { Camera, Check, ImagePlus, RotateCcw, X } from "lucide-react";

import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";

import ImageModal from "@/components/common/ImageModal";

import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const OUTPUT_SIZE = 600;

const getCenteredCrop = (mediaWidth, mediaHeight) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 70,
      },
      1,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
};

const createCroppedFile = (image, crop, originalFileName) => {
  return new Promise((resolve, reject) => {
    if (!image || !crop?.width || !crop?.height) {
      reject(new Error("Invalid crop."));
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to create image."));
      return;
    }

    const scaleX = image.naturalWidth / image.width;

    const scaleY = image.naturalHeight / image.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to crop image."));

          return;
        }

        const cleanName =
          originalFileName
            ?.replace(/\.[^/.]+$/, "")
            .replace(/\s+/g, "-")
            .toLowerCase() || "profile";

        const file = new File([blob], `${cleanName}-cropped.jpg`, {
          type: "image/jpeg",
        });

        resolve(file);
      },
      "image/jpeg",
      0.9,
    );
  });
};

export default function ProfileImageUploader({
  currentImageUrl,
  onImageChange,
}) {
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [sourceUrl, setSourceUrl] = useState("");

  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState("");

  const [crop, setCrop] = useState();

  const [completedCrop, setCompletedCrop] = useState(null);

  const [isCropping, setIsCropping] = useState(false);

  const [error, setError] = useState("");

  const previewUrl = croppedPreviewUrl || currentImageUrl || "";

  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }

      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
    };
  }, [sourceUrl, croppedPreviewUrl]);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.");

      return;
    }

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setSourceUrl(objectUrl);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsCropping(true);
  };

  const handleImageLoad = (event) => {
    const image = event.currentTarget;

    const centeredCrop = getCenteredCrop(image.width, image.height);

    setCrop(centeredCrop);
  };

  const handleApplyCrop = async () => {
    try {
      setError("");

      if (
        !imageRef.current ||
        !completedCrop?.width ||
        !completedCrop?.height
      ) {
        setError("Please select an area to crop.");

        return;
      }

      const croppedFile = await createCroppedFile(
        imageRef.current,
        completedCrop,
        selectedFile?.name,
      );

      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }

      const preview = URL.createObjectURL(croppedFile);

      setCroppedPreviewUrl(preview);
      setIsCropping(false);

      onImageChange(croppedFile);
    } catch {
      setError("Unable to crop image. Please try again.");
    }
  };

  const handleCancelCrop = () => {
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    setSourceUrl("");
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsCropping(false);
    setError("");
  };

  const handleResetSelection = () => {
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    setCroppedPreviewUrl("");
    setSourceUrl("");
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsCropping(false);
    setError("");

    onImageChange(null);
  };

  return (
    <>
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {!isCropping && (
          <div>
            <div className="aspect-square w-full max-w-70 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
              {previewUrl ? (
                <button
                  type="button"
                  onClick={() => setImagePreviewOpen(true)}
                  className="block h-full w-full cursor-zoom-in overflow-hidden rounded-md"
                  aria-label="View profile photo"
                >
                  <img
                    src={previewUrl}
                    alt="Profile"
                    draggable="false"
                    className="h-full w-full object-cover object-top transition duration-200 hover:scale-[1.02]"
                  />
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Camera className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>

            <div className="mt-4 max-w-70">
              <Button
                type="button"
                variant="outline"
                onClick={handleChoosePhoto}
                className="h-11 rounded-md px-5"
              >
                <ImagePlus className="mr-2 h-4 w-4" />

                {previewUrl ? "Change Photo" : "Choose Photo"}
              </Button>

              {croppedPreviewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetSelection}
                  className="ml-2 h-11 rounded-md"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}

              <p className="mt-3 text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum 5 MB.
              </p>
            </div>
          </div>
        )}

        {isCropping && sourceUrl && (
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-950">
                Crop profile photo
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Drag the square to position your photo.
              </p>
            </div>

            <div className="flex justify-center overflow-hidden rounded-md bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => {
                  setCrop(percentCrop);
                }}
                onComplete={(pixelCrop) => {
                  setCompletedCrop(pixelCrop);
                }}
                aspect={1}
                keepSelection
                minWidth={80}
                minHeight={80}
              >
                <img
                  ref={imageRef}
                  src={sourceUrl}
                  alt="Crop profile"
                  onLoad={handleImageLoad}
                  className="block max-h-105 max-w-full object-contain"
                />
              </ReactCrop>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCrop}
                className="rounded-md"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleApplyCrop}
                disabled={!completedCrop?.width || !completedCrop?.height}
                className="rounded-md bg-[#b60018] text-white hover:bg-[#960014]"
              >
                <Check className="mr-2 h-4 w-4" />
                Apply Crop
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
      <ImageModal
        image={previewUrl}
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
      />
    </>
  );
}
