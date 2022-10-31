import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { GuestToken, ReqUser } from 'utils/decorators/';
import { OptionalJwtAuthGuard } from 'utils/guards/';
import { GeneralService } from 'services';
import { AuthUser } from 'models';
import { Response } from 'express';

const DIR_PREFIX = 'dir';
const LINK_PREFIX = 'link';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: '',
  version: '1',
})
export class GeneralController {
  constructor(private service: GeneralService) {}

  @Post('init')
  async init(
    @Res({ passthrough: true }) res: Response,
    @GuestToken() token?: string,
    @ReqUser() user?: AuthUser
  ) {
    return this.service.init(token, user, res);
  }

  // @Post(`${DIR_PREFIX}/:id/link`)
  // async createLink() {}
  //
  // @Post(`${DIR_PREFIX}/`)
  // async createDir() {}
  //
  // @Patch(`${DIR_PREFIX}/`)
  // async updateDir() {}
  //
  // @Delete(`${DIR_PREFIX}/:dir/access/:id`)
  // async deleteAccess() {}
  //
  // @Post(`${DIR_PREFIX}/:id/access`)
  // async createAccess() {}
  //
  // @Patch(`${DIR_PREFIX}/:id/access/:access`)
  // async updateAccess() {}
  //
  // @Patch(`${DIR_PREFIX}/:id/merge/:dir`)
  // async mergeDirs() {}
  //
  // @Get(`${DIR_PREFIX}/:ids`)
  // async findDirs() {}
  //
  // @Delete(`${DIR_PREFIX}/:ids`)
  // async deleteDir() {}
  //
  // @Get(`${LINK_PREFIX}/:code?`)
  // async findLinks() {}
  //
  // @Patch(`${LINK_PREFIX}/:id`)
  // async updateLink() {}
  //
  // @Patch(`${LINK_PREFIX}/:ids/directoryId/:dir`)
  // async moveLinks() {}
  //
  // @Delete(`${LINK_PREFIX}/:ids`)
  // async deleteLinks() {}
}
