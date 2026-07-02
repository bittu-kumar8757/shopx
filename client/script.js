// ================= PRODUCTS =================

let products = [];

// ================= VARIABLES =================

let cart = [];

let selectedSize = "";

let currentProduct = null;

// ================= ELEMENTS =================

const productsContainer = document.querySelector(".products-container");

const cartCount = document.getElementById("cartCount");

const cartSidebar = document.getElementById("cartSidebar");

const cartItems = document.getElementById("cartItems");

const cartTotal = document.getElementById("cartTotal");

const closeCart = document.getElementById("closeCart");

const cartIcon = document.querySelector(".cart-icon");

const searchInput = document.getElementById("searchInput");

const searchBtn = document.getElementById("searchBtn");

const categoryButtons = document.querySelectorAll(".category-btn");

// ================= VARIANT MODAL =================

const variantModal = document.getElementById("variantModal");

const variantImage = document.getElementById("variantImage");

const variantTitle = document.getElementById("variantTitle");

const variantPrice = document.getElementById("variantPrice");

const closeVariant = document.getElementById("closeVariant");

const continueVariant = document.getElementById("continueVariant");

const sizeButtons = document.querySelectorAll(".size-btn");

// ================= ADDRESS MODAL =================

const addressModal = document.getElementById("addressModal");

const closeAddress = document.getElementById("closeAddress");

const continueAddress = document.getElementById("continueAddress");

// ================= SUMMARY PAGE =================

const summaryPage = document.getElementById("summaryPage");

const summaryName = document.getElementById("summaryName");

const summaryAddress = document.getElementById("summaryAddress");

const summaryPhone = document.getElementById("summaryPhone");

const summaryImage = document.getElementById("summaryImage");

const summaryProduct = document.getElementById("summaryProduct");

const summarySize = document.getElementById("summarySize");

const summaryPrice = document.getElementById("summaryPrice");

const finalPrice = document.getElementById("finalPrice");

const totalAmount = document.getElementById("totalAmount");

const continuePayment = document.getElementById("continuePayment");

// ================= PAYMENT PAGE =================

const paymentPage = document.getElementById("paymentPage");

const paymentPrice = document.getElementById("paymentPrice");

const paymentTotal = document.getElementById("paymentTotal");

const discountPrice = document.getElementById("discountPrice");

const placeFinalOrder = document.getElementById("placeFinalOrder");

// ================= SHOW PRODUCTS =================

function showProducts(products) {
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");

    productCard.classList.add("product-card");

    productCard.innerHTML = `

    <a href="product-details.html?id=${product._id}">

<img src="${product.image}">

</a>

<div class="product-info">

<a href="product-details.html?id=${product._id}">

<h3>${product.name}</h3>

</a>

<p>₹${product.price}</p>

<div class="product-buttons">

<button class="add-cart-btn">

Add To Cart

</button>

<button class="buy-now-btn">

Buy Now

</button>

</div>

</div>
`;

    // ADD TO CART
    const addBtn = productCard.querySelector(".add-cart-btn");

    addBtn.addEventListener("click", () => {
      cart.push(product);

      cartCount.innerHTML = cart.length;

      renderCart();
    });

    // BUY NOW
    const buyBtn = productCard.querySelector(".buy-now-btn");

    buyBtn.addEventListener("click", () => {
      // CHECK LOGIN
      const user = JSON.parse(localStorage.getItem("user"));

      // IF NOT LOGIN
      if (!user) {
        alert("Please login first");

        window.location.href = "login.html";

        return;
      }

      currentProduct = product;

      variantModal.style.display = "flex";

      variantImage.src = product.image;

      variantTitle.innerHTML = product.name;

      variantPrice.innerHTML = `₹${product.price}`;
    });

    productsContainer.appendChild(productCard);
  });
}

// ================= RENDER CART =================

function renderCart() {
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const cartItem = document.createElement("div");

    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `

            <img src="${item.image}" alt="product">

            <div class="cart-item-info">

                <h4>${item.name}</h4>

                <p>₹${item.price}</p>

                <button class="remove-btn">

                    Remove

                </button>

            </div>

        `;

    // REMOVE BUTTON
    const removeBtn = cartItem.querySelector(".remove-btn");

    removeBtn.addEventListener("click", () => {
      cart.splice(index, 1);

      cartCount.innerHTML = cart.length;

      renderCart();
    });

    cartItems.appendChild(cartItem);
  });

  cartTotal.innerHTML = total;
}

// ================= CART =================

cartIcon.addEventListener("click", () => {
  cartSidebar.classList.add("active");
});

closeCart.addEventListener("click", () => {
  cartSidebar.classList.remove("active");
});

// ================= SEARCH =================

searchBtn.addEventListener("click", () => {
  let searchText = searchInput.value.toLowerCase();

  let filteredProducts = products.filter((product) => {
    return product.name.toLowerCase().includes(searchText);
  });

  showProducts(filteredProducts);
});

// ================= CATEGORY =================

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    let category = button.innerHTML;

    if (category === "All") {
      showProducts(products);

      return;
    }

    let filteredProducts = products.filter((product) => {
      return product.category === category;
    });

    showProducts(filteredProducts);
  });
});

// ================= SIZE SELECT =================

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sizeButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedSize = button.innerHTML;
  });
});

// ================= CONTINUE VARIANT =================

continueVariant.addEventListener("click", () => {
  if (selectedSize === "") {
    alert("Please select size");

    return;
  }

  variantModal.style.display = "none";

  addressModal.style.display = "flex";
});

