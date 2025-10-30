// API Configuration: try common local ports (3000 = json-server, 4000 = express server)
const API_PORTS_TO_TRY = [3000, 4000];

const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");

  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
});

async function tryFetchDestinations() {
  const paths = API_PORTS_TO_TRY.map(
    (p) => `http://localhost:${p}/destinations`
  );
  // Also try same origin (useful if the app is proxied)
  paths.push(`/destinations`);

  for (const url of paths) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      console.log(`[adminDashboard] fetched from ${url}`, data);
      return { data, url };
    } catch (err) {
      console.warn(`[adminDashboard] fetch failed for ${url}:`, err.message);
      // try next
    }
  }
  throw new Error("All fetch attempts failed");
}

function renderMetricsAndCards(data) {
  // Calculate statistics
  let totalDestinations = Array.isArray(data) ? data.length : 0;
  let totalRevenue = 0;
  let totalProfit = 0;

  (data || []).forEach((destination) => {
    const price = Number(destination.price) || 0;
    // Keep the previous project's logic: revenue = price * 10 (example multiplier)
    let revenue = price * 10;
    let profit = (revenue * 25) / 100;
    totalRevenue += revenue;
    totalProfit += profit;
  });

  // Update metrics
  const totalDealsEl = document.getElementById("total-deals");
  const totalSaleEl = document.getElementById("total-sale");
  const incomeEl = document.getElementById("income");
  if (totalDealsEl) totalDealsEl.innerText = totalDestinations;
  if (totalSaleEl) totalSaleEl.innerText = `৳ ${totalProfit.toLocaleString()}`;
  if (incomeEl) incomeEl.innerText = `৳ ${totalRevenue.toLocaleString()}`;

  // Display latest 6 destinations
  const adminDataAppend = document.getElementById("adminSiteBoxId");
  const latestDestinations = Array.isArray(data)
    ? data.slice(-6).reverse()
    : [];

  let cardsHTML = "";
  latestDestinations.forEach((destination) => {
    const img = destination.image || "../image/placeholder.png";
    const name = destination.name || "Untitled";
    const location = destination.location || "Unknown";
    const rating = destination.rating || "-";
    const price = destination.price || "0";
    cardsHTML += `
      <div class="destination-card">
        <div class="destination-image"> 
          <img src="${img}" alt="${name}" />
          <div class="destination-overlay">
            <span class="destination-price">৳${price}</span>
          </div>
        </div>
        <div class="destination-info">
          <h3 class="destination-name">${name}</h3>
          <p class="destination-location">
            <span class="material-icons">location_on</span>
            ${location}
          </p>
          <div class="destination-meta">
            <div class="rating">
              <span class="material-icons">star</span>
              <span>${rating}%</span>
            </div>
            <a href="admin.html" class="edit-btn">
              <span class="material-icons">edit</span>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  if (adminDataAppend) adminDataAppend.innerHTML = cardsHTML;
}

(async function initDashboard() {
  try {
    const { data, url } = await tryFetchDestinations();
    renderMetricsAndCards(data);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    const adminSiteBox = document.getElementById("adminSiteBoxId");
    if (adminSiteBox)
      adminSiteBox.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <p style="color: var(--color-danger);">Failed to load destinations. Please ensure the API server is running (try running the server in /server on port 4000 or start json-server on port 3000).</p>
        </div>
      `;
  }
})();

let logOut = document.getElementById("logout");
if (logOut) {
  logOut.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
}
