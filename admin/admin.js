// API Configuration is loaded from config.js
// No need to redeclare API_BASE_URL here

window.addEventListener("load", () => {
  console.log("API Base URL:", API_BASE_URL);
  fetchProduct();
});

let cardsContainer = document.getElementById("data-list-wrapper");
const sortSelect = document.querySelector("#sort");
const filterSelect = document.querySelector("#filter");
const searchInput = document.querySelector("#search");
const editInput = document.querySelector("#edit");

async function fetchProduct() {
  try {
    // Show loading
    cardsContainer.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading destinations...</p>
      </div>
    `;

    const response = await fetch(`${API_BASE_URL}/destinations`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log("Fetched destinations:", users);
    renderCards(users);
    return users;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    cardsContainer.innerHTML = `
      <div class="no-data">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading destinations. Please check if the server is running.</p>
        <button onclick="fetchProduct()" class="btn-action btn-sort" style="max-width: 200px; margin: 20px auto;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
}

function renderCards(users) {
  console.log(users);
  cardsContainer.innerHTML = "";

  if (!users || users.length === 0) {
    cardsContainer.innerHTML = `
      <div class="no-data">
        <i class="fas fa-map-marked-alt"></i>
        <p>No destinations found</p>
      </div>
    `;
    return;
  }

  users.forEach((user) => {
    const card = document.createElement("div");
    card.classList.add("destination-card");

    // Image
    const image = document.createElement("img");
    image.src =
      user.image || "https://via.placeholder.com/400x300?text=No+Image";
    image.alt = user.name;
    image.classList.add("destination-image");
    card.appendChild(image);

    // Info Section
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("destination-info");

    // Header with name and ID
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("destination-header");

    const name = document.createElement("h4");
    name.classList.add("destination-name");
    name.textContent = user.name;
    headerDiv.appendChild(name);

    const idBadge = document.createElement("span");
    idBadge.classList.add("destination-id");
    idBadge.textContent = `#${user.id}`;
    headerDiv.appendChild(idBadge);

    infoDiv.appendChild(headerDiv);

    // Location
    const location = document.createElement("div");
    location.classList.add("destination-location");
    location.innerHTML = `<i class="fas fa-location-dot"></i> ${user.location}`;
    infoDiv.appendChild(location);

    // Price
    const price = document.createElement("div");
    price.classList.add("destination-price");
    price.innerHTML = `<i class="fas fa-tag"></i> ৳${Number(
      user.price
    ).toLocaleString()}`;
    infoDiv.appendChild(price);

    // Website link (if provided)
    if (user.website) {
      const websiteDiv = document.createElement("div");
      websiteDiv.style.marginTop = "8px";
      websiteDiv.innerHTML = `<a href="${user.website}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary"><i class="fas fa-external-link-alt"></i> Visit Website</a>`;
      infoDiv.appendChild(websiteDiv);
    }

    // Actions
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("destination-actions");

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.classList.add("card-btn", "btn-edit-card");
    editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
    editBtn.addEventListener("click", () => {
      updateAllPopulateProduct(user.id);
      // Scroll to update section
      document
        .querySelector(".control-card:nth-child(2)")
        .scrollIntoView({ behavior: "smooth" });
    });
    actionsDiv.appendChild(editBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("card-btn", "btn-delete-card");
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete`;
    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/destinations/${user.id}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            card.remove();
            alert("Destination deleted successfully!");
            fetchProduct();
          } else {
            alert("Failed to delete destination");
          }
        } catch (error) {
          console.error(error);
          alert("Error deleting destination");
        }
      }
    });
    actionsDiv.appendChild(deleteBtn);

    infoDiv.appendChild(actionsDiv);
    card.appendChild(infoDiv);
    cardsContainer.appendChild(card);
  });
}

//  add products
let destinationNameInput = document.getElementById("product-name");
let destinationImgInput = document.getElementById("product-image");
let destinationLocationInput = document.getElementById("product-brand");
let destinationPriceInput = document.getElementById("product-price");
let destinationWebsiteInput = document.getElementById("product-website");
let destinationCreateBtn = document.getElementById("add-product");

destinationCreateBtn.addEventListener("click", () => {
  let destinationName = destinationNameInput.value;
  let destinationImg = destinationImgInput.value;
  let destinationLocation = destinationLocationInput.value;
  let destinationPrice = destinationPriceInput.value;
  let destinationWebsite = destinationWebsiteInput
    ? destinationWebsiteInput.value
    : "";

  // Validation
  if (
    !destinationName ||
    !destinationImg ||
    !destinationLocation ||
    !destinationPrice
  ) {
    alert("Please fill in all fields");
    return;
  }

  let newEmpObj = {
    name: destinationName,
    image: destinationImg,
    location: destinationLocation,
    price: destinationPrice,
    website: destinationWebsite,
  };

  console.log(newEmpObj);
  fetch(`${API_BASE_URL}/destinations`, {
    method: "POST",
    body: JSON.stringify(newEmpObj),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Destination added successfully!");
      // Clear inputs
      destinationNameInput.value = "";
      destinationImgInput.value = "";
      destinationLocationInput.value = "";
      destinationPriceInput.value = "";
      fetchProduct(data);
    })
    .catch((err) => {
      console.log(err);
      alert("Error adding destination");
    });
}); //  update products
let updateDestinationIdInput = document.getElementById("update-product-id");
let updateDestinationNameInput = document.getElementById("update-product-name");
let updateDestinationImgInput = document.getElementById("update-product-image");
let updateDestinationBrandInput = document.getElementById(
  "update-product-brand"
);
let updateDestinationPriceInput = document.getElementById(
  "update-product-price"
);
let updateDestinationWebsiteInput = document.getElementById(
  "update-product-website"
);
let updateDestinationCreateBtn = document.getElementById("update-product");

function updateAllPopulateProduct(changeid) {
  console.log(changeid);
  fetch(`${API_BASE_URL}/destinations/${changeid}`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      // Populate the input fields with the extracted values
      updateDestinationIdInput.value = data.id;
      updateDestinationNameInput.value = data.name;
      updateDestinationImgInput.value = data.image;
      updateDestinationBrandInput.value = data.location;
      updateDestinationPriceInput.value = data.price;
      if (updateDestinationWebsiteInput)
        updateDestinationWebsiteInput.value = data.website || "";
    })
    .catch((error) => {
      console.log(error);
    });
}

// function changeUpdatesProducts() {
updateDestinationCreateBtn.addEventListener("click", function (e) {
  e.preventDefault();
  let updateDestinationId = updateDestinationIdInput.value;
  let updateproductName = updateDestinationNameInput.value;
  let updateproductImg = updateDestinationImgInput.value;
  let updateproductBrand = updateDestinationBrandInput.value;
  let updateproductPrice = updateDestinationPriceInput.value;
  let updateproductWebsite = updateDestinationWebsiteInput
    ? updateDestinationWebsiteInput.value
    : "";

  // Validation
  if (!updateDestinationId) {
    alert("Please enter a Destination ID to update");
    return;
  }

  if (
    !updateproductName ||
    !updateproductImg ||
    !updateproductBrand ||
    !updateproductPrice
  ) {
    alert("Please fill in all fields");
    return;
  }

  let newUpdatedProductObj = {
    id: updateDestinationId,
    name: updateproductName,
    image: updateproductImg,
    location: updateproductBrand,
    price: updateproductPrice,
    website: updateproductWebsite,
  };
  let changeid = updateDestinationId;
  console.log(changeid);

  fetch(`${API_BASE_URL}/destinations/${changeid}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUpdatedProductObj),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      alert("Destination updated successfully!");
      // Clear inputs
      updateDestinationIdInput.value = "";
      updateDestinationNameInput.value = "";
      updateDestinationImgInput.value = "";
      updateDestinationBrandInput.value = "";
      updateDestinationPriceInput.value = "";
      fetchProduct(data);
    })
    .catch((error) => {
      console.log(error);
      alert("Error updating destination");
    });
});

