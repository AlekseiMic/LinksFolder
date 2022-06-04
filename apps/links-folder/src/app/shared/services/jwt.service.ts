import { Injectable } from '@angular/core';
import jwt_decode, { JwtPayload } from 'jwt-decode';

Injectable();
export class JwtService {
  static parse(token: string): null | Record<string, any> {
    let result: JwtPayload;
    try {
      result = jwt_decode<JwtPayload>(token);
    } catch {
      return null;
    }
    if (result.exp && result.exp < new Date().getTime() / 1000) {
      throw new Error('Token expired');
    }
    return result;
  }
}
