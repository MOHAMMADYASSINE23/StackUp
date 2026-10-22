import assert from "node:assert/strict";
import test from "node:test";

import { normalizeDate, normalizeTime } from "../lib/event-normalization";

test("normalizes valid 12-hour times to 24-hour format", () => {
  assert.equal(normalizeTime("7:05 PM"), "19:05");
  assert.equal(normalizeTime("12:30 AM"), "00:30");
  assert.equal(normalizeTime("12:30 PM"), "12:30");
  assert.equal(normalizeTime("1:09 am"), "01:09");
});

test("accepts valid 24-hour times and pads values", () => {
  assert.equal(normalizeTime("7:05"), "07:05");
  assert.equal(normalizeTime("23:59"), "23:59");
  assert.equal(normalizeTime("00:00"), "00:00");
});

test("rejects invalid clock hours and minutes", () => {
  for (const value of ["13:00 PM", "13:00 AM", "0:30 PM", "24:00", "12:60", "9:5", "not a time"]) {
    assert.throws(() => normalizeTime(value), undefined, `expected ${value} to be rejected`);
  }
});

test("normalizes a parseable date to ISO calendar format", () => {
  assert.equal(normalizeDate("2026-10-23"), "2026-10-23");
});

test("rejects unparseable dates", () => {
  assert.throws(() => normalizeDate("not-a-date"), /Invalid date format/);
});
