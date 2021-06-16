const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheet_usd = functions.config().google.sheet_id_usd;
const sheet_jpy = functions.config().google.sheet_id_jpy;
const service_email = functions.config().google.service_account_email;
const private_key = functions.config().google.private_key;

//asia-northeast2 is Osaka
exports.app = functions.region('asia-northeast2').https.onRequest((req, res) => {
        cors(req, res, () => {
    
            // Getting query parameter from http request
            const currency = req.body.currency;
            const rates = req.body.rates;
            
            if (!currency) {
            	return res.status(400).send('Bad requested, currency of parameter was empty');
            }
            if (!rates) {
            	return res.status(400).send('Bad requested, rates of parameter was empty');
            }
			
			console.log('start');
			loadRateInfo(currency, rates).then(json => {
				res.set("Access-Control-Allow-Origin", "*");
				console.log(json);
				res.json(json);
				console.log('end');
			});
        })
})

async function loadRateInfo(currency, rates) {
	
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
		//	要求された通貨であるか調べて、結果を取得
		if (rates.includes(target)) {
			const rate = sheet.getCellByA1('C' + i).value;
			result[target] = rate;
			console.log("currency:" + target + ", rate:" + rate);
		}
	}
	
	console.log(result);
	return result;
}








