const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aa1127589297@",
  database: "mali_db"
});

db.connect(function (err) {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.get("/", function (req, res) {
  res.send("Mali backend is running");
});

/* REGISTER */
app.post("/api/register", function (req, res) {
  const { name, email, mobile, monthlyIncome, ageRange, status, password } = req.body;

  if (!name || !email || !mobile || !monthlyIncome || !ageRange || !status || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], function (err, results) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "An account already exists. Please login." });
    }

    const sql = `
      INSERT INTO users (name, email, mobile, income, age_range, status, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, mobile, Number(monthlyIncome), ageRange, status, password],
      function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error." });
        }

        res.json({
          message: "Account created successfully!",
          userId: result.insertId,
          user: {
            id: result.insertId,
            name: name,
            email: email,
            mobile: mobile,
            monthlyIncome: Number(monthlyIncome),
            ageRange: ageRange,
            status: status
          }
        });
      }
    );
  });
});

/* LOGIN */
app.post("/api/login", function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], function (err, results) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "No account found. Please register first." });
    }

    const user = results[0];

    if (String(user.password) !== String(password)) {
      return res.status(400).json({ message: "Email or password is incorrect." });
    }

    res.json({
      message: "Login successful!",
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        monthlyIncome: user.income,
        ageRange: user.age_range,
        status: user.status
      }
    });
  });
});

/* ADD EXPENSE */
app.post("/api/expenses", function (req, res) {
  const { amount, category, date, note, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User is required. Please login again." });
  }

  if (!amount || !category || !date) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0." });
  }

  const sql = `
    INSERT INTO expenses (user_id, amount, category, date, note)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [userId, Number(amount), category, date, note || ""], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json({
      message: "Expense added successfully!",
      expenseId: result.insertId
    });
  });
});

/* GET EXPENSES FOR ONE USER */
app.get("/api/expenses/:userId", function (req, res) {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User is required." });
  }

  const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [userId], function (err, results) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json(results);
  });
});

/* CLEAR EXPENSES FOR ONE USER */
app.delete("/api/expenses/:userId", function (req, res) {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User is required." });
  }

  const sql = "DELETE FROM expenses WHERE user_id = ?";

  db.query(sql, [userId], function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json({ message: "Report cleared successfully!" });
  });
});

/* CONTACT */
app.post("/api/contact", function (req, res) {
  const { firstName, lastName, mobile, email, language, message } = req.body;

  if (!firstName || !lastName || !mobile || !email || !language || !message) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const sql = `
    INSERT INTO contacts (firstName, lastName, mobile, email, language, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [firstName, lastName, mobile, email, language, message], function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json({ message: "Message sent successfully!" });
  });
});

/* ADD REVIEW */
app.post("/api/reviews", function (req, res) {
  const { name, review } = req.body;

  if (!name || !review) {
    return res.status(400).json({ message: "Please fill all fields." });
  }

  const sql = "INSERT INTO reviews (name, review) VALUES (?, ?)";

  db.query(sql, [name, review], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json({
      message: "Review added successfully!",
      reviewId: result.insertId
    });
  });
});

/* GET REVIEWS */
app.get("/api/reviews", function (req, res) {
  const sql = "SELECT * FROM reviews ORDER BY id DESC";

  db.query(sql, function (err, results) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error." });
    }

    res.json(results);
  });
});

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});