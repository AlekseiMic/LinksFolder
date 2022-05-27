export interface TreeItem {
  parent: TreeItem | undefined;
  children: TreeItem[],
  name: string,
  id: string,
  [key: string]: any
}


export class Folder implements TreeItem {
    parent: TreeItem | undefined;
    children: TreeItem[] = [];
    name: string = '';
    id: string = '';
    type: 'Folder' = 'Folder';
}

export class Link implements TreeItem {
    parent: TreeItem | undefined;
    children: TreeItem[] = [];
    name: string = '';
    id: string = '';
    url: string = '';
    type: 'Link' = 'Link';
}
