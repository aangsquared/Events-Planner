import { GET } from "@/app/api/hello/route";
import { NextResponse } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: async () => data,
    })),
  },
}));

describe("GET /api/hello", () => {
  it("should return a JSON response with a message", async () => {
    const request = {
      url: "http://localhost:3000/api/hello",
    } as any; // Mocked NextRequest

    const response = await GET(request);
    const data = await response.json();
    console.log(data); // Log the response data for debugging

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: "Hello, world!" });
  });
});