import { X } from "lucide-react";

const ImageModal = ({ image, open, onClose }) => {
  if (!open || !image) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60 backdrop-blur-md
        p-2 sm:p-4
      "
      onClick={onClose}
    >
      <div
        className="
          relative flex
          max-h-[95vh] max-w-[95vw]
          items-center justify-center
        "
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute right-2 top-2 z-10
            flex h-9 w-9 items-center justify-center
            rounded-full bg-white/90
            shadow-md transition hover:bg-white
          "
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={image}
          alt="Preview"
          draggable="false"
          className="
            max-h-[95vh] max-w-[95vw]
            select-none rounded-md object-contain
          "
        />
      </div>
    </div>
  );
};

export default ImageModal;
