import ProfileCard from "../components/ProfileCard";

const ProfilePage = () => {
  return (
    <div className="container mx-auto py-8 px-2">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">User Profile</h1>
        <p className="text-muted-foreground mb-8">
          View and manage your profile information
        </p>

        <ProfileCard />
      </div>
    </div>
  );
};

export default ProfilePage;
