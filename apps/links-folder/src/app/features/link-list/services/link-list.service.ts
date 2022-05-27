import { Injectable } from '@angular/core';
import { Folder, Link, TreeItem } from '../models/Item';

const mockData = [
  {
    id: '1',
    type: 'folder',
    name: 'cats',
  },
  {
    id: '2',
    type: 'folder',
    name: 'dogs',
  },
  {
    id: '3',
    type: 'link',
    name: 'example',
    url: 'example.com',
  },
  {
    id: '4',
    parent: '1',
    type: 'link',
    name: 'Kitty',
    url: 'kitty.example.com',
  },
  {
    id: '5',
    parent: '2',
    type: 'link',
    name: 'Spike',
    url: 'spike.example.com/spike.jpg',
  },
];

@Injectable({
  providedIn: 'root',
})
export class LinkListService {
  private allLists: Folder = new Folder();
  private _activeLists: {expanded: string[]; folder: Folder}[] = [];

  constructor() {
    this.allLists = this.createTreeFromArray(mockData);
    this.openFolder();
  }

  private createTreeFromArray(array: any[]) {
    const tree: Folder = new Folder();
    tree.name = 'home';
    const itemsById: Record<string, TreeItem | Folder | Link> = {};

    for (const item of array) {
      const curItem =
        itemsById[item.id] ?? new (item.type === 'folder' ? Folder : Link)();
      if (item.type === 'folder' && !itemsById[item.id]) {
        itemsById[item.id] = curItem;
      }
      curItem.id = item.id;
      curItem.name = item.name;
      if (item.parent && !itemsById[item.parent]) {
        itemsById[item.parent] = new Folder();
      }
      if (item.parent) {
        itemsById[item.parent].children.push(curItem);
        curItem.parent = itemsById[item.parent];
      } else {
        tree.children.push(curItem);
        curItem.parent = tree;
      }
    }
    return tree;
  }

  public isHome(folder?: TreeItem) {
    return (
      this.allLists === folder ||
      (!folder && this.allLists === this._activeLists[0].folder)
    );
  }

  public get activeLists() {
    return this._activeLists;
  }

  openFolder = (folder?: TreeItem, side = false) => {
    let newFolder = folder;
    if (!newFolder) newFolder = this.allLists;
    if (
      !(newFolder instanceof Folder) ||
      (this._activeLists.findIndex((el) => el.folder ===newFolder)!==-1 && side)
    )
      return;
    this._activeLists = [...(side ? this._activeLists : []), {folder: newFolder, expanded: []}];
  };

  openParentFolder = (folder: TreeItem) => {
    const parent = folder.parent;
    if (!parent || !parent['type'] || parent['type'] !== 'Folder') return;
    const idx = this._activeLists.findIndex((el) => el.folder === folder);
    if (idx === -1) return;
    this._activeLists[idx].folder = parent as Folder;
  };

  addFolder = (name: string, folder?: Folder) => {
    const parent = folder ?? this._activeLists?.[0]?.folder ?? this.allLists;
    const newFolder = new Folder();
    newFolder.name = name;
    newFolder.id = new Date().getTime() + '';
    parent.children.unshift(newFolder);
  };

  addToList = (item: string, list?: TreeItem) => {
    const arr = this.getWorkList(list);
    if (arr === undefined || !(arr instanceof Folder)) return;
    const newLink = new Link();
    newLink.name = 'name';
    newLink.url = item;
    arr.children.push(newLink);
  };

  private getWorkList(list?: TreeItem): Folder | undefined {
    const arr = list || this.activeLists[0];
    if (!arr || !(arr instanceof Folder)) return undefined;
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
    if (element === undefined || !(element instanceof Link)) return;
    const newUrl = prompt('Enter new URL');
    element.url = newUrl ?? ''; // TODO::Find index by id and only then replace
  };
}
