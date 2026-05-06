const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", function () {
    mainNav.classList.toggle("show");
  });
}

const numberInputs = document.querySelectorAll('input[type="number"]');

numberInputs.forEach(function (input) {
  input.addEventListener("wheel", function (event) {
    event.preventDefault();
    input.blur();
  });
});

function getCurrentUserId() {
  return localStorage.getItem("userId");
}

function getCurrentUserProfile() {
  return JSON.parse(localStorage.getItem("userProfile")) || null;
}

function setCurrentUserProfile(profile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

function formatMoney(value) {
  const number = parseFloat(value) || 0;
  return number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("userProfile");
  window.location.href = "login.html";
}

/* Protected Links */
const protectedLinks = document.querySelectorAll(".protected-link");

protectedLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (!localStorage.getItem("userId")) {
      event.preventDefault();
      window.location.href = "login.html";
    }
  });
});

/* Status Buttons */
const statusButtons = document.querySelectorAll(".status-btn");
let selectedStatus = "";

statusButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    statusButtons.forEach(function (button) {
      button.classList.remove("active");
    });

    btn.classList.add("active");
    selectedStatus = btn.textContent.trim();
  });
});

/* Review Form */
function addReview() {
  const nameInput = document.getElementById("userName");
  const reviewInput = document.getElementById("userReview");
  const reviewStatus = document.getElementById("reviewStatus");

  if (!nameInput || !reviewInput || !reviewStatus) return;

  const name = nameInput.value.trim();
  const review = reviewInput.value.trim();

  if (!name || !review) {
    reviewStatus.textContent = "Please fill all fields.";
    return;
  }

  fetch("http://localhost:3000/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      review: review
    })
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      reviewStatus.textContent = data.message;
      nameInput.value = "";
      reviewInput.value = "";
      loadReviews();
    })
    .catch(function () {
      reviewStatus.textContent = "Server error. Please try again.";
    });
}

function loadReviews() {
  const reviewsContainer = document.getElementById("reviewsContainer");

  if (!reviewsContainer) return;

  fetch("http://localhost:3000/api/reviews")
    .then(function (response) {
      return response.json();
    })
    .then(function (reviews) {
      reviewsContainer.innerHTML = "";

      if (reviews.length === 0) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
      }

      reviews.forEach(function (item) {
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");

        reviewCard.innerHTML = `
          <p>"${item.review}"</p>
          <span>— ${item.name}</span>
        `;

        reviewsContainer.appendChild(reviewCard);
      });
    })
    .catch(function () {
      reviewsContainer.innerHTML = "<p>Could not load reviews.</p>";
    });
}

loadReviews();

/* Contact Form */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const formStatus = document.getElementById("formStatus");

  const showError = function (input, message) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    input.classList.add("input-error");
    errorElement.textContent = message;
  };

  const clearError = function (input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    input.classList.remove("input-error");
    errorElement.textContent = "";
  };

  const validateName = function (input, fieldName) {
    const value = input.value.trim();
    const namePattern = /^[A-Za-z\s]{2,30}$/;

    if (value === "") {
      showError(input, `${fieldName} is required.`);
      return false;
    }

    if (!namePattern.test(value)) {
      showError(input, `${fieldName} must contain only letters and be 2 to 30 characters.`);
      return false;
    }

    clearError(input);
    return true;
  };

  const validateMobile = function (input) {
    const value = input.value.trim();
    const mobilePattern = /^05[0-9]{8}$/;

    if (value === "") {
      showError(input, "Mobile number is required.");
      return false;
    }

    if (!mobilePattern.test(value)) {
      showError(input, "Mobile number must start with 05 and contain 10 digits.");
      return false;
    }

    clearError(input);
    return true;
  };

  const validateEmail = function (input) {
    const value = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      showError(input, "Email address is required.");
      return false;
    }

    if (!emailPattern.test(value)) {
      showError(input, "Please enter a valid email address.");
      return false;
    }

    clearError(input);
    return true;
  };

  const validateLanguage = function (input) {
    if (input.value === "") {
      showError(input, "Please select a language.");
      return false;
    }

    clearError(input);
    return true;
  };

  const validateMessage = function (input) {
    const value = input.value.trim();

    if (value === "") {
      showError(input, "Message is required.");
      return false;
    }

    if (value.length < 10) {
      showError(input, "Message must be at least 10 characters.");
      return false;
    }

    if (value.length > 300) {
      showError(input, "Message must not exceed 300 characters.");
      return false;
    }

    clearError(input);
    return true;
  };

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const mobile = document.getElementById("mobile");
    const email = document.getElementById("email");
    const language = document.getElementById("language");
    const message = document.getElementById("message");

    const isFirstNameValid = validateName(firstName, "First name");
    const isLastNameValid = validateName(lastName, "Last name");
    const isMobileValid = validateMobile(mobile);
    const isEmailValid = validateEmail(email);
    const isLanguageValid = validateLanguage(language);
    const isMessageValid = validateMessage(message);

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isMobileValid &&
      isEmailValid &&
      isLanguageValid &&
      isMessageValid
    ) {
      fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          mobile: mobile.value.trim(),
          email: email.value.trim(),
          language: language.value,
          message: message.value.trim()
        })
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          formStatus.textContent = data.message;
          contactForm.reset();
        })
        .catch(function () {
          formStatus.textContent = "Server error. Please try again.";
        });
    } else {
      formStatus.textContent = "";
    }
  });
}

