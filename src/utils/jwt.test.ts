import { decodeToken, isTokenExpired } from "./jwt";

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createToken(payload: Record<string, unknown>) {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));

  return `${header}.${body}.signature`;
}

describe("jwt utils", () => {
  it("decodes a valid token payload", () => {
    const token = createToken({
      sub: "user-1",
      email: "user@example.com",
      exp: 1_900_000_000,
    });

    expect(decodeToken(token)).toEqual({
      sub: "user-1",
      email: "user@example.com",
      exp: 1_900_000_000,
    });
  });

  it("returns null for an invalid token", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(decodeToken("invalid-token")).toBeNull();

    errorSpy.mockRestore();
  });

  it("treats expired tokens as expired", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_700_000_000 * 1000);
    const token = createToken({ exp: 1_699_999_999 });

    expect(isTokenExpired(token)).toBe(true);

    nowSpy.mockRestore();
  });

  it("treats future tokens as active", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_700_000_000 * 1000);
    const token = createToken({ exp: 1_700_000_100 });

    expect(isTokenExpired(token)).toBe(false);

    nowSpy.mockRestore();
  });

  it("treats tokens without exp as expired", () => {
    expect(isTokenExpired(createToken({ sub: "user-1" }))).toBe(true);
  });
});

