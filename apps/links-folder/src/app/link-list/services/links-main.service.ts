import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Code, Link, List, SimpleLink, AllLists } from '../../types';

const DIR_URL = '/v1/directory';
const LINK_URL = '/v1/link';

@Injectable()
export class LinksMainService {
  private lastFetch: number | null = null;

  private lastCode: string | null = null;

  public list$ = new BehaviorSubject<AllLists>(null);

  public root$ = new BehaviorSubject<number | null>(null);

  public guest$ = new BehaviorSubject<number | null>(null);

  public guestDir$ = combineLatest([this.list$, this.guest$]).pipe(
    map(([list, guest]) => (!guest || !list ? null : list[guest]))
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

  importFile(dir: number, file: File) {
    const form = new FormData();
    form.append('file[]', file);
    return this.http.post<{
      errors: Record<number, string>;
      ids: number[];
      lists: Record<number, List>;
    }>(`${DIR_URL}/${dir}/link`, form, {});
  }

  editDir(id: number, name?: string, parent?: number) {
    return this.http.patch(`${DIR_URL}/${id}`, { name, parent }).pipe(
      map((res) => {
        const next = { ...this.list$.value };
        if (!res || !next[id]) throw new Error();
        next[id] = { ...next[id] };

        if (name) next[id].name = name;
        if (parent) {
          const oldParent = next[id].parent;
          if (oldParent && next[oldParent]) {
            next[oldParent] = {
              ...next[oldParent],
              sublists: next[oldParent].sublists?.filter((c) => c !== id),
            };
          }

          next[id].parent = parent;
          next[parent] = {
            ...next[parent],
            sublists: next[parent].sublists?.concat(id) ?? [id],
          };
        }

        this.list$.next(next);
      })
    );
  }

  addImportedLists(dir: number, ids: number[], lists: Record<string, List>) {
    const next = { ...this.list$.value, ...lists };
    if (!next || !next[dir]) throw new Error();

    next[dir] = {
      ...next[dir],
      sublists: next[dir].sublists?.concat(ids) ?? ids,
    };

    this.list$.next(next);
  }

  deleteAccess(dir: number, id: number) {
    const url = `${DIR_URL}/${dir}/access/${id}`;
    return this.http.delete<{ result: boolean }>(url).pipe(
      map(({ result }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[dir]) throw new Error();

        next[dir] = {
          ...next[dir],
          codes: next[dir].codes.filter((c) => c.id !== id),
        };

        this.list$.next(next);
        return true;
      })
    );
  }

