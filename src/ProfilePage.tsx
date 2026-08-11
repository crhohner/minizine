import SavedZines from "./SavedZines";
import ProfileFooter from "./ProfileFooter";
import "./ProfilePage.css";

function ProfilePage() {
  return (
    <div className="profile-page">
      <SavedZines />
      <ProfileFooter />
    </div>
  );
}

export default ProfilePage;
