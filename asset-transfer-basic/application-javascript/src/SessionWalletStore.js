'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionWalletStore = void 0;

class SessionWalletStore {
    constructor(walletpath) {
        this.storePath= walletpath;
    }
    static async newInstance(walletpath) {
        const clientStoreOptions = {
            // Do we need any config options for the client store
        };
        //await clientFileSystem?(..., clientStoreOptions);
        return new SessionWalletStore(walletpath);
    }
    async remove(label) {
        window.localStorage.removeItem(thistoPath(label));
    }
    async get(label) {
        window.localStorage.getItem(thistoPath(label));
    }
    async list() {
    }
    async put(label, data) {
        window.localStorage.setItem(thistoPath(label),data);
    }
    toPath(label) {
        return this.storePath+"."+label;
    }
}

exports.SessionWalletStore = SessionWalletStore;
//# sourceMappingURL=SessionWalletStore.js.map