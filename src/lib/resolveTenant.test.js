import test from "node:test";
import assert from "node:assert/strict";
import { resolveTenant } from "./resolveTenant.js";

const location = (hostname, search = "", pathname = "/") => ({ hostname, search, pathname });
test("localhost supports hospital query override", () => assert.deepEqual(resolveTenant(location("localhost", "?hospital=demo")), { mode: "hospital", lookupType: "subdomain", value: "demo" }));
test("root and admin hostnames resolve platform modes", () => {
  assert.equal(resolveTenant(location("hospitalcloud.com")).mode, "marketing");
  assert.equal(resolveTenant(location("admin.hospitalcloud.com")).mode, "super-admin");
});
test("tenant subdomain and custom domain resolve correctly", () => {
  assert.deepEqual(resolveTenant(location("eye.hospitalcloud.com")), { mode: "hospital", lookupType: "subdomain", value: "eye" });
  assert.deepEqual(resolveTenant(location("care.example.org")), { mode: "hospital", lookupType: "custom_domain", value: "care.example.org" });
});
test("root host supports a single path segment as a temporary tenant preview", () => {
  assert.deepEqual(resolveTenant(location("hospitalcloud.com", "", "/demo-hospital")), { mode: "hospital", lookupType: "subdomain", value: "demo-hospital" });
  assert.equal(resolveTenant(location("hospitalcloud.com", "", "/demo-hospital/about")).mode, "marketing");
});
test("Vercel deployment resolves dashboard path links without root-domain configuration", () => {
  assert.deepEqual(resolveTenant(location("my-hospital-app.vercel.app", "", "/demo-hospital")), { mode: "hospital", lookupType: "subdomain", value: "demo-hospital" });
});
