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
  private _code?: string;
  private lastFetch: number;
  private _canEdit = false;
  private _isOwner = false;
  private canEditSubject = new BehaviorSubject<boolean>(false);
  private isOwnerSubject = new BehaviorSubject<boolean>(false);
  private listSubject = new BehaviorSubject<any[]>([]);
  private codeSubject = new BehaviorSubject<string | undefined>(undefined);
  private lists: Lists = { guest: [] };

  constructor(private readonly http: HttpClient) {}

  clear() {
    this.lists = { guest: [] };
    this.listSubject.next(this.lists.guest);
  }

  subscribeToListChanges(callback: (value: any[]) => void) {
    return this.listSubject.subscribe(callback);
  }

  subscribeToIsOwnerChanges(callback: (value: boolean) => void) {
    return this.isOwnerSubject.subscribe(callback);
  }

  subscribeToCodeChange(callback: (code: string | undefined) => void) {
    return this.codeSubject.subscribe(callback);
  }

  subscribeToCanEditChange(callback: (code: boolean) => void) {
    return this.canEditSubject.subscribe(callback);
  }

  private set code(code: undefined | string) {
    if (!code || code === this._code) return;
    this._code = code;
    this.codeSubject.next(this._code);
  }

  get code() {
    return this._code;
  }

  private set canEdit(canEdit: boolean | undefined) {
    if ((canEdit ?? false) === this._canEdit) return;
    this._canEdit = canEdit ?? false;
    this.canEditSubject.next(this._canEdit);
  }

  get canEdit() {
    return this._canEdit;
  }

  private set isOwner(isOwner: undefined | boolean) {
    if ((isOwner ?? false) === this._isOwner) return;
    this._isOwner = isOwner ?? false;
    this.isOwnerSubject.next(this._isOwner);
  }

  public get isOwner() {
    return this._isOwner;
  }

  extendLifetime() {
    return this.editAccess({ extend: 60 });
  }

  editAccess(data: { code?: string; extend?: number }) {
    if (!this.code || !this._canEdit) return of(false).pipe(first());
    return this.http
      .patch<{ result: boolean; code?: string }>(
        `/v1/directory/${this.code}`,
        data
      )
      .pipe(
        map((value) => {
          if (value.code) this.code = value.code;
          if (!value.result) return false;
          return value.result;
        })
      );
  }

  fetchList(code?: string) {
    if (
      code === this.code &&
      this.lastFetch &&
      this.lastFetch >= Date.now() + 60000
    ) {
      return;
    }

    this.canEdit = !code;
    this.isOwner = !code;

    this.http
      .get<{ list: any; guestList: any }>(`/v1/link/${code ?? ''}`)
      .subscribe((value) => {
        this.lastFetch = Date.now();
        this.lists.guest = value?.guestList.list ?? [];
        this.listSubject.next(this.lists.guest);
        this.code = value.guestList.code;
        this.canEdit = value.guestList.canEdit;
        this.isOwner = value.guestList.isOwner;
      });
  }

  addLink(url: string) {
    this.http
      .post<AddLinkResult>('/v1/link', { url, text: url })
      .subscribe((value) => {
        this.code = value.code;
        if (!value.result) return;
        this.lists.guest.push(value.result);
        this.listSubject.next(this.lists.guest);
      });
  }

  addLinks(clearLinks: Omit<Link, 'id'>[]) {
    this.http
      .post<{ result: Link[]; code: string }>('/v1/link', { links: clearLinks })
      .subscribe((value) => {
        this.code = value.code;
        if (!value.result) return;
        value.result.map((el) => this.lists.guest.push(el));
        this.listSubject.next(this.lists.guest);
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

  mergeLists(src?: number, target?: number) {
    return this.http
      .patch<boolean>(
        `/v1/directory/merge/${src ?? ''}?target=${target ?? ''}`,
        {}
      )
      .pipe(
        map((value) => {
          return value;
        })
      );
  }

  removeList(id?: number) {
    return this.http.delete<boolean>(`/v1/directory/${id ?? ''}`, {}).pipe(
      map((value) => {
        if (value) this.lists = { guest: [] };
        return value;
      })
    );
  }
}
