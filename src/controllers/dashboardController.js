exports.dashboard = (req, res, next) => {
    res.render("pages/dashboard", { 
        title: "Dashboard",
        user: req.user, // Passport  
    });  
}