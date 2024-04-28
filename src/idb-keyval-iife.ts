/* From https://github.com/jakearchibald/idb-keyval */
/* Retreived 2020-04-10 */

  export class Store {
      storeName: string;
      private _dbp: Promise<IDBDatabase>;

      constructor(dbName = 'keyval-store', storeName = 'keyval') {
          this.storeName = storeName;
          this._dbp = new Promise((resolve, reject) => {
              const openreq = indexedDB.open(dbName, 1);
              openreq.onerror = () => reject(openreq.error);
              openreq.onsuccess = () => resolve(openreq.result);
              // First time setup: create an empty object store
              openreq.onupgradeneeded = () => {
                  openreq.result.createObjectStore(storeName);
              };
          });
      }
      _withIDBStore(type: IDBTransactionMode, callback: (objectStore: IDBObjectStore) => void): Promise<void> {
          return this._dbp.then(db => new Promise((resolve, reject) => {
              const transaction = db.transaction(this.storeName, type);
              transaction.oncomplete = () => resolve();
              transaction.onabort = transaction.onerror = () => reject(transaction.error);
              callback(transaction.objectStore(this.storeName));
          }));
      }
  }
  let store: Store;
  function getDefaultStore(): Store {
      if (!store)
          store = new Store();
      return store;
  }
  export function get<T>(key: IDBValidKey, store: Store = getDefaultStore()): Promise<T> {
      let req: IDBRequest<T>;
      return store._withIDBStore('readonly', store => {
          req = store.get(key);
      }).then(() => req.result);
  }
  export function set<T>(key: IDBValidKey, value: T, store = getDefaultStore()): Promise<void> {
      return store._withIDBStore('readwrite', store => {
          store.put(value, key);
      });
  }
  export function del(key: IDBValidKey, store = getDefaultStore()): Promise<void> {
      return store._withIDBStore('readwrite', store => {
          store.delete(key);
      });
  }
  export function clear(store: Store = getDefaultStore()): Promise<void> {
      return store._withIDBStore('readwrite', store => {
          store.clear();
      });
  }
  export function keys(store: Store = getDefaultStore()): Promise<IDBValidKey[]> {
      const keys: IDBValidKey[] = [];
      return store._withIDBStore('readonly', store => {
          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // And openKeyCursor isn't supported by Safari.
          ((store.openKeyCursor || store.openCursor) as IDBObjectStore["openKeyCursor"]).call(store).onsuccess = function () {
              if (!this.result)
                  return;
              keys.push(this.result.key);
              this.result.continue();
          };
      }).then(() => keys);
  }
