import assert from "node:assert/strict";
import test from "node:test";

import { isValidEmail, isValidEventMode, normalizeEmail } from "../lib/validation";

test("normalizeEmail trims whitespace and lowercases the address", () => {
  assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com");
});

test("isValidEmail accepts a normal email address", () => {
  assert.equal(isValidEmail("person@example.com"), true);
});

test("isValidEmail rejects empty, malformed, and oversized values", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("person-at-example.com"), false);
  assert.equal(isValidEmail("person@example"), false);
  assert.equal(isValidEmail("x".repeat(250) + "@example.com"), false);
});

test("isValidEventMode accepts only supported event modes", () => {
  assert.equal(isValidEventMode("online"), true);
  assert.equal(isValidEventMode("HYBRID"), true);
  assert.equal(isValidEventMode("offline"), true);
  assert.equal(isValidEventMode("virtual"), false);
  assert.equal(isValidEventMode(""), false);
});
