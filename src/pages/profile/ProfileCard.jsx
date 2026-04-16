import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "@/store/features/auth/authSlice";
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
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (slug) dispatch(getProfile(slug));
  }, [dispatch, slug]);

  const handleRefresh = () => {
    dispatch(getProfile(slug));
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertDescription className="flex justify-between items-center">
          <span>Failed to load profile: {error.detail}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) return null;

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="w-full container mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <Avatar className="h-32 w-32 border-4 border-background mb-4">
            <AvatarImage src={user.profile_image_url} alt={user.full_name} />
            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
          <h3 className="text-2xl font-semibold">{user.full_name}</h3>
          <p className="flex items-center gap-2 mt-2">
            <Shield className="h-4 w-4" />
            {user.role}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link to={`/profile/${slug}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <hr className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex items-center justify-between p-3 rounded-lg">
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

const Info = ({ icon: Icon, label, value }) =>
  value && (
    <div className="flex items-start space-x-3 p-3 rounded-lg">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
        <Separator className="mt-4" />
      </div>
    </div>
  );

export default ProfileCard;
