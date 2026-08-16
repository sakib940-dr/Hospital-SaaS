import test from "node:test";
import assert from "node:assert/strict";
import { resolveTenant } from "./resolveTenant.js";

const location = (hostname, search = "") => ({ hostname, search });
test("localhost supports hospital query override", () => assert.deepEqual(resolveTenant(location("localhost", "?hospital=demo")), { mode: "hospital", lookupType: "subdomain", value: "demo" }));
test("root and admin hostnames resolve platform modes", () => {
  assert.equal(resolveTenant(location("hospitalcloud.com")).mode, "marketing");
  assert.equal(resolveTenant(location("admin.hospitalcloud.com")).mode, "super-admin");
});
test("tenant subdomain and custom domain resolve correctly", () => {
  assert.deepEqual(resolveTenant(location("eye.hospitalcloud.com")), { mode: "hospital", lookupType: "subdomain", value: "eye" });
  assert.deepEqual(resolveTenant(location("care.example.org")), { mode: "hospital", lookupType: "custom_domain", value: "care.example.org" });
});
