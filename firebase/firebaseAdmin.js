import admin  from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const AccountKey = require("./AccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(AccountKey),
});

const db = admin.firestore();

export { admin, db };