import admin from "firebase-admin";

describe("Firebase Admin Initialization", () => {
  it("should initialize Firebase Admin SDK with the service account file", () => {
    expect(process.env.GOOGLE_APPLICATION_CREDENTIALS).toBeDefined();
    expect(() => {
      admin.initializeApp({
        credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS!)),
      });
    }).not.toThrow();
  });
});