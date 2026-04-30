class IndexedDBHelper {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, version = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  openDB(storeNames: string[]): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        storeNames.forEach((storeName) => {
          if (!this.db!.objectStoreNames.contains(storeName)) {
            this.db!.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(
          `Failed to open database: ${(event.target as IDBOpenDBRequest).error}`,
        );
      };
    });
  }

  addData<T>(storeName: string, data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve("Data added successfully");
      request.onerror = (event) =>
        reject(`Failed to add data: ${(event.target as IDBRequest).error}`);
    });
  }

  getData<T>(storeName: string, id: string | number): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName]);
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result);
      request.onerror = (event) =>
        reject(`Failed to get data: ${(event.target as IDBRequest).error}`);
    });
  }

  getAllData<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName]);
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest).result);
      request.onerror = (event) =>
        reject(`Failed to get all data: ${(event.target as IDBRequest).error}`);
    });
  }

  updateData<T>(storeName: string, data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve("Data updated successfully");
      request.onerror = (event) =>
        reject(`Failed to update data: ${(event.target as IDBRequest).error}`);
    });
  }

  deleteData(storeName: string, id: string | number): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve("Data deleted successfully");
      request.onerror = (event) =>
        reject(`Failed to delete data: ${(event.target as IDBRequest).error}`);
    });
  }

  deleteMultipleData(
    storeName: string,
    ids: (string | number)[],
  ): Promise<string> {
    const deletePromises = ids.map((id) => this.deleteData(storeName, id));
    return Promise.all(deletePromises)
      .then((results) => `All data deleted, ${results.length} items removed.`)
      .catch((error) => `Error deleting data: ${error}`);
  }

  getCursor(
    storeName: string,
    callback: (value: any) => void,
    onComplete: () => void,
  ): void {
    const transaction = this.db!.transaction([storeName]);
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        callback(cursor.value);
        cursor.continue();
      } else {
        onComplete();
      }
    };

    request.onerror = () => {
      onComplete();
    };
  }

  closeDB(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  deleteDB(): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => resolve("Database deleted successfully");
      request.onerror = (event) =>
        reject(
          `Failed to delete database: ${(event.target as IDBOpenDBRequest).error}`,
        );
    });
  }
}

export default new IndexedDBHelper("Database", 2);
