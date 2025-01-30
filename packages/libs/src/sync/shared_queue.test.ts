import { it, describe, beforeEach, expect } from "vitest";

import { SharedQueue } from "./shared-queue.js";

let buffer;
let w: SharedQueue;
let r: SharedQueue;

describe("SharedQueue Tests", () => {
  beforeEach(() => {
    buffer = new ArrayBuffer(32);
    w = new SharedQueue(buffer);
    r = new SharedQueue(buffer);
  });

  it("Should store small buffer", () => {
    const arr = new Uint8Array([1, 2, 3, 4, 5, 6]);
    w.pushBytes(arr);
    w.commit();
    for (const item of r.read()) {
      expect(item.bytes).toEqual(arr);
    }
    expect(w.lastIndex).toBe(4);
    expect(w.index).toBe(4);
    expect(r.lastIndex).toBe(4);
    expect(r.index).toBe(4);
  });

  it("Should handle overlapping", () => {
    const padding = new Uint8Array(12);
    w.pushBytes(padding);
    w.commit();
    r.pop((item) => expect(item.bytes).toEqual(padding));
    const arr = new Uint8Array([1, 2, 3, 4, 5, 6]);
    w.pushBytes(arr);
    w.commit();
    for (const item of r.read()) {
      expect(item.bytes).toEqual(arr);
    }
    expect(w.lastIndex).toBe(1);
    expect(w.index).toBe(1);
    expect(r.lastIndex).toBe(1);
    expect(r.index).toBe(1);
  });

  it("Should handle multiple buffers", () => {
    const a = new Uint8Array([1, 2, 3, 4, 5, 6]);
    w.pushBytes(a);
    const b = new Uint8Array([7, 8, 9]);
    w.pushBytes(b);
    w.commit();
    const gen = r.read();
    expect(gen.next().value.bytes).toEqual(a);
    expect(gen.next().value.bytes).toEqual(b);
  });

  it("Should work with empty byte arrays", () => {
    const empty = new Uint8Array()
    w.pushBytes(empty)
    w.commit()
    for (const item of r.read()) {
      expect(item.bytes).toEqual(empty)
    }
    w.pushBytes(empty)
    w.commit()
    for (const item of r.read()) {
      expect(item.bytes).toEqual(empty)
    }
  })
});
