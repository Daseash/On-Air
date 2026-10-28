const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");
const { validateUser, saveRedirectUrl, isLoggedIn } = require("../middlewares");

// Signup Route (GET & POST)
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(validateUser, wrapAsync(userController.signup));

// Login Route (GET & POST)
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          req.flash("error", (info && info.message) || "Invalid username or password!");
          return res.redirect(303, "/login");
        }
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          return userController.login(req, res);
        });
      })(req, res, next);
    }
  );

// Change Password Route (Authenticated)
router
  .route("/change-password")
  .get(isLoggedIn, userController.renderChangePasswordForm)
  .post(isLoggedIn, wrapAsync(userController.changePassword));

// Reset Password Route (Unauthenticated)
router
  .route("/reset-password")
  .get(userController.renderResetPasswordForm)
  .post(wrapAsync(userController.resetPassword));

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;