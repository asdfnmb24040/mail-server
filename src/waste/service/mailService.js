//使用靜態文件做對列 (已棄用) 改用 bull
const fs = require( 'fs' );
const path = require( 'path' );
const common = require( '../utils/common' );

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
			fs.writeFileSync( path.resolve( __dirname, "../static/queue.json" ), JSON.stringify( queueDefault ) );
		}

		//檢查QueueInfo格式，格式錯誤則設為預設
		if ( checkType( 'queueInfo', queueInfo ) ) {
			//
		} else {
			if ( checkType( 'queue', queue ) ) {
				queueInfoDefault.index = common.getQueueLastIndex( queue ); //設定index初始值 (如果indx為0，則從對列最後繼續)
			}

			fs.writeFileSync( path.resolve( __dirname, "../static/queueInfo.json" ), JSON.stringify( queueInfoDefault ) );
		}
	} catch ( error ) {
		console.error( error )

		fs.writeFileSync( path.resolve( __dirname, "../static/queue.json" ), JSON.stringify( queueDefault ) );
		fs.writeFileSync( path.resolve( __dirname, "../static/queueInfo.json" ), JSON.stringify( queueInfoDefault ) );
	}


}

async function mailInterval () {
	console.log( '=== mailInterval ===' );
	const pauseTime = 2000;

	const interval = setInterval( async () => {
		//get queue and index
		const queue = await common.getFile( 'queue' )
		const queueInfo = await common.getFile( 'queueInfo' )

		if ( !checkType( 'queue', queue ) || !checkType( 'queueInfo', queueInfo ) ) {
			clearInterval( interval );
			console.error( 'file err: stop interval' )
			console.error( 'lastIndex: ', lastIndex );
		}

		// console.log( 'index => ', queueInfo.index )
		// console.log( 'queue => ', common.getQueueLastIndex( queue ) )

		//check if queue has new item
		if ( queueInfo.index == common.getQueueLastIndex( queue ) ) {
			// console.log( 'wait' )
			return;
		}

		console.log( 'index => ', queueInfo.index )
		console.log( 'queue => ', common.getQueueLastIndex( queue ) )

		//check next
		const next = queue.find( f => f.index === queueInfo.index + 1 );
		if ( !next ) {
			return;
		}

		continueNext( queueInfo, queue );
		await common.sendMail( next );
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

function continueNext ( queueInfo, queue ) {
	if ( queueInfo.index < common.getQueueLastIndex( queue ) ) {//有下一個的話，index + 1 
		console.log( 'index + 1' );
		queueInfo.index += 1
		fs.writeFileSync( path.resolve( __dirname, "../static/queueInfo.json" ), JSON.stringify( queueInfo ) );
	}

	console.log( 'continue' );
}

module.exports = { init, mailInterval }