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



const fs = require( 'fs' ) ;
const path = require( 'path' ) ;

const Promise = require( 'seventh' ) ;

const rimraf = require( 'rimraf' ) ;
const touch = require( 'touch' ) ;
const ncp = require( 'ncp' ) ;
const glob = require( 'glob' ) ;
const tmp = require( 'tmp' ) ;



const fsKit = {} ;
module.exports = fsKit ;



/*
	ensurePath( directoryPath , [mode] )

	Ensure a path exist, using mkdirp to create it.
	Arguments:
		* directoryPath
		* mode `number` octal permission, e.g. 0777, t defaults to 0777 & (~process.umask())
*/
fsKit.ensurePath = ( directoryPath , mode ) => {
	directoryPath = path.resolve( directoryPath ) ;
	if ( mode === undefined ) { mode = 0o777 & ( ~ process.umask() ) ; }
	return fs.promises.mkdir( directoryPath , { mode , recursive: true } ) ;
} ;



/*
	glob( pattern , [option] )

	Arguments:
		* pattern
		* options: see https://www.npmjs.com/package/glob
*/
fsKit.glob = Promise.promisify( glob ) ;



/*
	tmpFile( pattern , [option] )

	Arguments:
		* options: see https://www.npmjs.com/package/tmp
*/
fsKit.tmpFile = ( options = {} ) => {
	return new Promise( ( resolve , reject ) => {
		tmp.file( options , ( error , path_ , fd , cleanupCallback ) => {
			if ( error ) { reject( error ) ; }
			else { resolve( { fd , path: path_ , cleanup: cleanupCallback } ) ; }
		} ) ;
	} ) ;
} ;



/*
	tmpFile( pattern , [option] )

	Arguments:
		* options: see https://www.npmjs.com/package/tmp
*/
fsKit.tmpDir = ( options = {} ) => {
	return new Promise( ( resolve , reject ) => {
		tmp.dir( options , ( error , path_ , cleanupCallback ) => {
			if ( error ) { reject( error ) ; }
			else { resolve( { path: path_ , cleanup: cleanupCallback } ) ; }
		} ) ;
	} ) ;
} ;



/*
	deltree( globalFile , [options] )

	Options:
		maxBusyTries: If an EBUSY, ENOTEMPTY, or EPERM error code is encountered on Windows systems, then rimraf will
			retry with a linear backoff wait of 100ms longer on each try. The default maxBusyTries is 3.
		emfileWait: If an EMFILE error is encountered, then rimraf will retry repeatedly with a linear backoff of 1ms longer
			on each try, until the timeout counter hits this max. The default limit is 1000.
			If you repeatedly encounter EMFILE errors, then consider using graceful-fs in your program.
		glob: Set to false to disable glob pattern matching. Set to an object to pass options to the glob module.
			The default glob options are { nosort: true, silent: true }. Glob version 6 is used in this module.
		disableGlob: Set to any non-falsey value to disable globbing entirely. (Equivalent to setting glob: false.)

	Delete a file or many files (using glob wildcard)
*/
fsKit.deltree = Promise.promisify( rimraf ) ;



/*
	touch( filename , [options] )

	Like the unix command 'touch'.

	Options:
		force: like touch -f Boolean
		time: like touch -t <date> Can be a Date object, or any parseable Date string, or epoch ms number.
		atime: like touch -a Can be either a Boolean, or a Date.
		mtime: like touch -m Can be either a Boolean, or a Date.
		ref: like touch -r <file> Must be path to a file.
		nocreate: like touch -c Boolean
*/
fsKit.touch = Promise.promisify( touch ) ;



fsKit.recursiveParentSearch = async ( leftPart , rightPart ) => {
	var searchPath , nextLeftPart ;

	if ( ! rightPart ) {
		rightPart = path.basename( leftPart ) ;
		leftPart = path.dirname( leftPart ) ;
	}

	if ( ! path.isAbsolute( leftPart ) ) {
		leftPart = path.join( process.cwd() , leftPart ) ;
	}

	leftPart = path.normalize( leftPart ) ;
	rightPart = path.normalize( rightPart ) ;

	leftPart = await fs.promises.realpath( leftPart ) ;

	for ( ;; ) {
		searchPath = path.join( leftPart , rightPart ) ;

		try {
			await fs.promises.access( searchPath ) ;
			return searchPath ;
		}
		catch ( error ) {
			nextLeftPart = path.dirname( leftPart ) ;
			if ( nextLeftPart === leftPart ) { throw new Error( 'recursiveParentSearch(): file not found' ) ; }
			leftPart = nextLeftPart ;
		}
	}
} ;



