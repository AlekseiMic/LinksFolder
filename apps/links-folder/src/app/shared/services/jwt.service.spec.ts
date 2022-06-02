import { JwtService } from "./jwt.service";

describe('JwtService', () => {
  it('should parse token and return valid data', () => {
    const token = "";
    const data = JwtService.parse(token);
    expect(data).toBeTruthy();
    expect(data).toContain('id');
  });
  it('should return null on invalid token', () => {
    expect(JwtService.parse("")).toBeNull();
    expect(JwtService.isValid("")).toBeFalse();
  });
  it('should verify token is valid', () => {
    const token = "";
    const tokenWithExp = "";
    expect(JwtService.isValid(token)).toBeTrue();
    expect(JwtService.isValid(tokenWithExp)).toBeTrue();
  });
});
