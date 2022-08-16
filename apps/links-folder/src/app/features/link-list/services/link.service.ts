import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Injectable()
export class LinkService {
  private listSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);

  private codeSubject: Subject<string | undefined> = new BehaviorSubject<
    string | undefined
  >(undefined);

  private lists: {
    guest: { url: string; text?: string; id: number }[];
    [key: string]: { url: string; text?: string; id: number }[];
  } = {
    guest: [],
  };

  private code?: string;
  private lastFetch: number;
  private canEditSubject = new BehaviorSubject<boolean>(false);
  private canEdit = false;

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.lists = { guest: [] };
    this.listSubject.next(this.lists.guest);
  }

  extendLifetime() {
    if (!this.code) return;
    this.editAccess({});
  }

  editAccess(data: { code?: string }) {
    return new Promise((resolve, reject) => {
      this.http
        .patch<boolean>(
          'http://localhost:3333/v1/directory/' + (this.code ?? ''),
          data,
          { withCredentials: true }
        )
        .subscribe((value) => {
          if (data.code && value) {
            this.code = data.code;
            this.codeSubject.next(this.code);
          }
          resolve(value);
        });
    });
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
      .get<{ list: any; guestList: any }>(
        'http://localhost:3333/v1/link/' + (code ?? ''),
        { withCredentials: true }
      )
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

  subscribeToListChanges(callback: (value: any[]) => void): Subscription {
    const sub = this.listSubject.subscribe(callback);
    return sub;
  }

  subscribeToCodeChange(
    callback: (code: string | undefined) => void
  ): Subscription {
    const sub = this.codeSubject.subscribe(callback);
    return sub;
  }

  subscribeToCanEditChange(callback: (code: boolean) => void): Subscription {
    const sub = this.canEditSubject.subscribe(callback);
    return sub;
  }

  addLink(url: string) {
    this.http
      .post<{
        result: { url: string; text?: string; id: number };
        code: string;
      }>(
        'http://localhost:3333/v1/link',
        { url, text: url },
        { withCredentials: true }
      )
      .subscribe((value) => {
        if (value.result) {
          this.lists.guest.push(value.result);
          this.listSubject.next(this.lists.guest);
        }
        if (value.code && value.code !== this.code) {
          this.code = value.code;
          this.codeSubject.next(this.code);
        }
      });
  }

  addLinks(clearLinks: { url: string; text: string }[]) {
    this.http
      .post<{
        result: { url: string; text?: string; id: number }[];
        code: string;
      }>(
        'http://localhost:3333/v1/link',
        { links: clearLinks },
        { withCredentials: true }
      )
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
    this.http
      .delete<number>('http://localhost:3333/v1/link/' + id, {
        withCredentials: true,
      })
      .subscribe((value) => {
        if (value) {
          this.lists.guest = this.lists.guest.filter((el) => el.id !== id);
          this.listSubject.next(this.lists.guest);
        }
      });
  }

  edit(id: number, formData: { link: string; name: string }) {
    return new Promise((resolve, reject) => {
      this.http
        .patch<number>(
          'http://localhost:3333/v1/link/' + id,
          { text: formData.name, url: formData.link },
          {
            withCredentials: true,
          }
        )
        .subscribe((value) => {
          if (value) {
            this.lists.guest = this.lists.guest.map((el) => {
              if (el.id === id) {
                el = { ...el };
                el.url = formData.link;
                el.text = formData.name;
              }
              return el;
            });
            this.listSubject.next(this.lists.guest);
            resolve(true);
          }
        });
    });
  }
}
