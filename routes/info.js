const express = require("express");
const router = express.Router();

// Support Routes
router.get("/help", (req, res) => {
  res.render("info/help.ejs", { pageTitle: "Help Center — ON AIR" });
});
router.get("/help-center", (req, res) => res.redirect("/help"));

router.get("/safety", (req, res) => {
  res.render("info/safety.ejs", { pageTitle: "Safety Information — ON AIR" });
});
router.get("/safety-information", (req, res) => res.redirect("/safety"));

router.get("/cancellation", (req, res) => {
  res.render("info/cancellation.ejs", { pageTitle: "Cancellation Options & Policies — ON AIR" });
});
router.get(["/cancellation-options", "/cancellation-policy"], (req, res) => res.redirect("/cancellation"));

router.get("/report-concern", (req, res) => {
  res.render("info/report-concern.ejs", { pageTitle: "Report a Concern — ON AIR" });
});
router.post("/report-concern", (req, res) => {
  req.flash("success", "Thank you for reporting this concern. Our Trust & Safety team has received your report and will investigate promptly.");
  res.redirect("/report-concern");
});

// Hosting Routes
router.get("/host-resources", (req, res) => {
  res.render("info/host-resources.ejs", { pageTitle: "Host Resources & Guides — ON AIR" });
});

router.get("/community", (req, res) => {
  res.render("info/community.ejs", { pageTitle: "Community Forum & Hub — ON AIR" });
});

router.get("/responsible-hosting", (req, res) => {
  res.render("info/responsible-hosting.ejs", { pageTitle: "Responsible Hosting — ON AIR" });
});

// Company / On Air Routes
router.get("/about", (req, res) => {
  res.render("info/about.ejs", { pageTitle: "About Us — ON AIR" });
});
router.get("/about-us", (req, res) => res.redirect("/about"));

router.get("/careers", (req, res) => {
  res.render("info/careers.ejs", { pageTitle: "Careers at ON AIR — Join Our Team" });
});

router.get("/press", (req, res) => {
  res.render("info/press.ejs", { pageTitle: "Press & Newsroom — ON AIR" });
});

router.get("/contact", (req, res) => {
  const concernParam = req.query.type === "concern";
  res.render("info/contact.ejs", { pageTitle: "Contact Us — ON AIR", concernParam });
});
router.post("/contact", (req, res) => {
  req.flash("success", "Thank you for reaching out! Our support team will get back to you within 24 hours.");
  res.redirect("/contact");
});

// Legal & Site Routes
router.get("/privacy", (req, res) => {
  res.render("info/privacy.ejs", { pageTitle: "Privacy Policy — ON AIR" });
});
router.get("/privacy-policy", (req, res) => res.redirect("/privacy"));

router.get("/terms", (req, res) => {
  res.render("info/terms.ejs", { pageTitle: "Terms of Service — ON AIR" });
});
router.get(["/terms-of-service", "/tos"], (req, res) => res.redirect("/terms"));

router.get("/sitemap", (req, res) => {
  res.render("info/sitemap.ejs", { pageTitle: "Sitemap — ON AIR" });
});

module.exports = router;
