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
const pgSession = require("connect-pg-simple")(session);
const pool = require("./src/config/db"); 

//====================================
// Routes setup
//====================================
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const clientsRoutes = require("./src/routes/clients");
const adminRoutes = require("./src/routes/admin");
const authRoutes = require("./src/routes/auth");
const appointmentsRoutes = require("./src/routes/appointments");

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
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//====================================
// Global middleware (flash messages and user info)
//====================================
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});


//====================================
// Routes 
//====================================
app.use(authRoutes);
app.use("/", dashboardRoutes);
app.use("/clients", clientsRoutes);
app.use("/admin", adminRoutes);
app.use("/appointments", appointmentsRoutes);

app.get("/", (req, res) => {
  res.render("pages/index", { title: "Home" });
});

// routes/static.js 
app.get("/privacy-policy", (req, res) => {
  res.render("pages/privacy-policy", { title: "Privacy Policy" });
});

app.get("/terms-of-service", (req, res) => {
  res.render("pages/terms-of-service", { title: "Terms of Service" });
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
