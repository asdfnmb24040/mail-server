const fs = require( 'fs' );
const nodemailer = require( 'nodemailer' );
const configStartup = require( '../config/startup' );
const retryLimit = 3;
let retryCount = 0;

async function getFile ( fileName ) {
	let url = '';

	switch ( fileName ) {
		case 'queue':
			url = './src/static/queue.json';
			break;
		case 'queueInfo':
			url = './src/static/queueInfo.json';
			break;
		case 'accountConfig':
			url = './src/config/accountConfig.json';
			break;
		default:
			return null
	}

	return await readFile( url );
}

async function readFile ( path ) {
	return new Promise( ( resolve, reject ) => {
		fs.readFile( path, function ( err, data ) {
			if ( err ) {
				reject( err );
			}

			try {
				resolve( JSON.parse( data ) );

			} catch ( error ) {
				resolve( null )
			}
		} );
	} );
}

function getQueueLastIndex ( queue ) {
	if ( !!queue && Array.isArray( queue ) ) {
		if ( queue.length !== 0 ) {
			const item = Object.assign( [], queue ).pop();
			if ( !!item && !!item.index && typeof ( item.index ) === 'number' ) {
				return item.index;
			}
		}
	}

	return 0;
}

function vaildMail ( mailItem ) {
	const { senderName, mailAddress, phoneNum, companyName, content, index } = mailItem;

	if ( !senderName || !mailAddress || !phoneNum || !companyName ) {
		console.error( '欄位檢核失敗', { mailItem } );
		return false;
	}

	return true;
}

async function sendMailProcess ( mailItem, options ) {
	//sleep
	await sleep( configStartup.mail.sleep );

	//vaild
	if ( !vaildMail( mailItem ) ) {
		return;
	}

	//retry
	if ( !!options && options.retry ) {
		console.log( { retryCount, retryLimit } ) //show retry info
		if ( retryCount < retryLimit ) {
			retryCount++;
			console.log( 'Send mail retry' )
		} else {
			console.error( 'Reached the retry limit', { mailItem } )
			return;
		}
	}

	//get config
	console.log( 'sendMail', mailItem.index );
	const config = await getConfig();
	if ( !config ) return;

	//send mail

	const sendResult = await sendMail( mailItem, config );

	if ( !sendResult ) {
		await sendMailProcess( mailItem, { retry: true } );
	}

	return;
}

async function sendMail ( mailItem, config ) {
	//send mail
	try {
		const { senderName, mailAddress, phoneNum, companyName, content, index } = mailItem;
		const transporter = nodemailer.createTransport( config );
		const mail = {
			to: configStartup.mail.to,
			// to: 'mayo.chien@future.net.co',
			subject: 'sigma展覽訊息信件 編號:' + index,
			html:
				`
				<div>Name:${senderName}<div/><br>
				<div>Email:${mailAddress}<div/><br>
				<div>Phone:${phoneNum}<div/><br>
				<div>Company:${companyName}<div/><br>
				<div>Message:${content}<div/><br>
			`
		};
		const sendResult = await transporter.sendMail( mail );
		const error = sendResult.error;

		// console.log( 'sendResult=>', JSON.stringify( sendResult ) );

		if ( error ) {
			console.log( '錯誤:', error );
			console.log( 'mail:',JSON.stringify( mail ) );
			console.log( 'sendResult:', JSON.stringify( sendResult ) );

			return false;
		} else {
			// console.log( '信件已發送' );
			return true;
		}
	} catch ( error ) {
		console.error( 'sendMail Error=>', error )
		return false;
	}
}

async function sleep ( ms ) {
	console.log( 'sleep => ', ms )
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}

let accountIdx = 0;
async function getConfig () {
	try {
		const accounts = await getFile( 'accountConfig' );
		const auths = accounts.auths;
		if ( !auths || auths.length < 1 ) {
			console.error( 'getConfig Error : get config error' );

			return null;
		}

		if ( accountIdx >= auths.length ) {
			accountIdx = 0;
		}

		const mailConfig = Object.assign( { auth: auths[ accountIdx ] }, accounts.info );

		// console.log( { mailConfig } )
		accountIdx++;

		return mailConfig;
	} catch ( err ) {
		console.error( 'getConfig Error', err );
		return null;
	}
}


module.exports = { getFile, getQueueLastIndex, sendMailProcess, vaildMail, sendMail };