const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const User = require("../models/user.js");

const MONGODB_TEST_URI = process.env.DB_URL || "mongodb://127.0.0.1:27017/wanderlust";

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_TEST_URI);
  }
  await User.deleteMany({ username: { $in: ["pw_tester", "reset_tester"] } });
});

test.after(async () => {
  await User.deleteMany({ username: { $in: ["pw_tester", "reset_tester"] } });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test("passwords are encrypted and saved as cryptographic hashes in MongoDB, never plaintext", async () => {
  const plainPassword = "SuperSecretPassword123!";
  const user = new User({
    username: "pw_tester",
    email: "pw_tester@example.com",
  });

  const registered = await User.register(user, plainPassword);

  // 1. Password field must NOT exist as plain text
  assert.strictEqual(registered.password, undefined);
  
  // 2. Hash and Salt must exist and be cryptographically non-trivial strings
  assert.ok(registered.hash, "Hash must exist in MongoDB");
  assert.ok(registered.salt, "Salt must exist in MongoDB");
  assert.notStrictEqual(registered.hash, plainPassword);
  assert.strictEqual(typeof registered.hash, "string");
  assert.strictEqual(typeof registered.salt, "string");

  // Read raw document directly from MongoDB to verify disk format
  const rawDoc = await User.collection.findOne({ username: "pw_tester" });
  assert.strictEqual(rawDoc.password, undefined, "Raw MongoDB doc has no plaintext password");
  assert.ok(rawDoc.hash, "Raw MongoDB doc contains cryptographic hash");
  assert.ok(rawDoc.salt, "Raw MongoDB doc contains cryptographic salt");
});

test("user can edit/change password and it updates the hash in MongoDB", async () => {
  const user = await User.findOne({ username: "pw_tester" }).select("+hash +salt");
  assert.ok(user);

  const initialHash = user.hash;
  const initialSalt = user.salt;

  // Change password to a new password
  const newPassword = "NewUpdatedPassword456!";
  await user.changePassword("SuperSecretPassword123!", newPassword);
  await user.save();

  // Verify hash and salt were rotated
  const updatedUser = await User.findOne({ username: "pw_tester" }).select("+hash +salt");
  assert.notStrictEqual(updatedUser.hash, initialHash, "New hash derived");
  assert.notStrictEqual(updatedUser.salt, initialSalt, "New salt generated");

  // Verify authentication with new password succeeds and old password fails
  const authNew = await User.authenticate()("pw_tester", newPassword);
  assert.ok(authNew.user, "Authentication with new password succeeds");

  const authOld = await User.authenticate()("pw_tester", "SuperSecretPassword123!");
  assert.strictEqual(authOld.user, false, "Authentication with old password fails");
});

test("user can reset password via setPassword and it updates MongoDB", async () => {
  const resetUser = new User({
    username: "reset_tester",
    email: "reset_tester@example.com",
  });
  await User.register(resetUser, "OldPassword999!");

  const user = await User.findOne({ username: "reset_tester" });
  const brandNewPassword = "BrandNewPassword2026!";
  await user.setPassword(brandNewPassword);
  await user.save();

  // Verify new password authenticates
  const auth = await User.authenticate()("reset_tester", brandNewPassword);
  assert.ok(auth.user, "Authentication with reset password succeeds");

  const authFail = await User.authenticate()("reset_tester", "OldPassword999!");
  assert.strictEqual(authFail.user, false, "Old password rejected");
});
