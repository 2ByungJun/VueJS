
"use strict" ;


const Exm = new require( '..' ) ;
const exm = new Exm( {
	namespace: 'bob-sample' ,
	rootDir: __dirname ,
} ) ;

async function run() {
	exm.install( 'test' ) ;
}

run() ;


