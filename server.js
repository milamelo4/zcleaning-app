//====================================
// Local environment and config
//====================================
require("dotenv").config();
require("./src/config/passport");

//====================================
// Dependencies
//====================================
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

const dashboardRoutes = require("./src/routes/dashboardRoutes");
const clientsRoutes = require("./src/routes/clients");
const adminRoutes = require("./src/routes/admin");
const authRoutes = require("./src/routes/auth");

const app = express();

//====================================
// View engine setup
//====================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.set("layout", "layout/layout");
app.use(expressLayouts);

//====================================
// Middleware setup
//====================================
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//====================================
// Global middleware for flash messages and user info
//====================================
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user;
  next();
});

//====================================
// Routes setup
//====================================
app.use(authRoutes);
app.use("/", dashboardRoutes);
app.use("/clients", clientsRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.render("pages/index", { title: "Home" });
});

// 404 handler (must be after all other routes)
app.use((req, res, next) => {
  res.status(404).render("pages/errors/404", { title: "Page Not Found" });
});

// 500 handler (must have 4 arguments)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/errors/500", { title: "Server Error" });
});

//====================================
// Start server
//====================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