// ================= CLOSE MODALS =================

closeVariant.addEventListener("click", () => {
  variantModal.style.display = "none";
});

closeAddress.addEventListener("click", () => {
  addressModal.style.display = "none";
});

// ================= ADDRESS CONTINUE =================

continueAddress.addEventListener("click", () => {
  const customerName = document.getElementById("customerName").value;

  const customerPhone = document.getElementById("customerPhone").value;

  const customerPincode = document.getElementById("customerPincode").value;

  const customerHouse = document.getElementById("customerHouse").value;

  const customerArea = document.getElementById("customerArea").value;

  const customerLandmark = document.getElementById("customerLandmark").value;

  const customerCity = document.getElementById("customerCity").value;

  const customerState = document.getElementById("customerState").value;

  // VALIDATION
  if (
    customerName === "" ||
    customerPhone === "" ||
    customerPincode === "" ||
    customerHouse === "" ||
    customerArea === "" ||
    customerLandmark === "" ||
    customerCity === "" ||
    customerState === ""
  ) {
    alert("Please fill all details");

    return;
  }

  // CLOSE ADDRESS
  addressModal.style.display = "none";

  // OPEN SUMMARY
  summaryPage.style.display = "flex";

  // SUMMARY DETAILS
  summaryName.innerHTML = customerName;

  summaryPhone.innerHTML = customerPhone;

  summaryAddress.innerHTML = `

        ${customerHouse},

        ${customerArea},

        ${customerLandmark},

        ${customerCity},

        ${customerState},

        ${customerPincode}

    `;

  summaryImage.src = currentProduct.image;

  summaryProduct.innerHTML = currentProduct.name;

  summarySize.innerHTML = selectedSize;

  summaryPrice.innerHTML = currentProduct.price;

  finalPrice.innerHTML = `₹${currentProduct.price}`;

  totalAmount.innerHTML = `₹${currentProduct.price - 20}`;
});

// ================= PAYMENT PAGE =================

continuePayment.addEventListener("click", () => {
  summaryPage.style.display = "none";

  paymentPage.style.display = "block";

  let discount = currentProduct.price * 0.2;

  let deliveryCharge = 49;

  let firstOrder = localStorage.getItem("firstOrder");

  // FIRST ORDER FREE
  if (firstOrder !== "done") {
    deliveryCharge = 0;
  }

  // ABOVE 999 FREE
  if (currentProduct.price > 999) {
    deliveryCharge = 0;
  }

  let finalAmount = currentProduct.price - discount + deliveryCharge;

  paymentPrice.innerHTML = `₹${currentProduct.price}`;

  discountPrice.innerHTML = `-₹${discount}`;

  document.querySelector(".delivery-price").innerHTML =
    deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`;

  paymentTotal.innerHTML = `₹${finalAmount}`;
});

// ================= FINAL ORDER =================

placeFinalOrder.addEventListener("click", async () => {
  localStorage.setItem("firstOrder", "done");

  try {
    // ORDER DATA
    const orderData = {
      customerName: summaryName.innerHTML,

      customerPhone: summaryPhone.innerHTML,

      customerAddress: summaryAddress.innerHTML,

      productName: currentProduct.name,

      productPrice: currentProduct.price,

      productImage: currentProduct.image,

      productSize: selectedSize,

      userEmail:user.email
    };

    // SEND TO BACKEND
    const response = await fetch(
      "https://shopx-backends.onrender.com/orders",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(orderData),
      },
    );

    const data = await response.json();

    alert(data.message);

    // SAVE FIRST ORDER
    localStorage.setItem("firstOrder", "done");

    // CLOSE PAYMENT PAGE
    paymentPage.style.display = "none";
  } catch (error) {
    console.log(error);
  }

  paymentPage.style.display = "none";
});

// FETCH PRODUCTS

async function fetchProducts() {
  try {
    const response = await fetch("https://shopx-backends.onrender.com/products");
    const data = await response.json();

    products = data;

    showProducts(products);
    
  // BUY FROM DETAILS PAGE

const urlParams =
new URLSearchParams(

window.location.search

);



const buyId =
urlParams.get("buy");



if(buyId){

    const product =
    products.find((item) => {

        return item._id === buyId;

    });



    if(product){

        currentProduct = product;

        variantModal.style.display =
        "flex";



        variantImage.src =
        product.image;



        variantTitle.innerHTML =
        product.name;



        variantPrice.innerHTML =
        `₹${product.price}`;
    }

}
  } catch (error) {
    console.log(error);
  }
}

// ================= INITIAL PRODUCTS =================

fetchProducts();

// ================= AUTH SYSTEM =================

const loginLink = document.getElementById("loginLink");

const signupLink = document.getElementById("signupLink");

const profileBtn = document.getElementById("profileBtn");

const logoutBtn = document.getElementById("logoutBtn");

// GET USER
const user = JSON.parse(localStorage.getItem("user"));

// LOGIN CHECK
if (user) {
  if (loginLink) {
    loginLink.style.display = "none";
  }

  if (signupLink) {
    signupLink.style.display = "none";
  }

  if (profileBtn) {
    profileBtn.style.display = "block";
  }

  if (logoutBtn) {
    logoutBtn.style.display = "block";
  }
} else {
  if (profileBtn) {
    profileBtn.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.style.display = "none";
  }
}

// PROFILE BUTTON
if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

// LOGOUT BUTTON
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");

    window.location.reload();
  });
}
