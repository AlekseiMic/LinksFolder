import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AccessRule, Link, List, SimpleLink, AllLists } from 'app/types';
import { LinksApiService } from '../links-api/links-api.service';

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

  constructor(private readonly api: LinksApiService) {}

  importFile(dir: number, file: File) {
    return this.api.import(file, dir);
  }

  addLinks(dir: number, links: SimpleLink[]) {
    return this.api.addLinks(links, dir).pipe(
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
    return this.api.deleteLinks(links.map((l) => l.id)).pipe(
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
    const ids = links.map((l) => l.id);
    return this.api.moveLinks(ids, dir).pipe(
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
    return this.api.editLink(link).pipe(
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

  clear() {
    this.lastCode = null;
    this.lastFetch = null;
    this.list$.next(null);
    this.guest$.next(null);
    this.root$.next(null);
  }

  extendLifetime(id: number, access: AccessRule, minutes: number = 60) {
    return this.editAccess(id, { ...access, extend: minutes });
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

  addAccessRule(
    dirId: number,
    data: { code?: string; username?: string; expiresIn?: Date }
  ) {
    return this.api.addAccess(data, dirId).pipe(
      map(({ result, code }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[dirId]) throw new Error();

        next[dirId] = {
          ...next[dirId],
          codes: [...next[dirId].codes, code],
        };

        this.list$.next(next);
        return code;
      })
    );
  }

  editAccess(id: number, access: AccessRule) {
    return this.api.editAccess(access, id).pipe(
      map(({ result, code, username, expiresIn, updatedAt }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[id]) throw new Error();

        next[id] = {
          ...next[id],
          codes: next[id].codes.map((c) => {
            if (c.id !== access.id) return c;
            return { ...c, code, username, expiresIn, updatedAt };
          }),
        };

        this.list$.next(next);
        return true;
      })
    );
  }

  deleteAccess(dir: number, access: AccessRule) {
    return this.api.deleteAccess(access.id, dir).pipe(
      map(({ result }) => {
        const next = { ...this.list$.value };
        if (!result || !next?.[dir]) throw new Error();

        next[dir] = {
          ...next[dir],
          codes: next[dir].codes.filter((c) => c.id !== access.id),
        };

        this.list$.next(next);
        return true;
      })
    );
  }

  init() {
    return this.api.initGuest().subscribe({
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

  fetchList(code?: string) {
    if (!this.canFetch(code)) return;
    this.lastCode = code ?? null;
    this.api.fetch(code).subscribe({
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

  createDir(parent: number, name: string) {
    return this.api.createDir(name, parent).pipe(
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

  editDir(id: number, name?: string, parent?: number) {
    return this.api.editDir(id, name, parent).pipe(
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

  mergeDirs(src: number, tgt: number) {
    return this.api.mergeDir(src, tgt).pipe(
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
    return this.api.deleteDir([id]).pipe(
      map((val) => {
        const next = { ...this.list$.value };
        if (!val[id] || !next) throw new Error();
        if (this.guest$.value === id) this.guest$.next(null);

        const parent = next[id].parent;

        if (parent && parent in next) {
          next[parent] = {
            ...next[parent],
            sublists: next[parent].sublists?.filter((d) => d !== id) ?? [],
          };
        }

        delete next[id];
        this.list$.next(next);
        return val[id];
      })
    );
  }

  removeImportedDirs(ids: number[]) {
    return this.api.deleteDir(ids);
  }

  private canFetch(code?: string) {
    return !(
      this.lastCode === code &&
      this.lastFetch &&
      this.lastFetch >= Date.now() + 60000
    );
  }
}
