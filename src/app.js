const express = require( 'express' );
const bodyParser = require( 'body-parser' )
const rateLimit = require( "express-rate-limit" );
const cors = require( 'cors' );
const mail = require( './route/mail' );
const app = express();
const port = 3002;

const corsOptions = {
	origin: [
		'http://localhost:3000',
		'http://localhost:3001',
	],
	credentials: true,
	allowedHeaders: [ 'Content-Type', 'Authorization' ],
};
app.listen( port, () => {
	console.log( `app listening at http://localhost:${port}` )
} )


app.use( cors( corsOptions ) );
app.use( bodyParser.json() )
app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( '/mail', mail );

const fs = require( 'fs' );
const path = require( 'path' );
const mailConfig = require( './config/mailConfig' );
const nodemailer = require( 'nodemailer' );
const common = require( './utils/common' );

//init
( async () => {
	await init();
	await mailInterval();
} )();


async function init () {
	console.log( '=== init ===' );

	//default
	const queueDefault = []
	const queueInfoDefault = { index: 0 }

	try {
		const queue = await common.getFile( 'queue' )
		const queueInfo = await common.getFile( 'queueInfo' )

		//檢查Queue格式，格式錯誤則設為預設
		if ( checkType( 'queue', queue ) ) {
			//
		} else {
			fs.writeFileSync( path.resolve( __dirname, "./static/queue.json" ), JSON.stringify( queueDefault ) );
		}

		//檢查QueueInfo格式，格式錯誤則設為預設
		if ( checkType( 'queueInfo', queueInfo ) ) {
			//
		} else {
			if ( checkType( 'queue', queue ) ) {
				queueInfoDefault.index = common.getQueueLastIndex( queue ); //設定index初始值 (如果indx為0，則從對列最後繼續)
			}

			fs.writeFileSync( path.resolve( __dirname, "./static/queueInfo.json" ), JSON.stringify( queueInfoDefault ) );
		}
	} catch ( error ) {
		console.error( error )

		fs.writeFileSync( path.resolve( __dirname, "./static/queue.json" ), JSON.stringify( queueDefault ) );
		fs.writeFileSync( path.resolve( __dirname, "./static/queueInfo.json" ), JSON.stringify( queueInfoDefault ) );
	}


}

async function mailInterval () {
	console.log( '=== mailInterval ===' );
	const pauseTime = 1000;
	let lastIndex = null;

	const interval = setInterval( async () => {
		//get queue and index
		const queue = await common.getFile( 'queue' )
		const queueInfo = await common.getFile( 'queueInfo' )

		if ( !checkType( 'queue', queue ) || !checkType( 'queueInfo', queueInfo ) ) {
			clearInterval( interval );
			console.error( 'file err: stop interval' )
			console.error( 'lastIndex: ', lastIndex );
		}

		console.log( 'index => ', queueInfo.index )
		console.log( 'queue => ', common.getQueueLastIndex( queue ) )

		//check if queue has new item
		if ( queueInfo.index == common.getQueueLastIndex( queue ) ) {
			console.log( 'wait' )
			return;
		}

		//check next
		const next = queue.find( f => f.index === queueInfo.index + 1 );
		if ( !next ) {
			//保存Index
			continueNext( queueInfo, queue );
			return;
		}

		lastIndex = next.index;

		sendMail( next )

		//保存Index
		continueNext( queueInfo, queue );
		return;

	}, pauseTime );



}

function checkType ( name, obj ) {
	switch ( name ) {
		case 'queue':
			return !!obj && Array.isArray( obj )
		case 'queueInfo':
			return !!obj && obj.index !== undefined && typeof ( obj.index ) === 'number'
		default:
			break;
	}
	return false;
}

function sendMail ( mailItem ) {
	//send mail
	try {
		const { senderName, mailAddress, phoneNum, companyName, content, index } = mailItem;

		if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
			console.log( '欄位檢核失敗', { next } );
			return;
		}

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

		transporter.sendMail( mail, ( error, info ) => {
			if ( error ) {
				console.log( '錯誤:' );
				console.log( error );

			} else {
				console.log( '信件已發送:' );
				console.log( JSON.stringify( mail ) );
				console.log( info.response );
			}
			return;
		} );
		// console.log( 'send test' )
		// return;

	} catch ( error ) {
		console.log( error )
		return;
	}
}

function continueNext ( queueInfo, queue ) {
	if ( queueInfo.index < common.getQueueLastIndex( queue ) ) {//有下一個的話，index + 1 
		console.log( 'index + 1' );
		queueInfo.index += 1
		fs.writeFileSync( path.resolve( __dirname, "./static/queueInfo.json" ), JSON.stringify( queueInfo ) );
	}

	console.log( 'continue' );
}




