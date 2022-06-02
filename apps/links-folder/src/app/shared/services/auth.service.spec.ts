import { User } from "../models/user.model";
import { AuthService } from "./auth.service";

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    service = new AuthService();
    service.user = null;
  });
  it('should login and set user variable', () => {
    expect(service.user).toBeNull();
    expect(service.login('existingusername', 'qwerty123')).toBeTrue();
    expect(service.user).toBeInstanceOf(User);
    expect(service.isLogged()).toBeTrue();
  });
  it('should not login', () => {
    expect(service.user).toBeNull();
    expect(service.login('newUser', 'password0')).toBeFalse();
    expect(service.user).toBeNull();
    service.login('existingusername', 'qwerty123');
    expect(service.login('existingusername', 'qwerty123')).toBeFalse();
  });
  it('should register', () => {
    expect(service.user).toBeNull();
    expect(service.signup('newUser', 'password0')).toBeTrue();
    expect(service.user).toBeInstanceOf(User);
    expect(service.isLogged()).toBeTrue();
  });
  it('should not register', () => {
    expect(service.signup('','')).toBeFalse();
    expect(service.signup('existingusername', 'qwerty123')).toBeFalse();
  });
  it('should logout', () => {
    service.login('existingusername', 'qwerty123');
    expect(service.user).toBeInstanceOf(User);
    expect(service.logout()).toBeTrue();
    expect(service.user).toBeNull();
    expect(service.isLogged()).toBeFalse();
  });
  it('should logout guest', () => {
    expect(service.isLogged()).toBeFalse();
    expect(service.user).toBeNull();
    expect(service.logout()).toBeTrue();
    expect(service.user).toBeNull();
    expect(service.isLogged()).toBeFalse();
  });
  it('should refresh accessToken', () => {
    service.login('existingusername', 'qwerty123');
    expect(service.refreshAccessToken()).toBeTrue();
    expect(service.isLogged()).toBeTrue();
  });
  it('should not refresh accessToken without refreshToken', () => {
    expect(service.refreshAccessToken()).toBeFalse();
    expect(service.isLogged()).toBeFalse();
  });
  it('should refresh refreshToken', () => {
    expect(service.refreshRefreshToken()).toBeTrue();
  });
  it('should not refresh refreshToken', () => {
    expect(service.refreshRefreshToken()).toBeFalse();
  });
});
