import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImagePlus, RotateCcw, X } from "lucide-react";

import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";

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
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Profile Photo</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload and crop a square profile photo.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!isCropping && (
        <div className="flex flex-wrap items-center gap-5">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border bg-muted">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleChoosePhoto}
              >
                <ImagePlus className="mr-2 h-4 w-4" />

                {previewUrl ? "Change Photo" : "Choose Photo"}
              </Button>

              {croppedPreviewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetSelection}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              JPG, PNG or WEBP. Maximum 5 MB.
            </p>
          </div>
        </div>
      )}

      {isCropping && sourceUrl && (
        <div className="rounded-xl border bg-background p-4">
          <div className="mb-4">
            <p className="text-sm font-medium">Crop profile photo</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Drag the square to position your photo.
            </p>
          </div>

          <div className="flex justify-center">
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
            <Button type="button" variant="outline" onClick={handleCancelCrop}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleApplyCrop}
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Crop
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