/* Register / Get Started */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const registerStatus = document.getElementById("registerStatus");

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const mobile = document.getElementById("registerMobile").value.trim();
    const income = document.getElementById("monthlyIncome").value.trim();
    const ageRange = document.getElementById("ageRange").value;
    const password = document.getElementById("registerPassword").value.trim();

    if (
      name === "" ||
      email === "" ||
      mobile === "" ||
      income === "" ||
      ageRange === "" ||
      password === ""
    ) {
      registerStatus.textContent = "Please fill in all fields.";
      return;
    }

    if (!/^[A-Za-z\s]{2,30}$/.test(name)) {
      registerStatus.textContent = "Name must contain only letters and be 2 to 30 characters.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      registerStatus.textContent = "Please enter a valid email address.";
      return;
    }

    if (!/^05[0-9]{8}$/.test(mobile)) {
      registerStatus.textContent = "Mobile number must start with 05 and contain 10 digits.";
      return;
    }

    if (parseFloat(income) <= 0) {
      registerStatus.textContent = "Monthly income must be greater than 0.";
      return;
    }

    if (password.length < 6) {
      registerStatus.textContent = "Password must be at least 6 characters.";
      return;
    }

    if (selectedStatus === "") {
      registerStatus.textContent = "Please select your status.";
      return;
    }

    const userProfile = {
      name: name,
      email: email,
      mobile: mobile,
      monthlyIncome: parseFloat(income),
      ageRange: ageRange,
      status: selectedStatus,
      password: password
    };

    fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userProfile)
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        registerStatus.textContent = data.message;

        if (data.userId) {
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("isLoggedIn", "true");

          if (data.user) {
            setCurrentUserProfile(data.user);
          } else {
            setCurrentUserProfile({
              id: data.userId,
              name: name,
              email: email,
              mobile: mobile,
              monthlyIncome: parseFloat(income),
              ageRange: ageRange,
              status: selectedStatus
            });
          }

          setTimeout(function () {
            window.location.href = "expenses.html";
          }, 800);
        }
      })
      .catch(function () {
        registerStatus.textContent = "Server error. Please try again.";
      });
  });
}

/* Login Form */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const loginStatus = document.getElementById("loginStatus");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "") {
      loginStatus.textContent = "Email address is required.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      loginStatus.textContent = "Please enter a valid email address.";
      return;
    }

    if (password === "") {
      loginStatus.textContent = "Password is required.";
      return;
    }

    if (password.length < 6) {
      loginStatus.textContent = "Password must be at least 6 characters.";
      return;
    }

    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        loginStatus.textContent = data.message;

        if (data.userId) {
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("isLoggedIn", "true");

          if (data.user) {
            setCurrentUserProfile(data.user);
          }

          setTimeout(function () {
            window.location.href = "expenses.html";
          }, 800);
        }
      })
      .catch(function () {
        loginStatus.textContent = "Server error. Please try again.";
      });
  });
}

/* Add Expense Form */
const expenseForm = document.getElementById("expenseForm");

