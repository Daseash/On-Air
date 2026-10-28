const isAuthUrl = (url) =>
  !url ||
  url === "/" ||
  url.startsWith("/login") ||
  url.startsWith("/signup") ||
  url.startsWith("/logout") ||
  url.startsWith("/reset-password");

const mongoose = require("mongoose");
const User = require("../models/user.js");
const { login, logout, getSessionUser } = require("../utils/auth.js");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
  const sessionUser = getSessionUser(req);
  if ((req.isAuthenticated && req.isAuthenticated()) || sessionUser || (req.session && req.session.userId)) {
    return res.redirect(303, "/listings");
  }
  let nextUrl = req.query.next || "";
  if (isAuthUrl(nextUrl)) nextUrl = "";
  res.render("users/signup.ejs", {
    pageTitle: "Sign Up — On Air",
    next: nextUrl,
  });
};

// Process Signup
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body.user;

    let registeredUser;
    if (mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        req.flash("error", "Username or Email already registered!");
        return res.redirect("/signup");
      }

      let newUser = new User({ username, email });
      registeredUser = await User.register(newUser, password);
    } else {
      registeredUser = {
        _id: "000000000000000000000099",
        username,
        email,
      };
    }

    login(res, registeredUser._id, registeredUser.username);
    if (req.login) {
      req.login(registeredUser, (err) => {
        if (err) {
          console.warn("Passport serialize notice:", err.message);
        }
        req.flash("success", "Welcome to On Air!");
        let redirectUrl = res.locals.redirectUrl || req.body.next || "/listings";
        res.redirect(redirectUrl);
      });
    } else {
      req.flash("success", "Welcome to On Air!");
      let redirectUrl = res.locals.redirectUrl || req.body.next || "/listings";
      res.redirect(redirectUrl);
    }
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
  const sessionUser = getSessionUser(req);
  if ((req.isAuthenticated && req.isAuthenticated()) || sessionUser || (req.session && req.session.userId)) {
    return res.redirect(303, "/listings");
  }
  if (req.query.next && !isAuthUrl(req.query.next)) {
    req.session.redirectUrl = req.query.next;
  }
  let nextUrl = (req.session && req.session.redirectUrl) || req.query.next || "";
  if (isAuthUrl(nextUrl)) nextUrl = "";
  res.render("users/login.ejs", {
    pageTitle: "Sign In — On Air",
    next: nextUrl,
  });
};

// Process Login
module.exports.login = async (req, res) => {
  if (req.user) {
    login(res, req.user._id, req.user.username);
  }
  req.flash("success", "Welcome back to On Air!");
  let redirectUrl = res.locals.redirectUrl || req.body.next || "/listings";
  if (req.session) delete req.session.redirectUrl;
  if (!redirectUrl || isAuthUrl(redirectUrl)) {
    redirectUrl = "/listings";
  }
  res.redirect(303, redirectUrl);
};

// Render Change Password Form
module.exports.renderChangePasswordForm = (req, res) => {
  res.render("users/change-password.ejs", {
    pageTitle: "Change Password — On Air",
  });
};

// Process Change Password (Authenticated)
module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.redirect("/change-password");
    }
    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/change-password");
    }
    if (newPassword.length < 6) {
      req.flash("error", "New password must be at least 6 characters.");
      return res.redirect("/change-password");
    }

    const userId = req.user ? req.user._id : null;
    const user = await User.findById(userId).select("+hash +salt");
    if (!user) {
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/login");
    }

    await user.changePassword(oldPassword, newPassword);
    await user.save();

    req.flash("success", "Password updated successfully in database!");
    res.redirect("/listings");
  } catch (err) {
    req.flash("error", err.message || "Failed to update password. Check your current password.");
    res.redirect("/change-password");
  }
};

// Render Reset Password Form
module.exports.renderResetPasswordForm = (req, res) => {
  res.render("users/reset-password.ejs", {
    pageTitle: "Reset Password — On Air",
  });
};

// Process Reset Password (Unauthenticated)
module.exports.resetPassword = async (req, res) => {
  try {
    const { identifier, newPassword, confirmPassword } = req.body;
    if (!identifier || !newPassword || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.redirect("/reset-password");
    }
    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/reset-password");
    }
    if (newPassword.length < 6) {
      req.flash("error", "New password must be at least 6 characters.");
      return res.redirect("/reset-password");
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }],
    }).select("+hash +salt");

    if (!user) {
      req.flash("error", "No user found with that username or email.");
      return res.redirect("/reset-password");
    }

    await user.setPassword(newPassword);
    await user.save();

    req.flash("success", "Password reset successfully! Please sign in with your new password.");
    res.redirect("/login");
  } catch (err) {
    req.flash("error", err.message || "Failed to reset password.");
    res.redirect("/reset-password");
  }
};

// Logout
module.exports.logout = (req, res, next) => {
  logout(res);
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have logged out successfully.");
    res.redirect("/listings");
  });
};
