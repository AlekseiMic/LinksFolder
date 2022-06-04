import { JwtService } from './jwt.service';

const validToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiVGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.pIf0j83e4ZlNjTiKpWxSGHD-6CAYyZHTbbE03w6wFd8';
const invalidToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzAwMDB9.7Pc53YlGdd2L1qXIla_qCmTovzvJn5cVj8shbJCB1nk';

describe('JwtService', () => {
  it('should parse token and return valid data', () => {
    const data = JwtService.parse(validToken);
    expect(data).toBeTruthy();
    expect(data).toEqual(
      jasmine.objectContaining({
        sub: '123',
      })
    );
  });

  it('should return null on invalid token', () => {
    expect(JwtService.parse('')).toBeNull();
  });

  it('should throw "Token expired" error', () => {
    expect(function () {
      JwtService.parse(invalidToken);
    }).toThrow(new Error('Token expired'));
  });
});
