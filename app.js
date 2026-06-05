// default clothing products
const defaultProducts = [
  {
    title: "Black Jacket",
    desc: "Jacket for cold weather",
    price: "$59.99",
    img: "images/blackJacket.jpg"
  },
  {
    title: "Swim shorts",
    desc: "Comfortable shorts for swimming",
    price: "$29.99",
    img: "images/summerSwimShorts.jpg"
  },
  {
    title: "Plaid Button Up",
    desc: "For date nights!",
    price: "$39.99",
    img: "images/plaidButtonUp.jpg"
  }
];

// initialize products if not here
if (!localStorage.getItem("products")) {
  localStorage.setItem("products", JSON.stringify(defaultProducts));
}

let isGrid = true;

let cartTotal = 0;

let originalTotal = 0;

function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!username || !password) {
    document.getElementById("message").innerText = "Please fill in all fields!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.username === username);
  if (exists) {
    document.getElementById("message").innerText = "User already exists!";
    return;
  }

  users.push({
    id: Date.now(),
    username,
    password
  });

  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("message").innerText = "Registered successfully! Redirecting...";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    document.getElementById("message").innerText = "Please enter username and password!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", user.id);
    window.location.href = "home.html";
  } else {
    document.getElementById("message").innerText = "The username or password is incorrect.  Please check your credentials or create a new account to start shopping.";
  }
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const container = document.getElementById("products");

  container.innerHTML = "";

  container.style.display = "flex";
  container.style.flexDirection = isGrid ? "row" : "column";
  container.style.flexWrap = "wrap";
  container.style.gap = "20px";

  products.forEach((product, index) => {
    const itemId = index + 1;

    container.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; width:200px;">
        <h3>${product.title}</h3>
        <img src="${product.img}" width="150">
        <p>${product.desc}</p>
        <p><strong>${product.price}</strong></p>

        <!-- add to cart section -->
        <button onclick="addToCart('${product.price}')">
          Add To Cart
        </button>

        <button onclick="addToWishlist(${itemId})">
          Add To Wishlist
        </button>

        <button onclick="loadRecommendations('${product.title}')">
          View Similar Items
        </button>

        <hr>

        <!-- rating section -->
        <p><strong>Rate this item:</strong></p>

        <select id="rating-${itemId}">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <button onclick="submitRating(${itemId})">
          Submit Rating
        </button>

        <button onclick="deleteRating(${itemId})">
          Delete Rating
        </button>

        <p id="avg-${itemId}">Loading rating...</p>
      </div>
    `;

    fetchAverage(itemId);
  });
}

function goToRegister() {
  window.location.href = "register.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function toggleView() {
  const container = document.getElementById("products");

  if (isGrid) {
    container.style.flexDirection = "column";
  } else {
    container.style.flexDirection = "row";
  }

  isGrid = !isGrid;
}

function goToLogin() {
  window.location.href = "index.html";
}

function addToCart(price) {
  const numericPrice = parseFloat(price.replace("$", ""));

  cartTotal += numericPrice;

  if (originalTotal === 0) {
    originalTotal = cartTotal;
  }

  document.getElementById("cartTotal").textContent =
    cartTotal.toFixed(2);
}

async function applyCoupon() {
  const couponCode = document.getElementById("couponCode").value;

  const orderTotal = cartTotal;

  const response = await fetch("http://localhost:5000/api/coupons/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      couponCode,
      orderTotal
    })
  });

  const data = await response.json();

  if (!response.ok) {
    document.getElementById("couponMessage").textContent = data.message;
    return;
  }

  cartTotal = data.discountedTotal;

  document.getElementById("cartTotal").textContent = cartTotal.toFixed(2);
  document.getElementById("couponMessage").textContent =
    "Coupon applied successfully!";
}

function submitRating(itemId) {
  const userId = localStorage.getItem("currentUser") || "0";
  const rating = document.getElementById(`rating-${itemId}`).value;

  fetch("http://localhost:3000/ratings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      itemId,
      rating
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      fetchAverage(itemId);
    });
}

function fetchAverage(itemId) {
  fetch(`http://localhost:3000/ratings/average/${itemId}`)
    .then(res => res.json())
    .then(data => {
      const avg = data.average ?? 0;
      const count = data.count ?? 0;

      document.getElementById(`avg-${itemId}`).innerText =
        `⭐ ${avg.toFixed(1)} (${count})`;
    });
}

function deleteRating(itemId) {
  const userId = localStorage.getItem("currentUser");

  fetch(`http://localhost:3000/ratings/${itemId}/${userId}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    fetchAverage(itemId);
  });
}

function addToWishlist(itemId) {
  const userId = localStorage.getItem("currentUser");

  fetch("http://localhost:4000/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      itemId
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadWishlist();
    });
}

function loadWishlist() {
  const userId = localStorage.getItem("currentUser");
  

  fetch(`http://localhost:4000/wishlist/${userId}`)
    .then(res => res.json())
    .then(data => {

      const wishlistDiv =
        document.getElementById("wishlistItems");

      wishlistDiv.style.display = "flex";
      wishlistDiv.style.flexWrap = "wrap";
      wishlistDiv.style.gap = "20px";  

      if (data.length === 0) {
        wishlistDiv.innerHTML =
          "No wishlist items yet.";
        return;
      }

      wishlistDiv.innerHTML = "";

      const products =
        JSON.parse(localStorage.getItem("products")) || [];

      data.forEach(item => {

        const product =
          products[item.itemId - 1];

        if (!product) {
          return;
        }

        wishlistDiv.innerHTML += `
          <div style="border:1px solid #ccc; padding:10px; width:180px;">
            <img src="${product.img}" width="75">

            <p><strong>${product.title}</strong></p>

            <p>${product.price}</p>

            <button onclick="removeWishlistItem(${item.itemId})">
              Remove
            </button>
          </div>
        `;
      });
    });
}

function removeWishlistItem(itemId) {
  const userId = localStorage.getItem("currentUser");

  fetch(
    `http://localhost:4000/wishlist/${userId}/${itemId}`,
    {
      method: "DELETE"
    }
  )
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadWishlist();
    });
}

