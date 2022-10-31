import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'models';
import { LinkService } from '../services/link.service';
import { DirectoryService } from '../services/directory.service';
import { GuestService } from '../services/guest.service';

@Injectable()
export class GeneralService {
  constructor(
    private readonly dirService: DirectoryService,
    private readonly linkService: LinkService,
    private readonly guestService: GuestService
  ) {}

  async init(
    token: string | undefined,
    user: AuthUser | undefined,
    res: Response
  ) {
    if (token) return false;
    if (user) return false;
    const { directory, access } = await this.dirService.createGuestDir();
    this.guestService.setCookie(res.cookie.bind(res), access.token);
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
