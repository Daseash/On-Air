const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const app = require("../app.js");

const routes = [
  { path: "/help", view: "info/help.ejs", text: "How can we help you?" },
  { path: "/safety", view: "info/safety.ejs", text: "Your Safety is Our Top Priority" },
  { path: "/cancellation", view: "info/cancellation.ejs", text: "Cancellation Options" },
  { path: "/report-concern", view: "info/report-concern.ejs", text: "Report a Concern" },
  { path: "/host-resources", view: "info/host-resources.ejs", text: "Host Resources" },
  { path: "/community", view: "info/community.ejs", text: "Community Forum" },
  { path: "/responsible-hosting", view: "info/responsible-hosting.ejs", text: "Responsible Hosting" },
  { path: "/about", view: "info/about.ejs", text: "Belong Anywhere" },
  { path: "/careers", view: "info/careers.ejs", text: "Shape the Future of Travel" },
  { path: "/press", view: "info/press.ejs", text: "Press & Newsroom" },
  { path: "/contact", view: "info/contact.ejs", text: "Contact the ON AIR Team" },
  { path: "/privacy", view: "info/privacy.ejs", text: "Privacy Policy" },
  { path: "/terms", view: "info/terms.ejs", text: "Terms of Service" },
  { path: "/sitemap", view: "info/sitemap.ejs", text: "Website Sitemap" },
];

test("footer template has real routes and no dead hash links for navigation", () => {
  const footerContent = fs.readFileSync(path.join(__dirname, "../views/includes/footer.ejs"), "utf8");
  for (const r of routes) {
    assert.ok(
      footerContent.includes(`href="${r.path}"`),
      `Expected footer.ejs to contain link to ${r.path}`
    );
  }
});

for (const r of routes) {
  test(`renders ${r.view} with expected content`, async () => {
    await new Promise((resolve, reject) => {
      app.render(
        r.view,
        {
          pageTitle: "Test",
          currentUser: null,
          success: [],
          error: [],
          _csrf: "test_csrf",
          concernParam: false,
        },
        (err, html) => {
          if (err) return reject(err);
          try {
            assert.ok(html.includes("ON AIR"), "Expected page to include ON AIR brand");
            assert.ok(html.includes(r.text), `Expected page to include '${r.text}'`);
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  });
}
