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
const app = express();
const testRoutes = require("./src/routes/testRoutes");

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
app.use("/", dashboardRoutes);
app.use("/", testRoutes);

//====================================
// Global middleware for flash messages and user info
//====================================
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user;
  next();
});

//====================================
// Routes setup
//====================================
const authRoutes = require("./src/routes/auth");

app.get("/", (req, res) => {
  res.render("pages/index", { title: "Home" });
});

app.use(authRoutes);


//====================================
// Start server
//====================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