let sortProductLowtoHigh = document.getElementById("sort-low-to-high");
sortProductLowtoHigh.addEventListener("click", function () {
  fetch(`${API_BASE_URL}/destinations/?_sort=price,views&_order=asc`)
    .then((response) => {
      return response.json();
    })
    .then((productData) => {
      console.log(productData);
      renderCards(productData);
    })
    .catch((error) => {
      console.error(error);
    });
});

let sortProductHightoLow = document.getElementById("sort-high-to-low");
sortProductHightoLow.addEventListener("click", () => {
  console.log("low");
  fetch(`${API_BASE_URL}/destinations?_sort=price,views&_order=desc`)
    .then((res) => res.json())
    .then((productData) => {
      renderCards(productData);
    })
    .catch((err) => {
      console.log(err);
    });
});

// filterSelect.addEventListener("change", function (e) {
//   const selectedBatch = e.target.value;

//   fetch("http://localhost:1999/products")
//     .then((response) => {
//       return response.json();
//     })
//     .then((users) => {
//       const filteredUsers = filterUsersByBatch(users, selectedBatch);
//       renderCards(filteredUsers);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });

// function filterUsersByBatch(users, batchFilter) {
//   if (batchFilter === "") {
//     return users;
//   } else {
//     return users.filter((user) => user.batch === batchFilter);
//     searchQuery;
//   }
// }
searchInput.addEventListener("input", function (e) {
  const searchQuery = e.target.value.toLowerCase().trim();

  fetch(`${API_BASE_URL}/destinations`)
    .then((response) => {
      return response.json();
    })
    .then((users) => {
      const filteredUsers = searchUsersByName(users, searchQuery);
      renderCards(filteredUsers);
    })
    .catch((error) => {
      console.error(error);
    });
});

function searchUsersByName(users, searchQuery) {
  if (searchQuery === "") {
    return users;
  } else {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery) ||
        user.location.toLowerCase().includes(searchQuery)
    );
  }
}
