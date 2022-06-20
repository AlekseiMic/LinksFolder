import { TestBed } from '@angular/core/testing';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { JwtService } from './jwt.service';

const validToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInN1YiI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.C7qzVTsWefMSKJAhUjpgPAMa-md4p00phsRpzkXiDv8';
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, JwtService],
    });
    await TestBed.compileComponents();
    service = TestBed.inject(AuthService);
    service.user = null;
    httpMock = TestBed.inject(HttpTestingController);
  });
  it('should login and set user variable', async () => {
    expect(service.user).toBeNull();
    const request = service.login('existingusername', 'qwerty123');
    const req = httpMock.expectOne('/auth/signin');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({ token: validToken });
    await request;
    expect(service.isLogged()).toBeTrue();
    expect(service.bearer).toEqual(`Bearer ${validToken}`);
    expect(service.user).toBeInstanceOf(User);
    expect(service.user!.id).toEqual(12);
  });
  it('should not login', async () => {
    expect(service.user).toBeNull();
    const request = service.login('newUser', 'password0');
    const req = httpMock.expectOne('/auth/signin');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({});
    expect(await request).toBeFalse();
    expect(service.user).toBeNull();
  });
  it('should register', async () => {
    expect(service.user).toBeNull();
    const request = service.signup('newUser', 'password0');
    const req = httpMock.expectOne('/auth/signup');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({ token: validToken });
    expect(await request).toBeTrue();
    expect(service.user).toBeInstanceOf(User);
    expect(service.isLogged()).toBeTrue();
  });
  it('should not register', async () => {
    const request = service.signup('newUser', 'password0');
    const req = httpMock.expectOne('/auth/signup');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({});
    expect(await request).toBeFalse();
    expect(service.user).toBeNull();
  });
  it('should logout', async () => {
    service.user = new User(10);
    expect(service.user).toBeInstanceOf(User);
    const request = service.logout();
    const req = httpMock.expectOne('/auth/logout');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush(true);
    expect(await request).toBeTrue();
    expect(service.user).toBeNull();
    expect(service.isLogged()).toBeFalse();
  });
  it('should logout guest', async () => {
    expect(service.isLogged()).toBeFalse();
    expect(service.user).toBeNull();
    const request = service.logout();
    const req = httpMock.expectOne('/auth/logout');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush(true);
    expect(await request).toBeTrue();
    expect(service.user).toBeNull();
    expect(service.isLogged()).toBeFalse();
  });
  it('should refresh accessToken', async () => {
    const request = service.refreshToken().then((res) => {
      expect(res).toBeTrue();
    });
    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({ token: validToken });
    await request;
    expect(service.isLogged()).toBeTrue();
    expect(service.bearer).toEqual(`Bearer ${validToken}`);
    expect(service.user).toBeInstanceOf(User);
    expect(service.user!.id).toEqual(12);
  });
  it('should not refresh accessToken without refreshToken', async () => {
    const request = service.refreshToken().then((res) => {
      expect(res).toBeFalse();
    });
    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.method).toEqual('POST');
    httpMock.verify();
    req.flush({});
    await request;
    expect(service.isLogged()).toBeFalse();
  });
});