  addAccessRule(
    dirId: number,
    data: { code?: string; username?: string; expiresIn?: Date }
  ) {
    const url = `${DIR_URL}/${dirId}/access/`;
    return this.http.post<{ result: boolean; code: Code }>(url, data).pipe(
      map(({ result, code }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[dirId]) throw new Error();

        next[dirId] = {
          ...next[dirId],
          codes: [...next[dirId].codes, code],
        };

        this.list$.next(next);
        return true;
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
    const url = `${DIR_URL}/${id}/access/${accessId}`;
    return this.http.patch<{ result: boolean } & Code>(url, data).pipe(
      map(({ result, code, username, expiresIn, updatedAt }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[id]) throw new Error();

        next[id] = {
          ...next[id],
          codes: next[id].codes.map((c) => {
            if (c.id !== accessId) return c;
            return { ...c, code, username, expiresIn, updatedAt };
          }),
        };

        this.list$.next(next);
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
      error: () => {
        console.error('all broken');
      },
    });
  }

  createDir(parent: number, name: string) {
    const data = { parent, name };
    return this.http
      .post<{ id: number; name: string }>(`${DIR_URL}`, data)
      .pipe(
        map((value) => {
          const next = { ...this.list$.value };
          if (!next?.[parent]) throw new Error();

          next[parent] = {
            ...next[parent],
            sublists: [...(next[parent].sublists ?? []), value.id],
          };
          next[value.id] = {
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

          this.list$.next(next);
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
      }>(`${LINK_URL}/${code ?? ''}`)
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

  addLinks(dir: number, links: SimpleLink[]) {
    const url = dir ? `${DIR_URL}/${dir}/link/` : '${LINK_URL}/';

    return this.http.post<Link[]>(url, links).pipe(
      map((res) => {
        const next = { ...this.list$.value };
        if (!res || !next?.[dir]) throw new Error();

        next[dir] = {
          ...next[dir],
          links: [...(next[dir]?.links ?? []), ...res],
        };

        this.list$.next(next);
        return true;
      })
    );
  }

  deleteLinks(links: Link[]) {
    return this.http
      .delete<{ result: false | number[] }>(
        `${LINK_URL}/${links.map(({ id }) => id).join(',')}`
      )
      .pipe(
        map(({ result }) => {
          const next = this.list$.value;
          if (!result || !next) throw new Error();

          const linksPerDir = links.reduce(
            (acc: Record<number, Record<number, true>>, { id, directory }) => {
              if (!result.includes(id)) return acc;
              if (!acc[directory]) acc[directory] = {};
              acc[directory][id] = true;
              return acc;
            },
            {}
          );

          Object.entries(linksPerDir).forEach(([key, value]) => {
            if (!next[key]) return;
            next[key] = {
              ...next[key],
              links: next[key].links.filter((l) => !value[l.id]),
            };
          });

          this.list$.next(next);
          return result.length;
        })
      );
  }

  moveLinks(links: Link[], dir: number) {
    const linkIds = links.map(({ id }) => id).join(',');
    const url = `${LINK_URL}/${linkIds}/directory/${dir}`;
    return this.http.patch<number[]>(url, {}).pipe(
      map((res) => {
        const linksPerDir: Record<number, Record<number, true>> = {};
        const linksToMove: Link[] = [];

        links.forEach((l) => {
          if (!res.includes(l.id)) return;
          if (!linksPerDir[l.directory]) linksPerDir[l.directory] = {};
          linksPerDir[l.directory][l.id] = true;
          linksToMove.push({ ...l, directory: dir });
        });

        const next = { ...this.list$.value };
        if (!next) throw new Error();

        Object.entries(linksPerDir).forEach(([key, value]) => {
          if (!next[key]) return;
          next[key] = {
            ...next[key],
            links: next[key].links.filter((l) => !value[l.id]),
          };
        });

        next[dir] = {
          ...next[dir],
          links: next[dir].links.concat(linksToMove),
        };

        this.list$.next(next);
      })
    );
  }

  editLink(dir: number, link: Link) {
    return this.http.patch<number>(`${LINK_URL}/${link.id}`, link).pipe(
      map((res) => {
        const next = this.list$.value;
        if (!res || !next?.[dir]) throw new Error();

        this.list$.next({
          ...next,
          [dir]: {
            ...next[dir],
            links: next[dir].links.map((l) => (l.id != link.id ? l : link)),
          },
        });
        return true;
      })
    );
  }

  mergeDirs(src: number, tgt: number) {
    const url = `${DIR_URL}/${tgt}/merge/${src}`;
    return this.http.patch<boolean>(url, {}).pipe(
      map((result) => {
        const next = this.list$.value;
        if (!result || !next?.[src] || !next?.[tgt]) throw new Error();

        if (this.guest$.value === src) this.guest$.next(null);

        this.list$.next({
          ...next,
          [src]: { ...next[src], parent: tgt, isGuest: false },
          [tgt]: {
            ...next[tgt],
            sublists: [...(next[tgt].sublists ?? []), src],
          },
        });

        return true;
      })
    );
  }

  removeDir(id: number) {
    return this.http
      .delete<Record<number, boolean>>(`${DIR_URL}/${id}`, {})
      .pipe(
        map((val) => {
          const next = { ...this.list$.value };
          if (!val[id] || !next) throw new Error();
          if (this.guest$.value === id) this.guest$.next(null);

          delete next[id];

          const parent = next[id].parent;
          if (parent && parent in next) {
            next[parent] = {
              ...next[parent],
              sublists: next[parent].sublists?.filter((d) => d !== id) ?? [],
            };
          }

          this.list$.next(next);
          return val[id];
        })
      );
  }

  removeImportedDirs(ids: number[]) {
    return this.http.delete<Record<number, boolean>>(
      `${DIR_URL}/${ids.join(',')}`,
      {}
    );
  }
}
