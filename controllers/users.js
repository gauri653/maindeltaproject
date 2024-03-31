const User = require("../models/user");

module.exports.renderSignup = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res) => {

    try {
    let {username, email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err)=> {
        if(err) {
            return next(err);
        }
        req.flash("success", "You Signed Up successfully");
        res.redirect("/listings");
    })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }

};

module.exports.login = async(req,res) => {
    console.log("logged in!");
    req.flash("success", "Welcome to TraveloHub! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.renderLogin = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.logout = (req,res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }

        req.flash("success","you are logged out now!");
        res.redirect("/listings");
    })
};