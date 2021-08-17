const functions = require("firebase-functions");
const admin = require("./firebase_init");
const constants = require("./constants");
const firestore = admin.app.firestore();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const sheet_all = functions.config().google.sheet_id_all;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

const ratesOfCollectionName = 'rates';

//	30分おきに通貨を更新する
module.exports = functions
	.region('asia-northeast2')
	.runWith(constants.runtimeOpts)
	.pubsub.schedule('every 30 minutes synchronized')
	.onRun(async (context) => {
		console.log('begin rates job');
		await batchUpdateRates();
		console.log('end rates job');
		return null;
	}
)

//	スプレッドシートを読み込み、最新の為替を取得
//	全ての為替レートをFirestoreに放り込む
async function batchUpdateRates() {
	
	let doc = new GoogleSpreadsheet(sheet_all);
	
	await doc.useServiceAccountAuth({
		client_email: service_email,
		private_key: private_key.replace(/\\n/g, "\n"),
	});
	
	await doc.loadInfo();

	// 順番に通貨の読み込み
	const sheet = doc.sheetsByTitle['rates'];
	await sheet.loadCells(['A1:A143', 'C1:C143']);
	
	const cellSize = 143;
	let collection = firestore.collection(ratesOfCollectionName);
	let batch = firestore.batch();
	for (let i = 1; i <= cellSize; i++) {

		const docName = sheet.getCellByA1('C' + i).value;
		const rates = sheet.getCellByA1('A' + i).value;
		const array = rates.split(',');
		const doc = collection.doc(docName);

		let map = buildCurrenciesMap(array);
		batch.set(doc, map);
		// await doc.set(map);

		// let arrayString = '';
		// array.forEach((element, index) => {
		// 	arrayString += '      ' + currencies[index] + ':' + element + '\n';
		// });
		// console.log(currency + '\n' + arrayString + '\n');
	}

	//	一括更新
	await batch.commit();
}

function buildCurrenciesMap(array) {
	let map = {};
	array.forEach((element, index) => {
		map[constants.currencies[index]] = element;
	});
	return map;
} 
