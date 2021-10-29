require('dotenv').config()
const Web3 = require('web3');
const chalk = require('chalk');
const CoinGecko = require('coingecko-api');
const posiABI = require('./abi/posi.json');
const hurricaneABI = require('./abi/hurricane.json');

const env = process.env;
const log = console.log;
const CoinGeckoClient = new CoinGecko();
const web3 = new Web3('https://bsc-dataseed4.defibit.io/');
const aWeb3 = new Web3('https://api.avax.network/ext/bc/C/rpc');

(async function() {
	const posi = new web3.eth.Contract(posiABI, env.POSI_CONTRACT_ADDRESS)
	const hurricane = new aWeb3.eth.Contract(hurricaneABI, env.HURRICANE_CONTRACT_ADDRESS)

	const posiEarn = await posi.methods.pendingPosition(0, env.POSI_ADDRESS).call()
	const hurricaneEarn = await hurricane.methods.pending(18, env.HURRICANE_ADDRESS).call()
	const hurricanePrice = await getHurricanePrice()
	const posiPrice = await getPosiPrice()

	log("=============================")
	log(`|| ${chalk.green("Position.exchange")}`)
	log("=============================")
	log(`Total Earn : ${chalk.yellow(fromWei(posiEarn))} POSI (Rp.${totalIdr(posiEarn, posiPrice)})`)
	log(`Price POSI : ${posiPrice} IDR`)
	log("=============================")
	log(`|| ${chalk.magenta('HurricaneSwap')}`)
	log("=============================")
	log(`Total Earn : ${chalk.yellow(fromWei(hurricaneEarn[0]))} HCT (Rp.${totalIdr(hurricaneEarn[0], hurricanePrice)})`)
	log(`Price HCT  : ${hurricanePrice} IDR`)
})();

function fromWei(amount) {
	return web3.utils.fromWei(amount).slice(0, 5);
}

async function getPosiPrice() {
	let price = await CoinGeckoClient.simple.price({
	    ids: 'position-token',
	    vs_currencies: 'idr',
	});
	return price.data['position-token'].idr;
}

async function getHurricanePrice() {
	let price = await CoinGeckoClient.simple.price({
	    ids: 'hurricaneswap-token',
	    vs_currencies: 'idr',
	});
	return price.data['hurricaneswap-token'].idr;
}

function totalIdr(balance, price) {
	const formatter = new Intl.NumberFormat('en-US');

	return formatter.format(
		Math.round(parseFloat(fromWei(balance))*price)
	);
}
