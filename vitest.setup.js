import { expect, afterAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.clearAllMocks();
});
