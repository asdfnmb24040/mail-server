const fs = require( 'fs' );

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


module.exports = { getFile, getQueueLastIndex };