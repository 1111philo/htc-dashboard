import { describe, it, expect } from "vitest";
import * as utils from "./util";

describe("util functions", () => {
  describe("readableDateTime", () => {
    it("should return a formatted date and time", () => {
      const date = "2021-10-01T13:00:00Z";
      const result = utils.readableDateTime(date);
      expect(result).toEqual("10/1/2021, 1:00 PM");
    });
  });

  describe("readableTime", () => {
    it("should return a formatted date and time", () => {
      const date = "2021-10-01T13:00:00Z";
      const result = utils.readableTime(date);
      expect(result).toEqual("1:00 PM");
    });
  });

  describe("isEven", () => {
    it("should consider 0 an even number", () => {
      expect(utils.isEven(0)).toBe(true);
    });
  });

  describe("capitalize", () => {
    it("should capitalize the first letter", () => {
      expect(utils.capitalize("testing")).toEqual("Testing");
      expect(utils.capitalize("")).toEqual("");
    });
  });
});