/*
	Like fs.readdir(), but with more options.
	Eventually perform few fs.stat().
	Options:
		slash: `boolean` add an extra slash character to directories
		files: `undefined` or `boolean` filter out files/non-file
		directories: `undefined` or `boolean` filter out directories/non-directories
		exe: `undefined` or `boolean` filter out exe/non-exe, if the target is a file
*/
fsKit.readdir = async ( dirPath , options = {} ) => {
	var files , fsStatNeeded ;

	fsStatNeeded = options.slash ||
		options.directories !== undefined || options.files !== undefined ||
		options.exe !== undefined ;

	files = await fs.promises.readdir( dirPath , options ) ;

	if ( ! fsStatNeeded || ! files || ! files.length ) { return files ; }

	var outFiles = [] ;

	await Promise.concurrent( 10 , files , async ( file ) => {
		var stats ;

		try {
			stats = await fs.promises.stat( path.join( dirPath , file ) ) ;
		}
		catch ( error ) {
			console.error( "err:" , error ) ;
			// Dead links produce fs.stat() error, so ignore error for now
			return ;
		}

		if ( stats.isDirectory() ) {
			if ( options.directories === false ) { return ; }
			outFiles.push( options.slash ? file + '/' : file ) ;
		}
		else if ( stats.isFile() ) {
			if ( options.files === false ) { return ; }
			if ( options.exe !== undefined && options.exe !== fsKit.statsHasExe( stats ) ) { return ; }
			outFiles.push( file ) ;
		}
	} ) ;

	return outFiles ;
} ;



// See also github: kevva/executable (by Kevin Mårtensson)
fsKit.statsHasExe = stats => {
	if ( process.platform === 'win32' ) { return true ; }

	var groupMatch = stats.gid ? process.getgid && stats.gid === process.getgid() : true ;
	var userMatch = stats.uid ? process.getuid && stats.uid === process.getuid() : true ;

	return !! ( ( stats.mode & 0o001 ) || ( groupMatch && ( stats.mode & 0o010 ) ) || ( userMatch && ( stats.mode & 0o100 ) ) ) ;
} ;



// Copy a file
fsKit.copy = ( source , target ) => {
	var promise = new Promise() ,
		triggered = false ;

	var finish = error => {
		if ( triggered ) { return ; }
		if ( error ) { promise.reject( error ) ; }
		else { promise.resolve() ; }
	} ;

	// Create read and write stream
	var readStream = fs.createReadStream( source ) ;
	var writeStream = fs.createWriteStream( target ) ;

	// Manage events
	readStream.on( 'error' , finish ) ;
	writeStream.on( 'error' , finish ) ;
	writeStream.on( 'close' , () => finish() ) ;

	// Copy!
	readStream.pipe( writeStream ) ;

	return promise ;
} ;



/*
	copyDir( source , target , [options] )

	*source
	* target
	* options, where:
		* filter: RegExp instance, against which each file name is tested to determine whether to copy it or not,
		  or a function taking single parameter: copied file name, returning true or false, determining whether
		  to copy file or not.
		* transform: function: function (read, write) { read.pipe(write) } used to apply streaming transforms while copying.
		* clobber: boolean (default: true), if set to false, ncp will not overwrite destination files that already exist.
		* dereference: boolean (default: false), if set to true, ncp will follow symbolic links. For example,
		  a symlink in the source tree pointing to a regular file will become a regular file in the destination tree.
		  Broken symlinks will result in errors.
		* stopOnErr: boolean (default: false). If set to true, ncp will behave like cp -r, and stop on the first error
		  it encounters. By default, ncp continues copying, logging all errors and returning an array.
		* errs: stream. If options.stopOnErr is false, a stream can be provided, and errors will be written to this stream.
*/
fsKit.copyDir = ( source , target , options = {} ) => {
	var promise = new Promise() ;

	ncp( source , target , options , ( error ) => {
		if ( Array.isArray( error ) ) {
			// Shitty ncp return non-error, but array of errors most of time
			var newError = new Error( 'Copy directory failed: ' +
				error.map( ( e ) => { return e.message ; } ).join( ' ; ' )
			) ;

			newError.errors = error ;
			promise.reject( newError ) ;
		}
		else if ( error ) {
			promise.reject( error ) ;
		}
		else {
			promise.resolve() ;
		}
	} ) ;

	return promise ;
} ;



// Useless, but still here for backward compat'...
fsKit.isEmptyDir = async ( dirPath ) => {
	var files = await fs.promises.readdir( dirPath ) ;
	return ! files.length ;
} ;

