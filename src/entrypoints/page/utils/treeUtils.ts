import type { BookmarkNode } from "../types";

export function findInTree(
  node: BookmarkNode | BookmarkNode[],
  predicate: (node: BookmarkNode) => boolean,
): BookmarkNode | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const result = findInTree(item, predicate);
      if (result) return result;
    }
  } else {
    if (predicate(node)) return node;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const result = findInTree(child, predicate);
        if (result) return result;
      }
    }
  }
  return null;
}

export function deleteFromTree(
  node: BookmarkNode | BookmarkNode[],
  predicate: (node: BookmarkNode) => boolean,
): boolean {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (predicate(node[i])) {
        node.splice(i, 1);
        return true;
      }
      deleteFromTree(node[i], predicate);
    }
  } else {
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        if (predicate(node.children[i])) {
          node.children.splice(i, 1);
          return true;
        }
        deleteFromTree(node.children[i], predicate);
      }
    }
  }
  return false;
}

export function addToTree(
  node: BookmarkNode | BookmarkNode[],
  predicate: (node: BookmarkNode) => boolean,
  newNode: BookmarkNode,
): boolean {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (addToTree(item, predicate, newNode)) return true;
    }
  } else {
    if (predicate(node)) {
      if (!node.children) node.children = [];
      node.children.push(newNode);
      return true;
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (addToTree(child, predicate, newNode)) return true;
      }
    }
  }
  return false;
}

export function findParentFolders(
  folders: BookmarkNode[],
  targetId: string,
): BookmarkNode[] {
  const result: BookmarkNode[] = [];

  function findFolder(items: BookmarkNode[], id: string): boolean {
    for (const folder of items) {
      if (folder.id === id) {
        result.push(folder);
        return true;
      }
      if (folder.children && folder.children.length > 0) {
        if (findFolder(folder.children, id)) {
          result.push(folder);
          return true;
        }
      }
    }
    return false;
  }

  findFolder(folders, targetId);
  return result.reverse();
}
