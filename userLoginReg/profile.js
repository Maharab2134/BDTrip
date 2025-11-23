// Profile page script
const API_BASE_URL = "http://localhost:3000";
const PROFILE_GOOGLE_MAPS_BASE = "https://www.google.com/maps?q=";

document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");
  const username = localStorage.getItem("username");
  const logStatus = localStorage.getItem("logStatus");

  const profileMsg = document.getElementById("profile-msg");
  const profileForm = document.getElementById("profileForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  const profileAddressPicker = document.getElementById("profileAddressPicker");
  const passwordInput = document.getElementById("password");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logStatus || logStatus === "false" || !email) {
    profileMsg.style.display = "block";
    profileMsg.textContent = "You are not logged in. Please log in first.";
    profileForm.style.display = "none";
    return;
  }

  // Prefill email and try to load user data
  emailInput.value = email;
  // Prefill name/address from localStorage for immediate (real-time) availability
  if (username) nameInput.value = username;
  const localAddr = localStorage.getItem("userAddress");
  if (localAddr) addressInput.value = localAddr;

  // profile address picker handler
  if (profileAddressPicker)
    profileAddressPicker.addEventListener("click", async () => {
      if (!navigator.geolocation) {
        alert("Geolocation not supported by your browser");
        return;
      }
      profileAddressPicker.style.opacity = "0.6";
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name)
                addressInput.value = data.display_name;
              else addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            } else {
              addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            }
          } catch (err) {
            console.warn("Reverse geocode failed", err);
            addressInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
          } finally {
            profileAddressPicker.style.opacity = "1";
            window.open(PROFILE_GOOGLE_MAPS_BASE + lat + "," + lon, "_blank");
          }
        },
        (err) => {
          profileAddressPicker.style.opacity = "1";
          console.error("Geolocation error", err);
          alert(
            "Unable to retrieve location. Please allow location access and try again."
          );
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  loadUserByEmail(email)
    .then((user) => {
      if (!user) {
        profileMsg.style.display = "block";
        profileMsg.textContent = "User not found in API.";
        return;
      }
      // fill fields
      nameInput.value = user.name || username || "";
      phoneInput.value = user.phone || user.phoneNumber || "";
      addressInput.value = user.address || "";
      passwordInput.value = user.passward || user.password || "";
      // store current id for updates
      profileForm.dataset.userid = user.id || user._id || "";
    })
    .catch((err) => {
      console.error(err);
      profileMsg.style.display = "block";
      profileMsg.textContent = "Error loading profile.";
    });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let id = profileForm.dataset.userid;
    if (!id) id = localStorage.getItem("userId") || "";
    if (!id) {
      profileMsg.style.display = "block";
      profileMsg.className = "profile-msg error";
      profileMsg.textContent = "Cannot update profile: missing user id.";
      return;
    }
    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      passward: passwordInput.value,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res
          .text()
          .catch(() => res.statusText || "update failed");
        throw new Error(errText || "update failed");
      }
      const updated = await res.json();
      profileMsg.style.display = "block";
      profileMsg.className = "profile-msg success";
      profileMsg.textContent = "Profile updated successfully. Redirecting...";
      // update localStorage username if changed
      if (updated.name) localStorage.setItem("username", updated.name);
      // persist address/phone locally too
      if (updated.address) localStorage.setItem("userAddress", updated.address);
      if (updated.phone) localStorage.setItem("userPhone", updated.phone);
      // short delay then redirect to index
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1200);
    } catch (err) {
      console.error(err);
      profileMsg.style.display = "block";
      profileMsg.className = "profile-msg error";
      profileMsg.textContent =
        "Failed to update profile: " + (err.message || "Unknown error");
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    localStorage.setItem("logStatus", false);
    window.location.href = "index.html";
  });

  // Self-deletion disabled: Delete Account button removed from UI per admin policy.
});

async function loadUserByEmail(email) {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error("failed to fetch users");
  const list = await res.json();
  // Attempt to find by email (case-insensitive)
  const found = list.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
  );
  return found || null;
}
