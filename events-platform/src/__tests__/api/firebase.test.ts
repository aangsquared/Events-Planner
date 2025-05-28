import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";

// Mock service account data
const mockServiceAccount: ServiceAccount = {
  projectId: "test-project",
  privateKey: "test-private-key",
  clientEmail: "test@test-project.iam.gserviceaccount.com"
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  }
}));

describe("Firebase Admin Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize Firebase Admin SDK with credentials", () => {
    admin.initializeApp({
      credential: admin.credential.cert(mockServiceAccount),
    });

    expect(admin.credential.cert).toHaveBeenCalledWith(mockServiceAccount);
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: expect.any(Object)
    });
  });
});