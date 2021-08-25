const functions = require("firebase-functions");
const admin = require("./firebase_init");
const constants = require("./constants");
const firestore = admin.app.firestore();
const util = require("./utility");

const { GoogleSpreadsheet } = require('google-spreadsheet');
const sheet_all = functions.config().google.sheet_id_all;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

const ratesOfCollectionName = 'rates';
const currencyTotal = constants.currencies.length;

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
	console.log('load cells...');
	await sheet.loadCells(['A1:A143']);

	//	まずは4分待機
	console.log('sleep in 240 sec');
	await util.sleepSec(240);
	console.log('load cells again...');
	await sheet.loadCells(['A1:A143']);

	//	wait while cells has error.
	await waitWhileLoadingForGoogleFinance(sheet);
	
	const cellSize = currencyTotal;
	let collection = firestore.collection(ratesOfCollectionName);
	let batch = firestore.batch();
	for (let i = 1; i <= cellSize; i++) {

		const docName = constants.currencies[i-1];
		const rates = sheet.getCellByA1('A' + i).value;
		const array = rates.split(',');
		const doc = collection.doc(docName);

		let map = buildCurrenciesMap(array);
		batch.set(doc, map);
	}

	//	一括更新
	await batch.commit();
}

async function waitWhileLoadingForGoogleFinance(sheet) {

	//	A1 - A143まで作成
	var arr = Array(currencyTotal).fill().map((_,i) => `A${i+1}`);

	const word = ',0,';
	for (let loop = 0; loop < 20; loop++) {
		
		//	セル内で関数がエラーを返しているかチェック。
		arr = arr.filter(A1 => {
			const rates = sheet.getCellByA1(A1).value;
			const wordCount = util.countWord(rates, word)
			console.log(`,0, is ${wordCount}`);
			return wordCount <= 1;
		});
		console.log(`array size: ${arr.length}`);
		if (arr.length == currencyTotal) {
			console.log('all cells has no error.')
			break;
		}

		//	エラーが発生していたら処理を中止して10秒待機
		console.log('sleep while 10sec')
		await util.sleepSec(10);
	}
}

function buildCurrenciesMap(array) {
	let map = {};
	array.forEach((element, index) => {
		map[constants.currencies[index]] = element;
	});
	return map;
} 
