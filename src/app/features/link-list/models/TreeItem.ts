export type TreeItem =
  | TreeFolder
  | TreeLink

export type TreeFolder = { id: string, type: 'folder', name: string, children: TreeItem[]};
export type TreeLink = { id: string, type: 'link', url: string, name?: string };
