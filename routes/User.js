import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://pixelsync-3f79a-default-rtdb.firebaseio.com/"
});

const db = admin.firestore();

db.collection("users").get()
.then(snapshot => {
    snapshot.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
    });
})
.catch(err => {
    console.error("Error getting documents", err);
});