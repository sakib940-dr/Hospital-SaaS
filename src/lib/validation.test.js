import test from "node:test";
import assert from "node:assert/strict";
import { isValidDomain, isValidPhone, isValidSubdomain, sanitizeDomain, sanitizePhone, sanitizeSubdomain, sanitizeText } from "./validation.js";

test("subdomain sanitization enforces lowercase and single hyphens", () => {
  assert.equal(sanitizeSubdomain(" Eye Hospital!! "), "eye-hospital");
  assert.equal(sanitizeSubdomain("a--b"), "a-b");
  assert.equal(isValidSubdomain("eye-hospital"), true);
  assert.equal(isValidSubdomain("Eye_Hospital"), false);
});

test("phone and domain validation reject malformed input", () => {
  assert.equal(sanitizePhone("+880 1711-123456"), "+8801711123456");
  assert.equal(isValidPhone("+8801711123456"), true);
  assert.equal(isValidPhone("123"), false);
  assert.equal(sanitizeDomain("https://Hospital.Example.com/"), "hospital.example.com");
  assert.equal(isValidDomain("hospital.example.com"), true);
});

test("text sanitization strips control characters and caps length", () => {
  assert.equal(sanitizeText("  hello\u0000world  ", 20), "helloworld");
  assert.equal(sanitizeText("abcdef", 3), "abc");
});
