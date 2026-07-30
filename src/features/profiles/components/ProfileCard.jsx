import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProfile } from "@/store/features/auth/authSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";

import { Link } from "react-router-dom";

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

  const { user, loading, error } = useSelector((state) => state.auth);

  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  const handleRefresh = () => {
    setShareMessage("");
    setShareError(false);
    setCopied(false);

    dispatch(getMyProfile());
  };

  const handleShareBrand = async () => {
    setShareMessage("");
    setShareError(false);
    setCopied(false);

    if (!user) {
      return;
    }

    if (user.role !== "seller") {
      setShareError(true);
      setShareMessage("Customer profiles do not have a public share page.");
      return;
    }

    if (!user.brand_slug) {
      setShareError(true);
      setShareMessage(
        "You must create your brand before sharing a public link.",
      );
      return;
    }

    const brandUrl = `${window.location.origin}/event-planner/brands/${user.brand_slug}`;

    try {
      await copyTextToClipboard(brandUrl);

      setCopied(true);
      setShareMessage(`Brand link copied: ${brandUrl}`);
    } catch {
      setShareError(true);
      setShareMessage("Could not copy the brand link. Please try again.");
    }
  };

  if (loading && !user) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>
            Failed to load profile: {error.detail || "Something went wrong."}
          </span>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full container mx-auto">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Avatar className="h-32 w-32 border-4 border-background mb-4">
            <AvatarImage
              src={user.profile_image_url}
              alt={user.full_name}
              className="object-cover object-top"
            />

            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>

          <h3 className="text-2xl font-semibold">{user.full_name}</h3>

          <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>

          <p className="flex items-center gap-2 mt-2 capitalize">
            <Shield className="h-4 w-4" />
            {user.role}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button variant="outline" size="sm" onClick={handleShareBrand}>
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}

            {copied ? "Copied" : "Share Brand"}
          </Button>

          <Link to={`/profile/${user.slug}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {shareMessage && (
        <Alert
          variant={shareError ? "destructive" : "default"}
          className="mt-6"
        >
          <AlertDescription>{shareMessage}</AlertDescription>
        </Alert>
      )}

      <hr className="my-6" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Info icon={Mail} label="Email" value={user.email} />

        <Info icon={Phone} label="Contact Number" value={user.contact_number} />

        <Info
          icon={Phone}
          label="WhatsApp Number"
          value={user.whatsapp_number}
        />

        <Info
          icon={MapPin}
          label="Office Address"
          value={user.office_address}
        />

        <Info icon={MapPin} label="Service Area" value={user.service_area} />

        <Info
          icon={Calendar}
          label="Member Since"
          value={formatDate(user.created_at)}
        />

        <div className="flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm font-medium">Terms Accepted</span>
          </div>

          <Badge variant={user.terms_accept ? "default" : "destructive"}>
            {user.terms_accept ? "Accepted" : "Not Accepted"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start space-x-3 rounded-lg p-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>

        <p className="wrap-break-word text-sm text-muted-foreground">{value}</p>

        <Separator className="mt-4" />
      </div>
    </div>
  );
};

export default ProfileCard;
