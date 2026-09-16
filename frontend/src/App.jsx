

import { useState } from "react";
import axios from "axios";
import "./index.css";

const API = "http://127.0.0.1:8000";

function App() {
  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Logged-in user
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  // Create Event
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventName, setEventName] = useState("");

  // Create Team Member
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamUsername, setTeamUsername] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [showPhotos, setShowPhotos] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [showGalleries, setShowGalleries] = useState(false);
  const [galleryEventId, setGalleryEventId] = useState("");
  const [galleryPin, setGalleryPin] = useState("");
  const [galleryId, setGalleryId] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [publishedGallery, setPublishedGallery] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadEventId, setUploadEventId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [myPhotos, setMyPhotos] = useState([]);
  const [showMyPhotos, setShowMyPhotos] = useState(false);
  const [publicToken, setPublicToken] = useState("");
  const [publicPin, setPublicPin] = useState("");
  const [publicGallery, setPublicGallery] = useState(null);
  const [showPublicGallery, setShowPublicGallery] = useState(false);

  // ---------------- LOGIN ----------------

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const loginResponse = await axios.post(
        `${API}/api/accounts/login/`,
        {
          username: username,
          password: password,
        }
      );

      const accessToken = loginResponse.data.access;
      const refreshToken = loginResponse.data.refresh;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      const meResponse = await axios.get(
        `${API}/api/accounts/me/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(meResponse.data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Login failed. Check username and password.");
    }
  };

  // ---------------- CREATE EVENT ----------------

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setMessage("Please enter an event name.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API}/api/events/create/`,
        {
          name: eventName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Event "${response.data.name}" created successfully!`
      );

      setEventName("");
      setShowCreateEvent(false);
    } catch (error) {
      console.error(error);
      setMessage("Event creation failed.");
    }
  };

  // ---------------- CREATE TEAM MEMBER ----------------

  const handleCreateTeamMember = async (e) => {
    e.preventDefault();

    if (!teamUsername.trim()) {
      setMessage("Username is required.");
      return;
    }

    if (!teamPassword.trim()) {
      setMessage("Password is required.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API}/api/accounts/team-members/create/`,
        {
          username: teamUsername,
          email: teamEmail,
          password: teamPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Team Member "${response.data.username}" created successfully!`
      );

      setTeamUsername("");
      setTeamEmail("");
      setTeamPassword("");
      setShowCreateTeam(false);
    } catch (error) {
      console.error(error);

      if (error.response?.data?.username) {
        setMessage(error.response.data.username[0]);
      } else {
        setMessage("Team Member creation failed.");
      }
    }
  };
 const handleViewPhotos = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.get(
      `${API}/api/photos/admin-photos/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPhotos(response.data);
    setShowPhotos(true);
    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Unable to load photos.");
  }
};
const handleSelectPhoto = async (photoId, currentStatus) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.patch(
      `${API}/api/photos/select/${photoId}/`,
      {
        is_selected: !currentStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === photoId
          ? { ...photo, is_selected: response.data.is_selected }
          : photo
      )
    );

    setMessage(
      response.data.is_selected
        ? "Photo selected successfully."
        : "Photo unselected successfully."
    );
  } catch (error) {
    console.error(error);
    setMessage("Unable to update photo selection.");
  }
};
const handleCreateGallery = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!galleryEventId || !galleryPin) {
      setMessage("Event and PIN are required.");
      return;
    }

    const response = await axios.post(
      `${API}/api/galleries/create/`,
      {
        event: galleryEventId,
        pin: galleryPin,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage("Gallery created successfully.");
    setShowGalleries(true);

    console.log("Gallery created:", response.data);
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Unable to create gallery.");
    }
  }
};
const handleAddPhotoToGallery = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!galleryId || !photoId) {
      setMessage("Gallery ID and Photo ID are required.");
      return;
    }

    const response = await axios.post(
      `${API}/api/galleries/photos/add/`,
      {
        gallery: galleryId,
        photo: photoId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage("Photo added to gallery successfully.");

    console.log("Gallery photo:", response.data);
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Unable to add photo to gallery.");
    }
  }
};
const handlePublishGallery = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!galleryId) {
      setMessage("Gallery ID is required.");
      return;
    }

    const response = await axios.patch(
      `${API}/api/galleries/publish/${galleryId}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPublishedGallery(response.data);

    setMessage("Gallery published successfully.");

  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Unable to publish gallery.");
    }
  }
};
const handleViewMyEvents = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.get(
      `${API}/api/events/list/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMyEvents(response.data);
    setShowMyEvents(true);
    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Unable to load your events.");
  }
};
const handleUploadPhoto = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!uploadEventId) {
      setMessage("Please enter an Event ID.");
      return;
    }

    if (!selectedFile) {
      setMessage("Please select a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("event", uploadEventId);
    formData.append("file", selectedFile);

    const response = await axios.post(
      `${API}/api/photos/upload/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage("Photo uploaded successfully!");
    console.log("Uploaded photo:", response.data);

    setSelectedFile(null);
    setUploadEventId("");
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Photo upload failed.");
    }
  }
};
const handleViewMyPhotos = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.get(
      `${API}/api/photos/my-photos/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMyPhotos(response.data);
    setShowMyPhotos(true);
    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Unable to load your photos.");
  }
};
const handleOpenPublicGallery = async () => {
  try {
    if (!publicToken || !publicPin) {
      setMessage("Gallery link and PIN are required.");
      return;
    }

    const response = await axios.post(
      `${API}/api/galleries/public/${publicToken}/`,
      {
        pin: publicPin,
      }
    );

    setPublicGallery(response.data);
    setShowPublicGallery(true);
    setMessage("Gallery opened successfully.");
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Unable to open gallery.");
    }
  }
};
  // ---------------- LOGOUT ----------------

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
    setUsername("");
    setPassword("");
    setMessage("");
  };

  // ---------------- DASHBOARD ----------------

  if (user) {
    return (
      <div>
        <h1>TrizenAI Photo Sharing Platform</h1>

        <h2>Welcome, {user.username}!</h2>

        <p>
          <strong>Email:</strong>{" "}
          {user.email || "Not provided"}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        {/* ADMIN DASHBOARD */}

        {user.role === "ADMIN" && (
          <div>
            <h2>Admin Dashboard</h2>

            <button
              onClick={() => setShowCreateEvent(!showCreateEvent)}
            >
              Create Event
            </button>

            <button
              onClick={() => setShowCreateTeam(!showCreateTeam)}
            >
              Create Team Member
            </button>

            <button onClick={handleViewPhotos}>
  View Photos
</button>
{showPhotos && (
  <div>
    <h3>Uploaded Photos</h3>

    {photos.length === 0 ? (
      <p>No photos uploaded yet.</p>
    ) : (
      photos.map((photo) => (
        <div key={photo.id}>
          <hr />

          <p>
            <strong>Filename:</strong> {photo.filename}
          </p>

          <p>
            <strong>Event ID:</strong> {photo.event}
          </p>

          <p>
            <strong>Uploaded By:</strong> {photo.uploaded_by}
          </p>

          <p>
            <strong>Selected:</strong>{" "}
            {photo.is_selected ? "Yes" : "No"}
          </p>
          <button
  onClick={() =>
    handleSelectPhoto(photo.id, photo.is_selected)
  }
>
  {photo.is_selected ? "Unselect Photo" : "Select Photo"}
</button>

          <img
            src={photo.storage_location}
            alt={photo.filename}
            width="200"
          />
        </div>
      ))
    )}
  </div>
)}

            <button onClick={() => setShowGalleries(!showGalleries)}>
  Manage Galleries
</button>
{showGalleries && (
  <div>
    <h3>Manage Gallery</h3>

    <input
      type="number"
      placeholder="Event ID"
      value={galleryEventId}
      onChange={(e) => setGalleryEventId(e.target.value)}
    />

    <input
      type="text"
      placeholder="Gallery PIN"
      value={galleryPin}
      onChange={(e) => setGalleryPin(e.target.value)}
    />

    <button onClick={handleCreateGallery}>
      Create Gallery
    </button>
    <hr />

<h4>Add Selected Photo to Gallery</h4>

<input
  type="number"
  placeholder="Gallery ID"
  value={galleryId}
  onChange={(e) => setGalleryId(e.target.value)}
/>

<input
  type="number"
  placeholder="Photo ID"
  value={photoId}
  onChange={(e) => setPhotoId(e.target.value)}
/>

<button onClick={handleAddPhotoToGallery}>
  Add Photo to Gallery
</button>
<br />
<br />

<button onClick={handlePublishGallery}>
  Publish Gallery
</button>
{publishedGallery && (
  <div>
    <h4>Gallery Published!</h4>

    <p>
      <strong>Gallery ID:</strong>{" "}
      {publishedGallery.gallery_id}
    </p>

    <p>
      <strong>Public Token:</strong>{" "}
      {publishedGallery.public_token}
    </p>

    <p>
      <strong>PIN:</strong> Use the PIN you created for this gallery.
    </p>

    <p>
      <strong>Public Gallery API:</strong>{" "}
      {`${API}/api/galleries/public/${publishedGallery.public_token}/`}
    </p>
  </div>
)}
  </div>
)}

            {/* CREATE EVENT FORM */}

            {showCreateEvent && (
              <div>
                <h3>Create New Event</h3>

                <form onSubmit={handleCreateEvent}>
                  <input
                    type="text"
                    placeholder="Event name"
                    value={eventName}
                    onChange={(e) =>
                      setEventName(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <button type="submit">
                    Create Event
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateEvent(false);
                      setEventName("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* CREATE TEAM MEMBER FORM */}

            {showCreateTeam && (
              <div>
                <h3>Create New Team Member</h3>

                <form onSubmit={handleCreateTeamMember}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={teamUsername}
                    onChange={(e) =>
                      setTeamUsername(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <input
                    type="email"
                    placeholder="Email"
                    value={teamEmail}
                    onChange={(e) =>
                      setTeamEmail(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <input
                    type="password"
                    placeholder="Password"
                    value={teamPassword}
                    onChange={(e) =>
                      setTeamPassword(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <button type="submit">
                    Create Team Member
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTeam(false);
                      setTeamUsername("");
                      setTeamEmail("");
                      setTeamPassword("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TEAM MEMBER DASHBOARD */}

        {user.role === "TEAM_MEMBER" && (
          <div className="team-dashboard">
            <div className="dashboard-header">
              <div>
                <p className="eyebrow">TEAM MEMBER PORTAL</p>
                <h2>Team Member Dashboard</h2>
                <p className="dashboard-subtitle">Manage your assigned events and uploaded photos.</p>
              </div>
            </div>

            <div className="dashboard-actions">
              <button
                className={showMyEvents ? "dashboard-btn active" : "dashboard-btn"}
                onClick={handleViewMyEvents}
              >
                📅 My Assigned Events
              </button>
              <button
                className={showUpload ? "dashboard-btn active" : "dashboard-btn"}
                onClick={() => setShowUpload(!showUpload)}
              >
                📤 Upload Photos
              </button>
              <button
                className={showMyPhotos ? "dashboard-btn active" : "dashboard-btn"}
                onClick={handleViewMyPhotos}
              >
                🖼️ My Photos
              </button>
            </div>

            {showMyEvents && (
              <section className="dashboard-section">
                <div className="section-heading">
                  <div>
                    <h3>My Assigned Events</h3>
                    <p>Events assigned to you by the admin.</p>
                  </div>
                  <span className="count-badge">{myEvents.length}</span>
                </div>

                {myEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <strong>No events assigned yet</strong>
                    <p>You will see your assigned events here.</p>
                  </div>
                ) : (
                  <div className="event-grid">
                    {myEvents.map((event) => (
                      <div className="event-card" key={event.id}>
                        <div className="event-icon">📸</div>
                        <div>
                          <p className="card-label">EVENT #{event.id}</p>
                          <h4>{event.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showUpload && (
              <section className="dashboard-section upload-section">
                <div className="section-heading">
                  <div>
                    <h3>Upload Photos</h3>
                    <p>Upload an image to one of your assigned events.</p>
                  </div>
                </div>

                <div className="upload-form-grid">
                  <label>
                    Event ID
                    <input
                      type="number"
                      placeholder="Enter event ID"
                      value={uploadEventId}
                      onChange={(e) => setUploadEventId(e.target.value)}
                    />
                  </label>

                  <label>
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </label>
                </div>

                {selectedFile && (
                  <p className="selected-file">Selected: {selectedFile.name}</p>
                )}

                <button className="primary-action" onClick={handleUploadPhoto}>
                  Upload Photo
                </button>
              </section>
            )}

            {showMyPhotos && (
              <section className="dashboard-section">
                <div className="section-heading">
                  <div>
                    <h3>My Uploaded Photos</h3>
                    <p>Photos uploaded by you across your assigned events.</p>
                  </div>
                  <span className="count-badge">{myPhotos.length}</span>
                </div>

                {myPhotos.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🖼️</div>
                    <strong>No photos uploaded yet</strong>
                    <p>Your uploaded photos will appear here.</p>
                  </div>
                ) : (
                  <div className="photo-grid">
                    {myPhotos.map((photo) => (
                      <div className="photo-card" key={photo.id}>
                        <div className="photo-wrapper">
                          <img
                            src={photo.storage_location}
                            alt={photo.filename}
                          />
                        </div>
                        <div className="photo-card-body">
                          <p className="photo-filename" title={photo.filename}>
                            {photo.filename}
                          </p>
                          <p className="photo-event">Event #{photo.event}</p>
                          <span className={photo.is_selected ? "status-badge selected" : "status-badge pending"}>
                            {photo.is_selected ? "✓ Selected" : "○ Not Selected"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        <p>{message}</p>

        <br />

        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // ---------------- LOGIN PAGE ----------------

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="brand-mark">TA</div>
        <h1>TrizenAI Photo Sharing Platform</h1>
        <p>Securely manage, share and view event photos.</p>
      </div>

      <div className="auth-grid">
        {/* LOGIN CARD */}
        <section className="auth-card">
          <div className="card-icon">🔐</div>
          <h2>Login</h2>
          <p className="card-subtitle">
            Sign in to manage events and photos.
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button type="submit" className="primary-btn">
              Login
            </button>
          </form>
        </section>

        {/* CUSTOMER GALLERY CARD */}
        <section className="auth-card gallery-access-card">
          <div className="card-icon">📸</div>
          <h2>Customer Gallery</h2>
          <p className="card-subtitle">
            Enter the gallery link token and PIN to view your event photos.
          </p>

          <div className="auth-form">
            <label htmlFor="gallery-token">Gallery Token</label>
            <input
              id="gallery-token"
              type="text"
              placeholder="Paste your gallery token"
              value={publicToken}
              onChange={(e) => setPublicToken(e.target.value)}
            />

            <label htmlFor="gallery-pin">Gallery PIN</label>
            <input
              id="gallery-pin"
              type="password"
              inputMode="numeric"
              placeholder="Enter your PIN"
              value={publicPin}
              onChange={(e) => setPublicPin(e.target.value)}
            />

            <button
              type="button"
              className="primary-btn"
              onClick={handleOpenPublicGallery}
            >
              Open Gallery
            </button>
          </div>
        </section>
      </div>

      {message && <div className="login-message">{message}</div>}

      {/* ---------------- PUBLIC GALLERY PHOTOS ---------------- */}

      {showPublicGallery && publicGallery && (
        <section className="public-gallery-section">
          <div className="gallery-heading">
            <div>
              <span className="section-label">CUSTOMER VIEW</span>
              <h2>{publicGallery.event}</h2>
              <p>{publicGallery.message}</p>
            </div>
            <span className="photo-count">
              {publicGallery.photos.length} photo
              {publicGallery.photos.length !== 1 ? "s" : ""}
            </span>
          </div>

          <h3>Published Photos</h3>

          {publicGallery.photos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <strong>No photos available</strong>
              <p>No photos have been added to this gallery yet.</p>
            </div>
          ) : (
            <div className="photo-grid public-photo-grid">
              {publicGallery.photos.map((photo) => (
                <div className="photo-card" key={photo.id}>
                  <div className="photo-wrapper">
                    <img
                      src={photo.storage_location}
                      alt={photo.filename}
                    />
                  </div>
                  <div className="photo-card-body">
                    <p className="photo-filename" title={photo.filename}>
                      {photo.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;