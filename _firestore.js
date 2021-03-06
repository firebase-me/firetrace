import { Singleton, Calculate } from './index.js';
const callback;

const trigger = (snapshot, meta, path) => {
    const docCount = getDocumentCount(snapshot);
    const payload = {
        time: Date.now(),
        auth: Singleton.auth.uid || null,
        path: path || snapshot.path || snapshot.ref || null,
        size: docCount.count || null,
        cache: docCount.cache > 0 ? docCount.cache : null,
        meta: typeof meta == "string" ? meta : JSON.stringify(meta) || null,
    };
    if (Singleton)
        return await fetch(Singleton.dbUrl + `/tracker/firestore.json`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            method: "POST",
        })
    else {
        if (callback && typeof callback == "function") callback(payload);
        else return payload;
    }
}
function getDocumentCount(snapshot) {
    if (snapshot.docs) {
        let _count = 0;
        let _cache = 0;
        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                doc.metadata.fromCache ? cache++ : _count++;
            });
        }
        return { count: snapshot.size || _count, cache: _cache };
    }
    else {
        return { count: snapshot.exists() ? 1 : 0, cache: snapshot.metadata.fromCache ? 1 : 0 }
    }
}
}
const setCallback = (func) => callback = func;
export default { trigger, setCallback }