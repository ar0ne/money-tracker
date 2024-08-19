import { DEFAULT_CURRENCIES, DEFAULT_CATEGORIES } from "./data";

let request: IDBOpenDBRequest;
let version = 1;
const DB_NAME = 'expensesDB';

export enum Stores {
  Expenses = 'expenses',
  Currencies = 'currencies',
  Categories = 'categories',
  Settings = 'settings',
}

export const initDB = (): Promise<boolean|IDBDatabase> => {
  return new Promise((resolve) => {
    request = indexedDB.open(DB_NAME);

    // if the data object store doesn't exist, create it
    request.onupgradeneeded = () => {
      var db = request.result;

      if (!db.objectStoreNames.contains(Stores.Expenses)) {
        console.log('Creating expenses store');
        db.createObjectStore(Stores.Expenses, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(Stores.Categories)) {
        console.log('Creating categories store');
        db.createObjectStore(Stores.Categories, { keyPath: 'id' });
        DEFAULT_CATEGORIES.forEach(category => addData(Stores.Categories, category));
      }
      if (!db.objectStoreNames.contains(Stores.Currencies)) {
        console.log('Creating currencies store');
        db.createObjectStore(Stores.Currencies, { keyPath: 'id' });
        DEFAULT_CURRENCIES.forEach(currency => addData(Stores.Currencies, currency));
      }
      if (!db.objectStoreNames.contains(Stores.Settings)) {
        console.log('Creating settings store');
        db.createObjectStore(Stores.Settings, { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = (_e) => {
      var db = _e.target.result;
      // get current version and store it
      version = db.version;
      resolve(db);
    };

    request.onerror = (_e) => {
      resolve(false);
    };
  });
};

export const addData = <T>(storeName: string, data: T): Promise<T|string|null> => {
  return new Promise((resolve) => {
    request = indexedDB.open(DB_NAME, version);

    request.onsuccess = (event) => {
      var db = event.target.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.add(data);
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const deleteData = (storeName: string, key: string): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open(DB_NAME, version);

    request.onsuccess = (event) => {
      db = event.target.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.delete(key);
      res.onsuccess = () => {
        resolve(true);
      };
      res.onerror = () => {
        resolve(false);
      }
    };
  });
};

export const updateData = <T>(storeName: string, key: string, data: T): Promise<T|string|null> => {
  return new Promise((resolve) => {
    request = indexedDB.open(DB_NAME, version);

    request.onsuccess = (event) => {
      var db = event.target.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const res = store.get(key);
      res.onsuccess = () => {
        const newData = { ...res.result, ...data };
        store.put(newData);
        resolve(newData);
      };
      res.onerror = () => {
        resolve(null);
      }
    };
  });
};

export const getStoreData = <T>(storeName: Stores): Promise<T[]> => {
  return new Promise((resolve) => {
    request = indexedDB.open(DB_NAME);

    request.onsuccess = (event) => {
      var db = event.target.result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};

export const getStoreDataById = <T>(storeName: Stores, id: string): Promise<T|undefined> => {
    return new Promise((resolve) => {
      request = indexedDB.open(DB_NAME);

      request.onsuccess = (event) => {
        var db = event.target.result;
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const res = store.get(id);
        res.onsuccess = () => {
          resolve(res.result);
        };
      };
    });
  };


export {};
