const functions = require("firebase-functions");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheet_all = functions.config().google.sheet_id_all;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

//asia-northeast2 is Osaka
module.exports = functions.pubsub.schedule('every 30 minutes synchronized').onRun((context) => {
	console.log('begin rates job');
	await batchUpdateRates();
	console.log('end rates job');
	return null;
})

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
	
	let result = {};

	const currencies = [
		'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB',
		'BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP',
		'DZD','EGP','ETB','EUR','FJD','GBP','GEL','GHS','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS',
		'INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD',
		'LSL','LYD','MAD','MDL','MGA','MKD','MMK','MOP','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR',
		'NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK',
		'SGD','SLL','SOS','SRD','SVC','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU',
		'UZS','VES','VND','XAF','XCD','XOF','XPF','YER','ZAR','ZMW'];
	const cellSize = 143;
	for (let i = 1; i <= cellSize; i++) {
		const currency = sheet.getCellByA1('C' + i).value;
		const rates = sheet.getCellByA1('A' + i).value;
		const array = rates.split(',');
		let arrayString = '';
		array.array.forEach(element, index => {
			arrayString += currencies[index] + ':' + element;
		});
		console.log(currency + '=>' + arrayString);
	}
}


