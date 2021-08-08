const functions = require("firebase-functions");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheet_usd = functions.config().google.sheet_id_usd;
const sheet_jpy = functions.config().google.sheet_id_jpy;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

//asia-northeast2 is Osaka
module.exports = functions.pubsub.schedule('every 30 minutes synchronized').onRun((context) => {
	console.log('begin rates job');
	console.log('end rates job');
	return null;	
})

async function loadRateInfo(currency) {
	
	let doc;
	switch (currency) {
		case 'USD' :
			doc = new GoogleSpreadsheet(sheet_usd);
			break;
		case 'JPY' :
			doc = new GoogleSpreadsheet(sheet_jpy);
			break;
		default:
			doc = new GoogleSpreadsheet(sheet_usd);
			break;
	}
	
	await doc.useServiceAccountAuth({
		client_email: service_email,
		private_key: private_key.replace(/\\n/g, "\n"),
	});
	
	await doc.loadInfo();
// 	console.log(doc.title);
// 	await doc.updateProperties({ title: 'renamed doc' });

	// シート読み込み＆対象通貨読み込み
	const sheet = doc.sheetsByTitle['RATE'];
	await sheet.loadCells(['F2:F144', 'C2:C144']);
	
	let result = {};
	//	XXXAAA形式の2カ国通貨コードのセルを一つづつ読み込み、リクエストされた取得対象のレートであれば連想配列に追加する
	for (let i = 2; i <= 144; i++) {
		let key = 'F' + i;
		const target = sheet.getCellByA1(key).value;
		
		console.log("key:" + key + "target:" + target);
		//	すべてのレートを返す
		const rate = sheet.getCellByA1('C' + i).value;
		result[target] = rate;
		console.log("currency:" + target + ", rate:" + rate);
	}
	
	console.log(result);
	return result;
}


