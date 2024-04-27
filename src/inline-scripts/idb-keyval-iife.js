/* From https://github.com/jakearchibald/idb-keyval */
/* Retreived 2020-04-10 */

var idbKeyval = (function () {
  'use strict';

  class Store {
      constructor(dbName = 'keyval-store', storeName = 'keyval') {
          this.storeName = storeName;
          /** @type {Promise<IDBDatabase>} */
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
      /**
       * @param {IDBTransactionMode} type
       * @param {(objectStore: IDBObjectStore) => void} callback
       * @returns {Promise<void>}
       */
      _withIDBStore(type, callback) {
          return this._dbp.then(db => new Promise((resolve, reject) => {
              const transaction = db.transaction(this.storeName, type);
              transaction.oncomplete = () => resolve();
              transaction.onabort = transaction.onerror = () => reject(transaction.error);
              callback(transaction.objectStore(this.storeName));
          }));
      }
  }
  /** @type {Store} */
  let store;
  function getDefaultStore() {
      if (!store)
          store = new Store();
      return store;
  }
  /**
   * @template T
   * @param {IDBValidKey} key
   * @param {Store} [store]
   * @returns {Promise<T>}
   */
  function get(key, store = getDefaultStore()) {
      /** @type {IDBRequest<T>} */
      let req;
      return store._withIDBStore('readonly', store => {
          req = store.get(key);
      }).then(() => req.result);
  }
  /**
   * @template T
   * @param {IDBValidKey} key
   * @param {T} value
   * @returns {Promise<void>}
   */
  function set(key, value, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.put(value, key);
      });
  }
  /**
   * @param {IDBValidKey} key
   * @returns {Promise<void>}
   */
  function del(key, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.delete(key);
      });
  }
  /**
   * @param {Store} [store]
   * @returns {Promise<void>}
   */
  function clear(store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.clear();
      });
  }
  /**
   * @param {Store} [store]
   * @returns {Promise<IDBValidKey[]>}
   */
  function keys(store = getDefaultStore()) {
      /** @type {IDBValidKey[]} */
      const keys = [];
      return store._withIDBStore('readonly', store => {
          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // And openKeyCursor isn't supported by Safari.
          /** @type {IDBObjectStore["openKeyCursor"]} */ (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
              if (!this.result)
                  return;
              keys.push(this.result.key);
              this.result.continue();
          };
      }).then(() => keys);
  }

  return {
    Store,
    get,
    set,
    del,
    clear,
    keys
  };

//   exports.Store = Store;
//   exports.get = get;
//   exports.set = set;
//   exports.del = del;
//   exports.clear = clear;
//   exports.keys = keys;

//   return exports;

  }());
