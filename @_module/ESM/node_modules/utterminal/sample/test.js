#!/usr/bin/env node
/*
	Utterminal

	Copyright (c) 2018 - 2019 Cédric Ronvel

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



var term = require( 'terminal-kit' ).terminal ;
var string = require( 'string-kit' ) ;
var logfella = require( 'logfella' ) ;

function deb( description , variable ) {
	console.log( description + ':\n' + string.inspect( { style: 'color' } , variable ) ) ;
}

//deb( "argv" , process.argv ) ;

var cli = require( '..' ).cli
	.package( require( '../package.json' ) )
	//.usage( '--name <name> [--age <age>]' )
	.commonCommands
	//.commonOptions
	.helpOption
	.addLogOptions( { mon: true } )
	//.setIntro( false )
	//.details( "mlsjdflmjslk" )
	.opt( 'auto' )
		.typeLabel( 'auto-type' )
		.description( 'an option with auto type' )
	.optionGroup( 'General information options' )
		.opt( [ "name" , "n" ] , "bob" ).string//.mandatory
		//.opt( [ "name" , "nsqmlfjkml" , "ansqmlfjkml" , "znsqmlfjkml" , "ensqmlfjkml" , "rnsqmlfjkml" , "tnsqmlfjkml" , "ynsqmlfjkml" , "unsqmlfjkml" , "insqmlfjkml" , "onsqmlfjkml" ] , "bob" ).string.mandatory
			.description( "your name" )
			//.description( "enter here your name enter here your name enter here your name enter here your name enter here your name enter here your name enter here your name" )
		.opt( [ "age" , "a" ] ).number
			.description( "your age" )
		.opt( [ "town" , "t" ] ).string
			.typeLabel( 'town' )
			.description( "your town" )
	.command( [ 'bob' , 'b' ] ) .description( 'It bobs everything up' )
		//.details( "mlsjdflmjslk" )
		.arg( 'thing' ).description( 'The thing to bob' )
		.restArgs( 'secondaryThings' ).description( 'More things to bob' )
		.opt( 'supa' , false ).boolean
			.description( 'Enhance bobbing more' )
		.opt( 'supa' , false ).boolean
			.description( 'Enhance bobbing more' )
		.opt( 'hyper' , false ).boolean
			.description( 'Enhance bobbing even more' )
		.opt( 'level' , 0 ).number
			.description( 'Bobbing level' )
		.opt( 'max' ).boolean.shorthand( { supa: true , hyper: true , level: 5 } )
			.description( 'Maximally enhance bobbing' )
	;


/*
deb( "Parser" , cli ) ;
var args = cli.parse() ;
deb( "CLI options" , args ) ;
*/

var args = cli.run() ;
deb( "CLI arguments" , args ) ;

var log = logfella.global.use( 'test' ) ;
log.debug( "debug" ) ;
log.trace( "trace" ) ;
