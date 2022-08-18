import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of, first } from 'rxjs';

export type Link = { url: string; text?: string; id: number };

type AddLinkResult = {
  result: Link;
  code: string;
};

type List = Link[];

type Lists = {
  guest: List;
  [key: string]: List;
};

@Injectable()
export class LinkService {
  private code?: string;
  private lastFetch: number;
  private canEdit = false;
  private canEditSubject = new BehaviorSubject<boolean>(false);
  private listSubject = new BehaviorSubject<any[]>([]);
  private codeSubject = new BehaviorSubject<string | undefined>(undefined);
  private lists: Lists = { guest: [] };

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.lists = { guest: [] };
    this.listSubject.next(this.lists.guest);
  }

  extendLifetime() {
    this.editAccess({ extend: 60 });
  }

  editAccess(data: { code?: string; extend?: number }) {
    if (!this.code || !this.canEdit) return of(false).pipe(first());
    return this.http
      .patch<{ result: boolean; code?: string }>(
        `/v1/directory/${this.code}`,
        data
      )
      .pipe(
        map((value) => {
          if (value.result) this.setCode(value.code ?? '');
          return value?.result ?? false;
        })
      );
  }

  fetchList(code?: string) {
    if (
      code === this.code &&
      this.lastFetch &&
      this.lastFetch >= Date.now() + 60000
    )
      return;

    if (!code) {
      this.canEdit = true;
      this.canEditSubject.next(true);
    }

    this.http
      .get<{ list: any; guestList: any }>(`/v1/link/${code ?? ''}`)
      .subscribe((value) => {
        this.lastFetch = Date.now();
        this.lists.guest = value?.guestList.list ?? [];
        this.listSubject.next(this.lists.guest);
        if (value.guestList.code && value.guestList.code !== this.code) {
          this.code = value.guestList.code;
          this.codeSubject.next(this.code);
        }
        if (value.guestList.canEdit) {
          this.canEdit = true;
          this.canEditSubject.next(this.canEdit);
        }
      });
  }

  subscribeToListChanges(callback: (value: any[]) => void) {
    return this.listSubject.subscribe(callback);
  }

  subscribeToCodeChange(callback: (code: string | undefined) => void) {
    return this.codeSubject.subscribe(callback);
  }

  subscribeToCanEditChange(callback: (code: boolean) => void) {
    return this.canEditSubject.subscribe(callback);
  }

  addLink(url: string) {
    this.http
      .post<AddLinkResult>('/v1/link', { url, text: url })
      .subscribe((value) => {
        this.setCode(value.code ?? '');
        if (!value.result) return;
        this.lists.guest.push(value.result);
        this.listSubject.next(this.lists.guest);
      });
  }

  setCode(code: string) {
    if (!code || code === this.code) return;
    this.code = code;
    this.codeSubject.next(this.code);
  }

  addLinks(clearLinks: Omit<Link, 'id'>[]) {
    this.http
      .post<{ result: Link[]; code: string }>('/v1/link', { links: clearLinks })
      .subscribe((value) => {
        if (value.result) {
          value.result.map((el) => this.lists.guest.push(el));
          this.listSubject.next(this.lists.guest);
        }
        if (value.code && value.code !== this.code) {
          this.code = value.code;
          this.codeSubject.next(this.code);
        }
      });
  }

  getLinks(): typeof this.lists.guest {
    return this.lists.guest;
  }

  delete(id: number) {
    this.http.delete<number>(`/v1/link/${id}`).subscribe((value) => {
      if (!value) return;
      this.lists.guest = this.lists.guest.filter((el) => el.id !== id);
      this.listSubject.next(this.lists.guest);
    });
  }

  edit(id: number, formData: Omit<Link, 'id'>) {
    if (!this.code || !this.canEdit) return of(false).pipe(first());
    return this.http
      .patch<number>(`/v1/link/${id}`, {
        text: formData.text,
        url: formData.url,
      })
      .pipe(
        map((value) => {
          if (!value) return false;
          this.lists.guest = this.lists.guest.map((el) => {
            if (el.id !== id) return el;
            el = { ...el };
            el.url = formData.url;
            el.text = formData.text;
            return el;
          });
          this.listSubject.next(this.lists.guest);
          return true;
        })
      );
  }
}