function loadTrendingItems() {
  fetch("http://localhost:7000/recommendations/trending")
    .then(res => res.json())
    .then(data => {

      const div =
        document.getElementById("trendingItems");

      div.innerHTML = "";

      data.forEach(item => {
        div.innerHTML += `
          <div style="display:inline-block; margin:10px;">
            <img src="images/${item.image}" width="100">

            <p>${item.name}</p>
          </div>
        `;
      });
    });
}

function loadRecommendations(category) {

  let serviceCategory = "shirts";

  if (category.includes("Jacket")) {
    serviceCategory = "jackets";
  }
  else if (
    category.includes("Swim") ||
    category.includes("Shorts")
  ) {
    serviceCategory = "shorts";
  }

  fetch(
    `http://localhost:7000/recommendations/category/${serviceCategory}`
  )
    .then(res => res.json())
    .then(data => {

      const div =
        document.getElementById("recommendedItems");

      div.innerHTML = "";

      data.forEach(item => {
        div.innerHTML += `
          <div style="display:inline-block; margin:10px;">
            <img src="images/${item.image}" width="100">

            <p>${item.name}</p>
          </div>
        `;
      });
    });
}

function checkout() {
  if (cartTotal === 0) {
    document.getElementById("message").innerText =
      "Your cart is empty!";
    return;
  }

  document.getElementById("message").innerText =
    "Thank you for shopping at ThriftOnline!";

  cartTotal = 0;
  originalTotal = 0;
  cart = [];

  document.getElementById("cartTotal").textContent = "0.00";

  const cartItems = document.getElementById("cartItems");
  if (cartItems) {
    cartItems.innerHTML = "";
  }
}