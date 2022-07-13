import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LinkService {
  private listSubject: Subject<any[]> = new BehaviorSubject<any[]>([]);

  private list: string[] = [];

  subscribeToListChanges(callback: (value: any[]) => void) {
    const sub = this.listSubject.subscribe(callback);
    return sub;
  }

  addLink(link: string) {
    this.list.push(link);
    this.listSubject.next(this.list);
  }

  getLinks(): string[] {
    return this.list;
  }
}
