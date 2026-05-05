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

  users.push({ username, password });
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
    localStorage.setItem("currentUser", username);
    window.location.href = "home.html";
  } else {
    document.getElementById("message").innerText = "Invalid login!";
  }
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const container = document.getElementById("products");

  container.innerHTML = "";

  products.forEach(product => {
    container.innerHTML += `
      <div style="margin-bottom:20px;">
        <h3>${product.title}</h3>
        <img src="${product.img}" width="150" style="display:block; margin-bottom:10px;">
        <p>${product.desc}</p>
        <p><strong>${product.price}</strong></p>
      </div>
    `;
  });
}

function goToRegister() {
  window.location.href = "register.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}