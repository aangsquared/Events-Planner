import "@testing-library/jest-dom"
import "whatwg-fetch"
import dotenv from "dotenv"

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" })
jest.mock("next/router", () => ({
  useRouter: () => ({ route: "/", push: jest.fn() }),
}))
