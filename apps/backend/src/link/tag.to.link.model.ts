import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Link } from "./link.model";
import { Tag } from "./tag.model";

@Table
export class TagToLink extends Model {
  @PrimaryKey
  @ForeignKey(() => Link)
  @Column
  linkId: number;

  @PrimaryKey
  @ForeignKey(() => Tag)
  @Column
  tagId: number;
}
