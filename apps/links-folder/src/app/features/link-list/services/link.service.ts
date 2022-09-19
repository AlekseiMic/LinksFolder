import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of, throwError } from 'rxjs';

export type Link = { url: string; text?: string; id: number };

type AddLinkResult = {
  result: Link;
  code: string;
};

export type List = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  owned: boolean;
  name?: string;
  codes: { id: number; code: string; expires: Date }[];
  sublists?: number[];
  links: Link[];
};

@Injectable()
export class LinkService {
  private lastFetch: number;

  private lastCode: string | undefined;

  public list$ = new BehaviorSubject<null | Record<number, List>>(null);

  public guestList$ = new BehaviorSubject<null | List>(null);

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.list$.next(null);
    this.guestList$.next(null);
  }

  extendLifetime(
    id: number | undefined,
    accessId: number | undefined,
    minutes: number = 60
  ) {
    return this.editAccess(id, accessId, { extend: minutes });
  }

  public getListById(id: number | undefined) {
    return id === undefined || this.guestList$.getValue()?.id === id
      ? this.guestList$.getValue()
      : this.list$.getValue()?.[id];
  }

  editAccess(
    id: number | undefined,
    accessId: undefined | number,
    data: { code?: string; extend?: number }
  ) {
    const list = this.getListById(id);

    if (!list || !list.owned) {
      return throwError(() => {
        return new Error(!list ? 'not_found' : 'forbidden');
      });
    }

    const url = `/v1/directory/${list.id}/${accessId ?? ''}`;
    return this.http
      .patch<{ success: boolean; code?: string; expires?: Date }>(url, data)
      .pipe(map((value) => {}));
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
        if (!value) this.guestList$.next(value);
      },
    });
  }

  fetchList(code?: string) {
    if (!this.canFetch(code)) return;
    this.lastCode = code;
    this.http
      .get<{ user: null | Record<number, List>; guest: null | List }>(
        `/v1/link/${code ?? ''}`
      )
      .subscribe({
        next: (value) => {
          this.lastFetch = Date.now();
          this.list$.next(value.user);
          this.guestList$.next(value.guest);
        },
        error: (error) => {
          if (error.status === 401) this.init();
        },
      });
  }

  addLinks(id: number | undefined, links: Omit<Link, 'id'>[]) {
    const list = this.getListById(id);
    const url = list ? `/v1/directory/${list.id}/link/` : '/v1/link/';
    if (!list) return of(false);
    return this.http
      .post<{ id: number; url: string; text?: string }[]>(url, links)
      .pipe(
        map((res) => {
          list.links = [...(list?.links ?? []), ...res];

          if (id === this.guestList$.getValue()?.id) {
            this.guestList$.next(list);
            return true;
          }

          this.list$.next(list);
          return true;
        })
      );
  }

  deleteLinks(directory: number | undefined, id: number[]) {
    const list = this.getListById(directory);
    if (!list) return of(false);
    return this.http.delete<number[]>(`/v1/link/${id.join(',')}`).pipe(
      map((res) => {
        if (!res) return false;

        list.links = list.links.filter((l) => !res.includes(l.id));

        if (directory === this.guestList$.getValue()?.id) {
          this.guestList$.next(list);
          return true;
        }

        this.list$.next(list);
        return true;
      })
    );
  }

  editLinks(directory: number | undefined, link: Link) {
    const list = this.getListById(directory);
    if (!list) return of(false);
    return this.http.patch<number>(`/v1/link/${link.id}`, link).pipe(
      map((res) => {
        if (!res) return false;

        list.links = list.links.map((l) => {
          if (link.id != l.id) return l;
          return link;
        });

        if (directory === this.guestList$.getValue()?.id) {
          this.guestList$.next(list);
          return true;
        }

        this.list$.next(list);
        return true;
      })
    );
  }

  mergeLists(src?: number, target?: number) {
    const url = `/v1/directory/merge/${src ?? ''}?target=${target ?? ''}`;
    return this.http.patch<boolean>(url, {}).pipe();
  }

  removeList(id?: number) {
    return this.http.delete<boolean>(`/v1/directory/${id ?? ''}`, {}).pipe();
  }
}
