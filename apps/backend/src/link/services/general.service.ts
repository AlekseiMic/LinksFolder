import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'user/user.model';
import { DirectoryService } from './directory.service';
import { GuestService } from './guest.service';
import { LinkService } from './link.service';

@Injectable()
export class GeneralService {
  constructor(
    private dirService: DirectoryService,
    private linkService: LinkService,
    private guestService: GuestService
  ) {}

  async init(
    token: string | undefined,
    user: AuthUser | undefined,
    res: Response
  ) {
    if (token) return false;
    if (user) return false;
    const { directory, access } = await this.dirService.createGuestDir();
    this.guestService.setCookie(res.cookie.bind(res), access.authToken);
    return {
      id: directory.id,
      codes: [{ id: access.id, code: access.code, expires: access.expiresIn }],
      editable: true,
      owned: true,
      isGuest: true,
      name: directory.name,
      links: [],
    };
  }
}
