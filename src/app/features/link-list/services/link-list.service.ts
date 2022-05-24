import { Injectable } from '@angular/core';
import { TreeFolder, TreeItem } from '../models/TreeItem';

@Injectable({
  providedIn: 'root',
})
export class LinkListService {
  private allLists: TreeFolder = {
    type: 'folder',
    name: 'home',
    id: '1',
    children: [
      {
        type: 'folder',
        id: '2',
        name: 'nudes',
        children: [
          { id: '3', type: 'link', url: 'cool' },
          { id: '4', type: 'link', url: '1233' },
        ],
      },
      { id: '5', type: 'link', url: '1' },
      { id: '6', type: 'link', url: '2', name: 'wow' },
    ],
  };
  private _activeLists: TreeFolder[] = [];

  constructor() {
    this.openFolder();
  }

  public isHome(folder?: TreeItem) {
    return this.allLists === folder || (!folder && this.allLists === this._activeLists[0]);
  }

  public getParentFolder(folder: TreeItem, searchFolder?: TreeFolder) {
    if (this.isHome(folder)) return undefined;
    const workFolder = searchFolder || this.allLists;
    if (workFolder.type !== 'folder') return undefined;
    let parent: TreeItem | undefined = undefined;
    workFolder.children.forEach((el) => {
      if (parent || el.type !== 'folder') return;
      if (el === folder) {
        parent = workFolder;
        return;
      }
      parent = this.getParentFolder(folder, el);
    });
    return parent;
  }

  public get activeLists() {
    return this._activeLists;
  }

  openFolder = (folder?: TreeItem, side = false) => {
    let newFolder = folder;
    if (!newFolder) newFolder = this.allLists;
    if (newFolder.type !== 'folder' || (this._activeLists.includes(newFolder) && side)) return;
    this._activeLists = [...(side ? this._activeLists : []), newFolder];
  };

  openParentFolder = (folder: TreeFolder) => {
    const parent = this.getParentFolder(folder);
    if (!parent) return;
    const idx = this._activeLists.findIndex((el) => el === folder);
    if (idx === -1) return;
    this._activeLists[idx]=parent;
  }

  addFolder = (name: string, folder?: TreeFolder) => {
    const parent = folder ?? this._activeLists[0] ?? this.allLists;
    parent.children.unshift({ id: (new Date).getTime()+'', type: 'folder', name, children: []});
  }

  addToList = (item: string, list?: TreeItem) => {
    const arr = this.getWorkList(list);
    if (arr === undefined || arr.type !== 'folder') return;
    arr.children.push({ id: (new Date).getTime()+'', type: 'link', url: item });
  };

  private getWorkList(list?: TreeItem): TreeFolder | undefined {
    const arr = list || this.activeLists[0];
    if (!arr || arr.type !== 'folder') return undefined;
    return arr;
  }

  deleteFromList = (id: string | number, list?: TreeItem) => {
    const arr = this.getWorkList(list);
    if (arr === undefined) return;
    arr.children.splice(parseInt(id + ''), 1); // TODO::Find index by id and only then splice
  };

  editInList = (id: string | number, list?: TreeItem) => {
    const arr = this.getWorkList(list);
    const index = parseInt(id + '');
    const element = arr?.children?.[index];
    if (element === undefined || element.type !== 'link') return;
    const newUrl = prompt('Enter new URL');
    element.url = newUrl ?? ''; // TODO::Find index by id and only then replace
  };
}
