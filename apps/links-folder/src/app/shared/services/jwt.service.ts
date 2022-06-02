import { Injectable } from "@angular/core";

Injectable();
export class JwtService {
  static parse(token: string): null | Record<string, any> {
    return null;
  }

  static isValid(token: string): boolean {
    return false;
  }
}
