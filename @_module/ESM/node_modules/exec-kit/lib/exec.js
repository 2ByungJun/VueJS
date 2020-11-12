/*
	Exec Kit

	Copyright (c) 2020 Cédric Ronvel

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



const childProcess = require( 'child_process' ) ;
//const path = require( 'path' ) ;

const Promise = require( 'seventh' ) ;



const execKit = {} ;
module.exports = execKit ;



/*
	Options: all child_process.exec() options, and:

	* object: boolean (default: false), instead of returning stdout, return an object with:
		* stdout: stdout
		* stderr: stderr
*/
execKit.exec = ( command , options = {} ) => {
	var promise = new Promise() ;

	childProcess.exec( command , options , ( error , stdout , stderr ) => {
		if ( error ) {
			error.stdout = stdout ;
			error.stderr = stderr ;
			promise.reject( error ) ;
			return ;
		}

		if ( options.object ) {
			promise.resolve( { stdout , stderr } ) ;
		}
		else {
			promise.resolve( stdout ) ;
		}
	} ) ;

	return promise ;
} ;

