const functions = require("firebase-functions");
const admin = require("./firebase_init");
const firestore = admin.app.firestore();

const ratesOfCollectionName = 'rates';
const rates30DaysOfCollectionName = 'rates_30days';
const BUFFER_OF_CHART_RATES = 30;
const currencies = [
	'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB',
	'BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP',
	'DZD','EGP','ETB','EUR','FJD','GBP','GEL','GHS','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS',
	'INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD',
	'LSL','LYD','MAD','MDL','MGA','MKD','MMK','MOP','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR',
	'NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK',
	'SGD','SLL','SOS','SRD','SVC','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU',
	'UZS','VES','VND','XAF','XCD','XOF','XPF','YER','ZAR','ZMW'];

//	毎日21:10に30日ストック通貨を更新する
module.exports = functions.region('asia-northeast2').pubsub.schedule('every day 21:10')
	.onRun(async (context) => {
		console.log('begin rates job');
		await batchRates30Days();
		console.log('end rates job');
		return null;
	}
)

async function batchRates30Days() {
	
	//	prepare firestore
	let ratesCollection = firestore.collection(ratesOfCollectionName);
	let rates30DaysCollection = firestore.collection(rates30DaysOfCollectionName);
	let batch = firestore.batch();

	//	通貨ごとのドキュメントをループで取得、各通貨対比レートを取得して
	//	通貨を更新する
	for (let docName of currencies) {
		console.log(docName);
		const rateRef = ratesCollection.doc(docName);
		const stockRef = rates30DaysCollection.doc(docName);
		
		let rates = await rateRef.get();
		let stock = await stockRef.get();

		if (rates.exists) {
			let data = update30DaysRates(rates.data(), stock.data(), stock.exists);
			batch.set(stockRef, data);
		}
	}
	await batch.commit();
}

function update30DaysRates(fromData, toData, existsStocks) {

	let data = {};
	console.log('start update30DaysRates');

	if (existsStocks) {
		console.log('stock exists');
		currencies.forEach(async (key, index) => {
			let arr = toData[key];
			arr.unshift(fromData[key]);
			if (arr.length > BUFFER_OF_CHART_RATES) {
				arr.splice(-1);		//	末尾のレートを削除
			}
			data[key] = arr;
		});
		console.log('end update30DaysRates');
		console.log('toData is ' + toData);
	} else {
		console.log('stock not exists');
		currencies.forEach(async (key, index) => {
			console.log(key + ':' + fromData[key]);
			data[key] = [fromData[key]];
		});
		console.log('end update30DaysRates');
		console.log('toData is ' + toData);
	}
	return data;
}
