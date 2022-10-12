import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of, throwError } from 'rxjs';

export type Link = {
  directory: number;
  url: string;
  text?: string;
  id: number;
};

export type List = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  isGuest: boolean | undefined;
  owned: boolean;
  name?: string;
  codes: { id: number; code: string; expires: Date }[];
  sublists?: number[];
  links: Link[];
};

export type AllLists = null | Record<number | string, List>;

@Injectable()
export class LinkService {
  private lastFetch: number;

  private lastCode: string | undefined;

  public list$ = new BehaviorSubject<AllLists>(null);

  public rootDir: number | undefined;

  public guestDir: number | undefined;

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.list$.next(null);
  }

  extendLifetime(id: number, accessId: number, minutes: number = 60) {
    return this.editAccess(id, accessId, { extend: minutes });
  }

  public getListById(id: number) {
    return this.list$.getValue()?.[id];
  }

  editAccess(
    id: number,
    accessId: number,
    data: { code?: string; extend?: number }
  ) {
    const list = this.getListById(id);

    if (!list || !list.owned) {
      return throwError(() => {
        return new Error(!list ? 'not_found' : 'forbidden');
      });
    }

    const url = `/v1/directory/${list.id}/access/${accessId}`;
    return this.http
      .patch<{ result: boolean; code: string; expiresIn: Date }>(url, data)
      .pipe(
        map((value) => {
          if (!value.result) return false;
          list.codes.map((code) => {
            if (code.id === accessId) {
              code.code = value.code ?? code.code;
              code.expires = value.expiresIn ?? code.expires;
            }
            return code;
          });

          this.list$.next(this.list$.getValue());
          return true;
        })
      );
  }

  private canFetch(code?: string) {
    return !(
      this.lastCode === code &&
      this.lastFetch &&
      this.lastFetch >= Date.now() + 60000
    );
  }

  init() {
    this.http.post<List>(`/v1/init`, {}).subscribe({
      next: (value) => {
        if (value) {
          this.rootDir = value.id;
          value.isGuest = true;
          this.list$.next({ [value.id]: value });
        }
      },
    });
  }

  createDir(dir: number, name: string) {
    return this.http
      .post<{ id: number; name: string }>(`/v1/directory`, {
        name,
        parent: dir,
      })
      .pipe(
        map((value) => {
          const nextList = this.list$.getValue();
          if (!nextList) return false;
          nextList[dir]?.sublists?.push(value.id);
          nextList[value.id] = {
            name: value.name,
            id: value.id,
            editable: true,
            sublists: [],
            codes: [],
            owned: true,
            isGuest: false,
            links: [],
          };
          this.list$.next({ ...nextList });
          return true;
        })
      );
  }

  fetchList(code?: string) {
    if (!this.canFetch(code)) return;
    this.lastCode = code;
    this.http
      .get<{
        user: null | { rootDir: number; data: Record<number, List> };
        guest: null | List;
      }>(`/v1/link/${code ?? ''}`)
      .subscribe({
        next: (value) => {
          this.lastFetch = Date.now();

          let guestDir = undefined;
          let { rootDir, data } = value.user ?? {
            rootDir: undefined,
            data: {},
          };

          if (value.guest && !rootDir) {
            data[value.guest.id] = value.guest;
            rootDir = value.guest.id;
          } else if (value.guest) {
            data[value.guest.id] = value.guest;
            guestDir = value.guest.id;
          }

          this.rootDir = rootDir;
          this.guestDir = guestDir;
          this.list$.next(data);
        },
        error: (error) => {
          if (error.status === 401) this.init();
        },
      });
  }

  addLinks(dirId: number, links: Omit<Link, 'id' | 'directory'>[]) {
    const list = this.getListById(dirId);
    const url = list ? `/v1/directory/${list.id}/link/` : '/v1/link/';
    if (!list) return of(false);
    return this.http
      .post<{ id: number; url: string; directory: number; text?: string }[]>(
        url,
        links
      )
      .pipe(
        map((res) => {
          list.links = [...(list?.links ?? []), ...res];
          this.list$.next({ ...this.list$.getValue() });
          return true;
        })
      );
  }

  deleteLink(dirId: number, id: number) {
    const list = this.getListById(dirId);
    if (!list) return;
    return this.http.delete<number[]>(`/v1/link/${id}`).subscribe((res) => {
      if (!res.includes(id)) return;
      list.links = list.links.filter((l) => l.id !== id);
      this.list$.next({ ...this.list$.getValue() });
    });
  }

  deleteLinks(links: Link[]) {
    return this.http
      .delete<number[]>(`/v1/link/${links.map(({ id }) => id).join(',')}`)
      .subscribe((res) => {
        const linksPerDir: Record<number, Record<number, true>> = {};
        links.forEach(({ id, directory }) => {
          if (!res.includes(id)) return;
          if (!linksPerDir[directory]) linksPerDir[directory] = {};
          linksPerDir[directory][id] = true;
        });
        const list = this.list$.getValue();
        if (!list) return;
        Object.entries(linksPerDir).forEach(([key, value]) => {
          if (!list[key]) return;
          list[key].links = list[key].links.filter(
            (l) => value[l.id] === undefined
          );
        });
        this.list$.next({ ...list });
      });
  }

  moveLinks(links: Link[], dir: number) {
    return this.http
      .patch<number[]>(
        `/v1/link/${links.map(({ id }) => id).join(',')}/directory/${dir}`,
        {}
      )
      .subscribe((res) => {
        const linksPerDir: Record<number, Record<number, true>> = {};
        const linksToMove: Link[] = [];
        links.forEach((l) => {
          if (!res.includes(l.id)) return;
          if (!linksPerDir[l.directory]) linksPerDir[l.directory] = {};
          linksPerDir[l.directory][l.id] = true;
          linksToMove.push({ ...l, directory: dir });
        });
        const list = this.list$.getValue();
        if (!list) return;
        Object.entries(linksPerDir).forEach(([key, value]) => {
          if (!list[key]) return;
          list[key].links = list[key].links.filter(
            (l) => value[l.id] === undefined
          );
        });
        list[dir].links = list[dir].links.concat(linksToMove);
        this.list$.next({ ...list });
      });
  }

  editLinks(directory: number, link: Link) {
    const list = this.getListById(directory);
    if (!list) return of(false);
    return this.http.patch<number>(`/v1/link/${link.id}`, link).pipe(
      map((res) => {
        if (!res) return false;

        list.links = list.links.map((l) => {
          if (link.id != l.id) return l;
          return link;
        });

        this.list$.next(this.list$.getValue());
        return true;
      })
    );
  }

  mergeDirs(src: number, target: number) {
    const url = `/v1/directory/${target}/merge/${src}`;
    return this.http.patch<boolean>(url, {}).pipe();
  }

  removeDir(id: number) {
    return this.http.delete<boolean>(`/v1/directory/${id}`, {}).pipe(
      map((val) => {
        if (val) {
          const list = this.list$.getValue();
          if (!list) return;

          if (this.guestDir === id) {
            this.guestDir = undefined;
          }

          const parent = list[id].parent;
          if (parent && list[parent]) {
            list[parent].sublists = list[parent].sublists?.filter(
              (d) => d !== id
            );
          }
          delete list[id];
          this.list$.next(list);
        }
        return val;
      })
    );
  }
}