if (expenseForm) {
  const expenseStatus = document.getElementById("expenseStatus");
  const categoryField = document.getElementById("category");
  const otherCategoryField = document.getElementById("otherCategory");
  const otherCategoryGroup = document.getElementById("otherCategoryGroup");

  if (categoryField && otherCategoryField && otherCategoryGroup) {
    categoryField.addEventListener("change", function () {
      if (this.value === "Other") {
        otherCategoryGroup.style.display = "block";
        otherCategoryField.setAttribute("required", "required");
      } else {
        otherCategoryGroup.style.display = "none";
        otherCategoryField.removeAttribute("required");
        otherCategoryField.value = "";
      }
    });
  }

  expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = getCurrentUserId();

    if (!userId) {
      window.location.href = "login.html";
      return;
    }

    const amount = document.getElementById("amount").value.trim();
    const categorySelect = document.getElementById("category");
    let category = categorySelect.value;
    const otherCategoryInput = document.getElementById("otherCategory");
    const date = document.getElementById("expenseDate").value;
    const note = document.getElementById("note").value.trim();

    const expenseAmount = parseFloat(amount);

    if (amount === "" || isNaN(expenseAmount) || expenseAmount <= 0) {
      expenseStatus.textContent = "Please enter a valid amount greater than 0.";
      return;
    }

    if (category === "") {
      expenseStatus.textContent = "Please select a category.";
      return;
    }

    if (category === "Other") {
      const otherValue = otherCategoryInput.value.trim();
      if (otherValue === "") {
        expenseStatus.textContent = "Please enter a custom category for Other.";
        return;
      }
      category = otherValue;
    }

    if (date === "") {
      expenseStatus.textContent = "Please select a date.";
      return;
    }

    if (note.length > 200) {
      expenseStatus.textContent = "Note must not exceed 200 characters.";
      return;
    }

    fetch("http://localhost:3000/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: expenseAmount,
        category: category,
        date: date,
        note: note,
        userId: userId
      })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        expenseStatus.textContent = data.message;

        if (data.expenseId) {
          expenseForm.reset();

          if (otherCategoryGroup) {
            otherCategoryGroup.style.display = "none";
            otherCategoryField.removeAttribute("required");
            otherCategoryField.value = "";
          }
        }
      })
      .catch(function () {
        expenseStatus.textContent = "Server error. Please try again.";
      });
  });
}

/* View Report Page */
const reportList = document.getElementById("reportList");

function loadReport() {
  const userId = getCurrentUserId();

  if (!reportList) return;

  if (!userId) {
    window.location.href = "login.html";
    return;
  }

  fetch(`http://localhost:3000/api/expenses/${userId}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (expenses) {
      const userProfile = getCurrentUserProfile();

      let income = 0;

      if (userProfile && userProfile.monthlyIncome) {
        income = parseFloat(userProfile.monthlyIncome);
      }

      let totalExpenses = 0;
      const categories = {};

      if (Array.isArray(expenses)) {
        expenses.forEach(function (expense) {
          const amount = parseFloat(expense.amount) || 0;
          totalExpenses += amount;

          if (!categories[expense.category]) {
            categories[expense.category] = 0;
          }

          categories[expense.category] += amount;
        });
      }

      const balance = income - totalExpenses;

      document.getElementById("reportIncome").textContent = formatMoney(income) + " SAR";
      document.getElementById("reportExpenses").textContent = formatMoney(totalExpenses) + " SAR";
      document.getElementById("reportBalance").textContent = formatMoney(balance) + " SAR";

      let highestCategory = "No data yet";
      let highestAmount = 0;

      for (let category in categories) {
        if (categories[category] > highestAmount) {
          highestAmount = categories[category];
          highestCategory = category;
        }
      }

      document.getElementById("reportCategory").textContent = highestCategory;

      if (!Array.isArray(expenses) || expenses.length === 0) {
        reportList.innerHTML = "<p>No expenses have been added yet.</p>";
      } else {
        reportList.innerHTML = "";

        expenses.forEach(function (expense) {
          const item = document.createElement("div");
          item.classList.add("info-item");

          const formattedDate = expense.date
            ? String(expense.date).substring(0, 10)
            : "No date";

          item.innerHTML = `
            <h3>${expense.category}</h3>
            <p><strong>Amount:</strong> ${formatMoney(expense.amount)} SAR</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Note:</strong> ${expense.note || "No note added"}</p>
          `;

          reportList.appendChild(item);
        });
      }
    })
    .catch(function () {
      reportList.innerHTML = "<p>Could not load report data.</p>";
    });
}

if (reportList) {
  loadReport();
}

/* Navbar Auth UI */
const guestItems = document.querySelectorAll(".guest-only");
const userItems = document.querySelectorAll(".user-only");

if (localStorage.getItem("userId") && localStorage.getItem("isLoggedIn") === "true") {
  guestItems.forEach(item => item.style.display = "none");
  userItems.forEach(item => item.style.display = "inline-flex");
} else {
  guestItems.forEach(item => item.style.display = "inline-flex");
  userItems.forEach(item => item.style.display = "none");
}


/* Clear Report Button */
const clearReportButton = document.getElementById("clearReportButton");

if (clearReportButton) {
  clearReportButton.addEventListener("click", function () {
    const userId = getCurrentUserId();

    if (!userId) {
      window.location.href = "login.html";
      return;
    }

    fetch(`http://localhost:3000/api/expenses/${userId}`, {
      method: "DELETE"
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        alert(data.message);
        loadReport();
      })
      .catch(function () {
        alert("Error clearing report.");
      });
  });
}