const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var firestore = admin.firestore();

const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheet_all = functions.config().google.sheet_id_all;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

const ratesOfCollectionName = 'rates';
const rates30DaysOfCollectionName = 'rates_30days';
const currencies = [
	'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB',
	'BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP',
	'DZD','EGP','ETB','EUR','FJD','GBP','GEL','GHS','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS',
	'INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD',
	'LSL','LYD','MAD','MDL','MGA','MKD','MMK','MOP','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR',
	'NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK',
	'SGD','SLL','SOS','SRD','SVC','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU',
	'UZS','VES','VND','XAF','XCD','XOF','XPF','YER','ZAR','ZMW'];

// asia-northeast2 is Osaka
module.exports = functions.region('asia-northeast2').pubsub.schedule('every 30 minutes synchronized')
	.onRun(async (context) => {
		console.log('begin rates job');
		await batchUpdateRates();
		console.log('end rates job');
		return null;
	}
)

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
	for (let i = 1; i <= cellSize; i++) {

		const docName = sheet.getCellByA1('C' + i).value;
		const rates = sheet.getCellByA1('A' + i).value;
		const array = rates.split(',');
		const doc = collection.doc(docName);

		let map = buildCurrenciesMap(array);
		await doc.set(map);

		// let arrayString = '';
		// array.forEach((element, index) => {
		// 	arrayString += '      ' + currencies[index] + ':' + element + '\n';
		// });
		// console.log(currency + '\n' + arrayString + '\n');
	}
}

function buildCurrenciesMap(array) {
	let map = {};
	array.forEach((element, index) => {
		map[currencies[index]] = element;
	});
	return map;
} 


