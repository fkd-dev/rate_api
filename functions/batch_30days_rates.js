const functions = require("firebase-functions");
const admin = require("./firebase_init");
const constants = require("./constants");
const firestore = admin.app.firestore();

const ratesOfCollectionName = 'rates';
const rates30DaysOfCollectionName = 'rates_30days';
const BUFFER_OF_CHART_RATES = 30;

//	毎日21:10に30日ストック通貨を更新する
module.exports = functions
	.region('asia-northeast2')
	.runWith(constants.runtimeOpts)
	.pubsub.schedule('every day 21:10')
	.onRun(async (context) => {
		console.log('begin rates job');
		await updateRates30Days();
		console.log('end rates job');
		return null;
	}
)

async function updateRates30Days() {
	
	//	prepare firestore
	let ratesCollection = firestore.collection(ratesOfCollectionName);
	let rates30DaysCollection = firestore.collection(rates30DaysOfCollectionName);
	let batches = [];

	//	通貨ごとのドキュメントをループで取得、各通貨対比レートを取得して
	//	通貨を更新する
	for (let docName of constants.currencies) {
		console.log(docName);
		let batch = firestore.batch();
		batches.push(batch);

		//	ドキュメントを取得
		const rateRef = ratesCollection.doc(docName);
		const stockRef = rates30DaysCollection.doc(docName);
		
		//	Documentデータを取得
		let rates = await rateRef.get();
		let stock = await stockRef.get();

		if (rates.exists) {
			let data = update30DaysRates(rates.data(), stock.data(), stock.exists);
			// await stockRef.set(data).catch(error => {
			// 	console.log(error)
			// });
			if (stock.exists) {
				batch.update(stockRef, data);
			} else {
				batch.set(stockRef, data);
			}
		}
	}
	for (let batch of batches) {
		console.log('commit batch....');
		await batch.commit().catch(error => {
			console.log(error);
		});
	}
}

function update30DaysRates(fromData, toData, existsStocks) {
	
	let data = {};
	let func;
	const comma = ','
	if (existsStocks) {
		//--------------------------------------------------
		//		レートを最新にアップデート
		func = function (key) {

			//	先頭に追加
			let rates = toData[key];
			rates = fromData[key] + comma + rates;

			//	末尾のレートを削除
			if ((rates.match(/,/g) || []).length >= BUFFER_OF_CHART_RATES) {
				//	カンマは必ず存在する
				let idx = rates.lastIndexOf(comma);
				rates = rates.substring(0, idx);
			}
			data[key] = rates;
		};
	} else {
		//--------------------------------------------------
		//		レートコレクションを作成
		func = function (key) {
			console.log(key + ':' + fromData[key]);
			data[key] = fromData[key];

			//test code
			// data[key] = '123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789,123.456789'
		};
	}
	// console.log('stock exists');
	constants.currencies.forEach(async (key, index) => func(key));
	return data;
}
