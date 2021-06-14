const functions = require("firebase-functions");
const googleAPI = require("googleapis");
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
			
			loadRateInfo(currency, rates);
        })
})

async function loadRateInfo(currency, rateTargetList) {
	
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
	console.log(doc.title);
	await doc.updateProperties({ title: 'renamed doc' });
}








