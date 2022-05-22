import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkListService {

  private allLists = [{ type: 'list', items: ['1','2','3','4']}];
  private _activeLists = [ { items: this.allLists[0].items } ];

  constructor() {}

  public get activeLists() {
    return this._activeLists;
  }

  addToList = (item: string, list?: any[]) => {
    const arr = this.getWorkList(list);
    if (arr === undefined) return;
    arr.items.push(item);
  }

  private getWorkList(list?: any[]) {
    const arr: { items: any[]} | undefined = !list && this.activeLists.length===1?this.activeLists[0]:this.activeLists.find((el) => {
      return el.items === list;
    });
    return arr;
  }

  deleteFromList = (id: string | number, list?: any[]) => {
    const arr = this.getWorkList(list);
    if (arr === undefined) return;
    arr.items.splice(parseInt(id+''), 1); // TODO::Find index by id and only then splice
  }

  editInList = (id: string | number, list?: any[]) => {
    const arr = this.getWorkList(list);
    if (arr === undefined) return;
    const newUrl = prompt('Enter new URL');
    arr.items[parseInt(id+'')]=newUrl; // TODO::Find index by id and only then replace
  }
}
