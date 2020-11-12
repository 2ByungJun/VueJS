#!/usr/bin/env node
/*
	File System Kit

	Copyright (c) 2015 - 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;

const fsKit = require( '..' ) ;

async function cli() {
	var path ;
	
	if ( process.argv[ 3 ] ) {
		console.log( 'Searching for: %s   from: %s' , process.argv[ 3 ] , process.argv[ 2 ] ) ;
		
		try {
			path = await fsKit.recursiveParentSearch( process.argv[ 2 ] , process.argv[ 3 ] ) ;
			console.log( 'Found:' , path ) ;
		}
		catch ( error ) {
			console.log( error ) ;
		}
	}
	else {
		console.log( 'Searching for:' , process.argv[ 2 ] ) ;
		
		try {
			path = await fsKit.recursiveParentSearch( process.argv[ 2 ] ) ;
			console.log( 'Found:' , path ) ;
		}
		catch ( error ) {
			console.log( error ) ;
		}
	}
}

cli() ;

