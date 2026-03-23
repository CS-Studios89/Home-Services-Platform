import React from "react";
import "../styles/Profile.css";

function Profile() {
  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> johndoe@email.com</p>
        <p><strong>Phone:</strong> +961 70 000 000</p>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}

export default Profile;