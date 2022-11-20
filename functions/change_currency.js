const functions = require("firebase-functions");
const admin = require("./firebase_init");
const firestore = admin.app.firestore();

const userDevicesCollectionName = 'user_devices';
const day = 3600 * 24 * 1000;

//asia-northeast2 is Osaka
module.exports = functions
    .region('asia-northeast2')
    .runWith({enforceAppCheck: true}).https.onCall(async (data, context) => {

    if (context.app == undefined) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called from an App Check verified app.');
    }
    const uid = data.uid;
    if (!uid || !(typeof uid === 'string') || uid.length === 0) {
        throw new functions.https.HttpsError('invalid-arguments','uid is invalid');
    }
    const result = await getCurrencyChangeable(uid);
    return {
        canChange : result
    }
})

async function getCurrencyChangeable(uuid) {

    const usersCollection = firestore.collection(userDevicesCollectionName);
    const userCountRef = usersCollection.doc(uuid);
    const d = new Date();
    const now = d.getMilliseconds();
    const doc = await userCountRef.get();
    if (!doc.exists) {
        userCountRef.set({
            count: 1,
            date: now
        }); 
        return true;
    }

    const date = doc.get("date");
    const count = doc.get("count");
    if (date + day < now) {
        //  24時間経過しているので、更新する
        userCountRef.update({
            count: 1,
            date: now
        });
        return true;
    }
    if (count < 5) {
        userCountRef.update({
            count: count + 1,
            date: date
        });
        return true;
    }
    return false;
}
