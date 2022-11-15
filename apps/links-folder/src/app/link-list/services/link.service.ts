import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, of, tap, throwError } from 'rxjs';
import { Code, Link, List, SimpleLink } from '../types';

export type AllLists = null | Record<number | string, List>;

@Injectable()
export class LinkService {
  private lastFetch: number | null = null;

  private lastCode: string | null = null;

  public list$ = new BehaviorSubject<AllLists>(null);

  public root$ = new BehaviorSubject<number | null>(null);

  public guest$ = new BehaviorSubject<number | null>(null);

  public guestDir$ = combineLatest([this.list$, this.guest$]).pipe(
    map(([list, guest]) => {
      if (!guest || !list) return null;
      return list[guest];
    })
  );

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.lastCode = null;
    this.lastFetch = null;
    this.list$.next(null);
    this.guest$.next(null);
    this.root$.next(null);
  }

  extendLifetime(id: number, accessId: number, minutes: number = 60) {
    return this.editAccess(id, accessId, { extend: minutes });
  }

  public getListById(id: number): List;
  public getListById(id: number, optional = false) {
    const list = this.list$.getValue()?.[id];
    if (!list && optional) return undefined;
    if (!list || !list.owned) {
      throw new Error(!list ? 'not_found' : 'forbidden');
    }
    return list;
  }

  importFile(dir: number, file: File) {
    const form = new FormData();
    form.append('file[]', file);
    return this.http.post<{
      errors: Record<number, string>;
      ids: number[];
      lists: Record<number, List>;
    }>(`/v1/directory/${dir}/link`, form, {});
  }

  editDir(id: number, name?: string, parent?: number) {
    return this.http.patch(`/v1/directory/${id}`, { name, parent }).pipe(
      map((res) => {
        const list = { ...this.list$.getValue() };
        if (!res || !list[id]) return;
        if (name) list[id].name = name;
        if (parent) {
          const oldParent = list[id].parent;
          if (oldParent && list[oldParent]) {
            list[oldParent].sublists = list[oldParent].sublists?.filter(
              (child) => child !== id
            );
          }
          list[id].parent = parent;
          list[parent].sublists?.push(id);
        }
        this.list$.next(list);
      })
    );
  }

  addImportedLists(dir: number, ids: number[], lists: Record<string, List>) {
    const newLists = { ...this.list$.getValue(), ...lists };
    if (!newLists || !newLists[dir]) return;
    newLists[dir].sublists?.push(...ids);
    this.list$.next(newLists);
  }

  deleteAccess(dir: number, id: number) {
    const url = `/v1/directory/${dir}/access/${id}`;
    return this.http.delete<{ result: boolean }>(url).pipe(
      map((result) => {
        if (!result.result) return false;
        const list = this.list$.getValue();
        if (!list?.[dir]) return false;
        list[dir].codes = list[dir].codes.filter((c) => c.id !== id);
        this.list$.next({ ...list });
        return true;
      })
    );
  }

  addAccessRule(
    dir: number,
    data: { code?: string; username?: string; expiresIn?: Date }
  ) {
    const url = `/v1/directory/${dir}/access/`;
    return this.http.post<{ result: boolean; code: Code }>(url, data).pipe(
      map((value) => {
        if (!value.result) return false;
        const list = this.list$.getValue();
        const directory = list?.[dir];
        if (!directory) return false;
        directory.codes.push(value.code);
        this.list$.next({ ...list });
        return value.code;
      })
    );
  }

  editAccess(
    id: number,
    accessId: number,
    data: {
      code?: string;
      expiresIn?: Date;
      username?: string | null;
      extend?: number;
    }
  ) {
    const list = this.getListById(id);

    const url = `/v1/directory/${list.id}/access/${accessId}`;
    return this.http.patch<{ result: boolean } & Code>(url, data).pipe(
      map((value) => {
        if (!value.result) return false;
        list.codes.map((code) => {
          if (code.id === accessId) {
            code.code = value.code;
            code.username = value.username;
            code.expiresIn = value.expiresIn;
            code.updatedAt = value.updatedAt;
          }
          return code;
        });

        this.list$.next({ ...this.list$.getValue() });
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
          this.guest$.next(value.id);
          this.list$.next({ [value.id]: value });
        }
      },
    });
  }

  createDir(parent: number, name: string) {
    return this.http
      .post<{ id: number; name: string }>(`/v1/directory`, {
        name,
        parent,
      })
      .pipe(
        map((value) => {
          const nextList = this.list$.getValue();
          if (!nextList) return false;
          nextList[parent]?.sublists?.push(value.id);
          nextList[value.id] = {
            name: value.name,
            id: value.id,
            parent,
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
    this.lastCode = code ?? null;
    this.http
      .get<{
        user: null | { rootDir: number; data: Record<number, List> };
        guest: null | List;
      }>(`/v1/link/${code ?? ''}`)
      .subscribe({
        next: ({ guest, user }) => {
          this.lastFetch = Date.now();
          const data = user?.data ?? {};
          if (guest) data[guest.id] = guest;
          this.root$.next(user?.rootDir ?? null);
          this.guest$.next(guest?.id ?? null);
          this.list$.next(data);
        },
        error: (error) => {
          if (error.status === 401) this.init();
        },
      });
  }

  addLinks(dirId: number, links: SimpleLink[]) {
    const list = this.getListById(dirId);
    const url = list ? `/v1/directory/${list.id}/link/` : '/v1/link/';
    if (!list) return of(false);
    return this.http.post<Link[]>(url, links).subscribe((res) => {
      list.links = [...(list?.links ?? []), ...res];
      this.list$.next({ ...this.list$.getValue() });
      return true;
    });
  }

  deleteLinks(links: Link[]) {
    return this.http
      .delete<{ result: false | number[] }>(
        `/v1/link/${links.map(({ id }) => id).join(',')}`
      )
      .pipe(
        map(({ result }) => {
          const lists = this.list$.getValue();
          if (!result || !lists) return 0;

          const removedPerDir = links.reduce(
            (acc: Record<number, Record<number, true>>, { id, directory }) => {
              if (!result.includes(id)) return acc;
              if (!acc[directory]) acc[directory] = {};
              acc[directory][id] = true;
              return acc;
            },
            {}
          );

          Object.entries(removedPerDir).forEach(([key, value]) => {
            if (!lists[key]) return;
            lists[key].links = lists[key].links.filter((l) => !value[l.id]);
          });

          this.list$.next({ ...lists });
          return result.length;
        })
      );
  }

  moveLinks(links: Link[], dir: number) {
    return this.http
      .patch<number[]>(
        `/v1/link/${links.map(({ id }) => id).join(',')}/directory/${dir}`,
        {}
      )
      .pipe(
        map((res) => {
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
        })
      );
  }

  editLinks(directory: number, link: Link) {
    const list = this.getListById(directory);
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

  mergeDirs(src: number, tgt: number) {
    const url = `/v1/directory/${tgt}/merge/${src}`;
    return this.http.patch<boolean>(url, {}).pipe(
      map((r) => {
        const lists = this.list$.value;
        if (!r || !lists) return false;
        if (this.guest$.value === src) this.guest$.next(null);
        const source = lists[src];
        const target = lists[tgt];
        if (!source || !target) return false;
        lists[src] = { ...source, parent: tgt, isGuest: false };
        lists[tgt] = { ...target, sublists: [...(target.sublists ?? []), src] };
        this.list$.next({ ...lists });
        return true;
      })
    );
  }

  removeDir(id: number) {
    return this.http
      .delete<Record<number, boolean>>(`/v1/directory/${id}`, {})
      .pipe(
        map((val) => {
          if (val[id]) {
            const lists = this.list$.getValue();
            if (!lists) return;

            if (this.guest$.value === id) {
              this.guest$.next(null);
            }

            const parent = lists[id].parent;
            console.log(lists, id, parent);
            if (parent && lists[parent]) {
              lists[parent].sublists = lists[parent].sublists?.filter(
                (d) => d !== id
              );
            }
            delete lists[id];
            this.list$.next({ ...lists });
          }
          return val[id];
        })
      );
  }

  removeImportedDirs(ids: number[]) {
    return this.http.delete<Record<number, boolean>>(
      `/v1/directory/${ids.join(',')}`,
      {}
    );
  }
}
