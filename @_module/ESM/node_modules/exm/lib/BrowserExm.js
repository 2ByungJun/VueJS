/*
	EXM

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



function Exm( options = {} ) {
	if ( ! options.ns ) { throw new Error( "EXM: namespace ('ns') is required!" ) ; }

	this.ns = options.ns ;
	this.extensionPath = options.extensionPath || '/ext' ;
	this.suffix = options.suffix || '/extension.js' ;

	this.api = options.api || {} ;
	this.exports = options.exports || {} ;

	this.extensions = new Map() ;
}

module.exports = Exm ;

Exm.prototype.__prototypeUID__ = 'exm/browser/Exm' ;
Exm.prototype.__prototypeVersion__ = '0.3' ;



Exm.ns = {} ;
Exm.registerNs = function( options = {} ) {
	if ( ! options.ns ) { throw new Error( "EXM: namespace ('ns' property) is required!" ) ; }
	if ( Exm.ns[ options.ns ] ) { throw new Error( "EXM: namespace '" + options.ns + "' is already registered!" ) ; }

	var exm = new Exm( options ) ;
	Exm.ns[ options.ns ] = exm ;
	return exm ;
} ;



Exm.prototype.requireExtension = async function( extName ) {
	if ( this.extensions.has( extName ) ) { return this.extensions.get( extName ) ; }

	var module_ ,
		extModulePath = this.extensionPath + '/' + extName + this.suffix ;

	try {
		console.warn( "Trying" , extModulePath ) ;
		module_ = await import( extModulePath ) ;
	}
	catch ( error ) {
		throw new Error( "Required extension '" + extName + "' not found." ) ;
	}


	if ( ! module_ || typeof module_ !== 'object' ) {
		throw new Error( "EXM: this is not an EXM Extension" ) ;
	}

	if ( module_.extension ) {
		// This is an ES6 module extension, the extension instance is exported as 'extension'
		module_ = module_.extension ;
	}
	else {
		// This is not an ES6 module (e.g. a CommonJS module), so import() somewhat failed except for side-effect.
		// And since Extension save itself on the global scope as a workaround, we will use that.
		module_ = global.EXM_EXTENSIONS && global.EXM_EXTENSIONS[ extName ] ;
		if ( ! module_ || typeof module_ !== 'object' ) {
			throw new Error( "EXM: this is not an EXM Extension" ) ;
		}
	}

	if ( ( module_.__prototypeUID__ !== 'exm/Extension' && module_.__prototypeUID__ !== 'exm/browser/Extension' ) ) {
		throw new Error( "EXM: this is not an EXM Extension" ) ;
	}

	if ( module_.id !== extName ) {
		throw new Error( "EXM: Extension ID mismatch (wanted '" + extName + "' but got " + module_.id + "'." ) ;
	}

	await module_.init( this ) ;
	this.extensions.set( extName , module_ ) ;
	return module_ ;
} ;



Exm.Extension = function( options = {} ) {
	this.isInit = false ;
	this.host = null ;	// the host Exm
	this.id = options.id || null ;
	this.require = options.require ;
	this.hooks = options.hooks || {} ;
	this.api = options.api || {} ;
	this.exports = options.exports || {} ;

	// Necessary for CommonJS modules:
	if ( ! global.EXM_EXTENSIONS ) { global.EXM_EXTENSIONS = {} ; }
	global.EXM_EXTENSIONS[ this.id ] = this ;
} ;

Exm.Extension.prototype.__prototypeUID__ = 'exm/browser/Extension' ;
Exm.Extension.prototype.__prototypeVersion__ = Exm.prototype.__prototypeVersion__ ;



Exm.Extension.prototype.init = function( host ) {
	if ( this.isInit ) { return ; }
	console.warn( "Extension loaded" , host ) ;
	this.isInit = true ;
	this.host = host ;

	if ( typeof this.hooks.init === 'function' ) { this.hooks.init() ; }
} ;

