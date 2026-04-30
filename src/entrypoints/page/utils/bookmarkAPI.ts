import type { BookmarkNode, ChromeBookmarkNode } from "../types";

function bookmarkToStructuredData(
  bookmarkNode: ChromeBookmarkNode,
): BookmarkNode {
  const { id, title, dateAdded, children, parentId, index } = bookmarkNode;
  const node: BookmarkNode = {
    type: children ? "folder" : "link",
    addDate: dateAdded,
    title,
    id,
    parentId,
    index,
  };

  if (children) {
    node.children = children.map(bookmarkToStructuredData);
  } else if (bookmarkNode.url) {
    node.url = bookmarkNode.url;
  }

  return node;
}

export function getTree(): Promise<BookmarkNode[]> {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarks) => {
      const structured =
        bookmarks[0].children?.map(bookmarkToStructuredData) ?? [];
      resolve(structured);
    });
  });
}

export function move(
  id: string,
  params: { parentId?: string; index?: number },
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.move(id, params, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

export function create(
  bookmark: chrome.bookmarks.BookmarkCreateArg,
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.create(bookmark, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

export function update(
  id: string,
  changes: chrome.bookmarks.BookmarkChangesArg,
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.update(id, changes, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

export function remove(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.remove(id, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
