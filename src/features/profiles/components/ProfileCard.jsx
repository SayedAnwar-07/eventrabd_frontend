import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { getMyProfile } from "@/store/features/auth/authSlice";

import { Button } from "@/components/ui/button";

import { RefreshCw, Share2 } from "lucide-react";

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");

  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  const copied = document.execCommand("copy");

  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Could not copy the URL.");
  }
};

const ProfileCard = () => {
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  const handleRefresh = async () => {
    try {
      await dispatch(getMyProfile()).unwrap();

      toast.success("Profile refreshed.");
    } catch {
      toast.error("Could not refresh profile.");
    }
  };

  const handleShareBrand = async () => {
    if (!user) return;

    if (user.role !== "seller") {
      toast.error("Customer profiles do not have a public share page.");

      return;
    }

    if (!user.brand_slug) {
      toast.error("Create your brand before sharing the public link.");

      return;
    }

    const brandUrl = `${window.location.origin}/event-planner/brands/${user.brand_slug}`;

    try {
      await copyTextToClipboard(brandUrl);

      toast.success("Brand link copied.");
    } catch {
      toast.error("Could not copy the brand link.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="h-10 rounded-md border-gray-200 px-4 shadow-none"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        <Button
          type="button"
          onClick={handleShareBrand}
          className="h-10 rounded-md bg-[#b60018] px-4 text-white shadow-none hover:bg-[#960014]"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Brand
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
