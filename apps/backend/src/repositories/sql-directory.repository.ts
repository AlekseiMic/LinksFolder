import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { Directory, DirectoryAccess } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { IDirectoryRepository } from './interfaces/i-directory.repository';
import { Op } from 'sequelize';

export class SqlDirectoryRepository
  extends SqlRepository<Directory>
  implements IDirectoryRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, Directory);
  }

  async getAvaliable(
    userId: number
  ): Promise<{ root: Directory | null; received: Directory[] }> {
    const rootDirPromise = this.findOne({
      where: { createdBy: userId },
      order: [['lft', 'asc']],
    });

    const receivedPromise = this.findAll({
      include: [
        {
          model: DirectoryAccess,
          where: { userId: userId, expiresIn: { [Op.gte]: Date.now() } },
          required: true,
          attributes: [],
        },
      ],
    });
    const [root, received] = await Promise.all([
      rootDirPromise,
      receivedPromise,
    ]);

    if (root) received.unshift(root);
    return { root, received };
  }
}
