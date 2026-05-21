import { describe, expect, it, vi } from "vitest";
import { Mem0ApiError } from "@earendil-works/pi-mem0";

describe("Mem0 types", () => {
	it("should export Mem0ApiError", () => {
		expect(Mem0ApiError).toBeDefined();
		const error = new Mem0ApiError(404, "Not found", { detail: "Resource not found" });
		expect(error.status).toBe(404);
		expect(error.message).toBe("Not found");
		expect(error.response).toEqual({ detail: "Resource not found" });
	});
});
