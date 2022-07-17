import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Injectable()
export class LinkService {
  private listSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);

  private codeSubject: Subject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  private list: {url: string, text?:string, id: number}[] = [];

  private code?: string;

  private canEditSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private canEdit = false;

  constructor(private readonly http: HttpClient, routingParam: ActivatedRoute ) {
    const code = routingParam.snapshot.paramMap.get('id') ?? '';
    if (!code) {
      this.canEdit = true;
      this.canEditSubject.next(true);
    }
    this.http.get<{ canEdit?: boolean; list: any[]; code?: string}>('http://localhost:3333/v1/link/'+code, { withCredentials: true }).subscribe((value) => {
      this.list = value.list;
      this.listSubject.next(this.list);
      if (value.code && value.code !== this.code) {
        this.code = value.code;
        this.codeSubject.next(this.code);
      }
        if (value.canEdit) {
          this.canEdit = true;
          this.canEditSubject.next(this.canEdit);
        }
    });
  }

  subscribeToListChanges(callback: (value: any[]) => void): Subscription {
    const sub = this.listSubject.subscribe(callback);
    return sub;
  }

  subscribeToCodeChange(callback: (code: string | undefined) => void): Subscription {
    const sub = this.codeSubject.subscribe(callback);
    return sub;
  }

  subscribeToCanEditChange(callback: (code: boolean) => void): Subscription {
    const sub = this.canEditSubject.subscribe(callback);
    return sub;
  }

  addLink(url: string) {
    this.http
      .post<{ result: { url: string, text?: string, id: number}; code: string }>(
        'http://localhost:3333/v1/link',
        { url, text: url },
        { withCredentials: true }
      )
      .subscribe((value) => {
        if (value.result) {
          this.list.push(value.result);
          this.listSubject.next(this.list);
        }
        if (value.code && value.code !== this.code) {
          this.code = value.code;
          this.codeSubject.next(this.code);
        }
      });
  }

  getLinks(): typeof this.list {
    return this.list;
  }
}
