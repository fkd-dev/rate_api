const functions = require("firebase-functions");
const admin = require("./firebase_init");
const firestore = admin.app.firestore();
const cors = require('cors')({origin: true});

const userDevicesCollectionName = 'user_devices';
const day = 3600 * 24 * 1000;

//asia-northeast2 is Osaka
module.exports = functions.region('asia-northeast2').runWith({enforceAppCheck: true}).https.onRequest((req, res) => {
    cors(req, res, () => {

        if (req.app == undefined) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'The function must be called from an App Check verified app.');
        }
        
        if (req.method !== 'POST') {
            return res.status(400).send("error! this endpoint allows the post method only.");
        }
        const uid = req.body.uid;
        if (!uid) {
            return res.status(400).send("error!");
        }
        getCurrencyChangeable(uid).then(result => {
            res.set("Access-Control-Allow-Origin", "*");
            console.log(result);
            res.status(200).json(result);
            console.log('end');
        });
    })
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
