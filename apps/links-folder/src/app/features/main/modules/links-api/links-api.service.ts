import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccessRule,
  Link,
  List,
  SimpleAccessRule,
  SimpleLink,
} from 'app/types';

const DIR_URL = '/v1/directory';
const LINK_URL = '/v1/link';

@Injectable()
export class LinksApiService {
  constructor(private readonly http: HttpClient) {}

  // -- START -- LINK METHODS

  import(file: File, dir: number) {
    const form = new FormData();
    form.append('file[]', file);

    return this.http.post<{
      errors: Record<number, string>;
      ids: number[];
      lists: Record<number, List>;
    }>(`${DIR_URL}/${dir}/link`, form, {});
  }

  addLinks(links: SimpleLink[], dir: number) {
    const url = dir ? `${DIR_URL}/${dir}/link/` : '${LINK_URL}/';
    return this.http.post<Link[]>(url, links);
  }

  moveLinks(links: number[], dir: number) {
    const url = `${LINK_URL}/${links.join(',')}/directory/${dir}`;
    return this.http.patch<number[]>(url, {});
  }

  deleteLinks(links: number[]) {
    return this.http.delete<{ result: false | number[] }>(
      `${LINK_URL}/${links.join(',')}`
    );
  }

  editLink(link: Link) {
    return this.http.patch<number>(`${LINK_URL}/${link.id}`, link);
  }

  // -- END -- LINK METHODS

  /** -- START -- DIR METHODS */
  createDir(name: string, parent: number) {
    const data = { parent, name };
    return this.http.post<{ id: number; name: string }>(`${DIR_URL}`, data);
  }

  editDir(id: number, name?: string, parent?: number) {
    return this.http.patch(`${DIR_URL}/${id}`, { name, parent });
  }

  mergeDir(src: number, dest: number) {
    const url = `${DIR_URL}/${dest}/merge/${src}`;
    return this.http.patch<boolean>(url, {});
  }

  deleteDir(id: number[]) {
    return this.http.delete<Record<number, boolean>>(
      `${DIR_URL}/${id.join(',')}`,
      {}
    );
  }
  /** -- END -- DIR METHODS */

  /** -- START -- ACCESS METHODS */
  addAccess(access: SimpleAccessRule, dir: number) {
    const url = `${DIR_URL}/${dir}/access/`;
    return this.http.post<{ result: boolean; code: AccessRule }>(url, access);
  }

  editAccess(access: AccessRule, dir: number) {
    const url = `${DIR_URL}/${dir}/access/${access.id}`;
    return this.http.patch<{ result: boolean } & AccessRule>(url, access);
  }

  deleteAccess(id: number, dir: number) {
    const url = `${DIR_URL}/${dir}/access/${id}`;
    return this.http.delete<{ result: boolean }>(url);
  }
  /** -- END -- ACCESS METHODS */

  fetch(code?: string) {
    return this.http.get<{
      user: null | { rootDir: number; data: Record<number, List> };
      guest: null | List;
    }>(`${LINK_URL}/${code ?? ''}`);
  }

  initGuest() {
    return this.http.post<List>(`/v1/init`, {});
  }
}
