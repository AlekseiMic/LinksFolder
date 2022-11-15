import { Injectable } from '@angular/core';
import { JwtPayload } from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';

type JwtData = {
  id: number;
  name: string;
} & JwtPayload;

Injectable();
export class JwtService {
  parse(token?: string): { data?: JwtData; isValid: boolean } {
    if (!token) return { isValid: false };
    try {
      const data = jwt_decode<JwtData>(token);
      const isValid =
        data.exp === undefined ? true : data.exp > new Date().getTime() / 1000;
      return { data, isValid };
    } catch (error: any) {}
    return { isValid: false };
  }
}
