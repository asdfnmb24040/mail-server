const fs = require( 'fs' );
const mailConfig = require( '../config/mailConfig' );
const nodemailer = require( 'nodemailer' );

async function getFile ( fileName ) {
	let url = '';

	switch ( fileName ) {
		case 'queue':
			url = './src/static/queue.json';
			break;
		case 'queueInfo':
			url = './src/static/queueInfo.json';
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

async function sendMail ( mailItem ) {
	//send mail
	try {
		const { senderName, mailAddress, phoneNum, companyName, content, index } = mailItem;

		if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
			console.log( '欄位檢核失敗', { mailItem } );
			return;
		}

		console.log( 'sendMail', mailItem.index );

		const transporter = nodemailer.createTransport( mailConfig );
		const mail = {
			// to: 'armanddeng@future.net.co',
			to: 'mayo.chien@future.net.co',
			subject: 'sigma展覽訊息信件' + index,
			html:
				`
				<div>${senderName}<div/><br>
				<div>${mailAddress}<div/><br>
				<div>${phoneNum}<div/><br>
				<div>${companyName}<div/><br>
				<div>${content}<div/><br>
			`
		};
		// const sendRedult = await transporter.sendMail( mail );
		// const error = sendRedult.error;
		// const info = sendRedult.info;

		// if ( error ) {
		// 	console.log( '錯誤:' );
		// 	console.log( error );

		// } else {
		// 	console.log( '信件已發送:' );
		// 	console.log( JSON.stringify( mail ) );
		// 	console.log( info.response );
		// }

	} catch ( error ) {
		console.log( error )
		return;
	}
}



module.exports = { getFile, getQueueLastIndex, sendMail };