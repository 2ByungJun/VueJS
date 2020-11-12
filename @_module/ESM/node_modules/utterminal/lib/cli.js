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



const termkit = require( 'terminal-kit' ) ;
const term = termkit.terminal ;
//const doormen = require( 'doormen' ) ;
const string = require( 'string-kit' ) ;
const tree = require( 'tree-kit' ) ;
const path = require( 'path' ) ;
//const lazy = require( 'lazyness' ) ;

function noop() {}



function Cli( names ) {
	this.restArgsKeyName = 'rest' ;	// property name of the array where to put non-key'd options, if any
	this.commandKeyName = 'command' ;	// property name of the command, if any
	this.commandOptionsKeyName = 'commandOptions' ;	// when commandSplit is on, this is property name of the command option sub-tree, if any
	this.negativePrefix = 'no-' ;	// the prefix for false flags
	this.strictMode = false ;	// if set, it throws on unknown options
	this.inheritOptions = false ;	// if set, sub-CLI inherit all options of the master-CLI
	this.camelCase = false ;	// add a final camelCase pass

	// Options
	this.aliasOptions = {} ;
	this.canonicalOptions = {} ;
	this.argOptions = [] ;	// options without flag, still converted in the K/V
	this.restArgsOption = null ;	// options without flag, remainder of named arg, are stacked in an array
	this.flagOptions = [] ;	// K/V option or flag options
	this.options = [] ;	// All options
	this.lastOptionGroup = 'Options' ;
	this.lastOption = null ;

	// Sub-CLI
	this.group = null ;	// the group this sub-CLI belongs to
	this.canonical = null ;	// for sub-CLI, this is the command name
	this.aliases = null ;	// for sub-CLI, this is the command aliases
	this.aliasCommands = {} ;	// child command/sub-CLI
	this.canonicalCommands = {} ;	// child command/sub-CLI
	this.commands = [] ;
	this.isCommandRequired = false ;	// if set and if commands are registered, a command in the command line is required
	this.lastCommandGroup = 'Commands' ;
	this.commandSplit = false ;	// if true, command options are put in a subtree
	this.execFn = [] ;
	this.activeCli = this ;	// active sub-CLI

	if ( names ) {
		if ( ! Array.isArray( names ) ) { names = [ names ] ; }
		this.canonical = names[ 0 ] ;
		this.aliases = names.slice( 1 ) ;
	}


	// App information
	this.packageJson = null ;
	this.appName = null ;
	this.appAuthor = null ;
	this.appVersion = null ;
	this.appLicense = null ;
	this.appBaseline = null ;
	this.appDescription = null ;
	this.appDetails = null ;
	this.appReleaseDate = null ;
	this.appExe = null ;

	this.usageString = null ;

	// Runtime
	this.playIntro = true ;
	this.parsedArgs = null ;
	this.toExec = null ;
}



// Constants
Cli.ARG = Cli.prototype.ARG = {} ;



// App
Cli.prototype.package = function( packageJson ) { this.packageJson = packageJson ; return this ; } ;
Cli.prototype.name = function( appName ) { this.appName = appName ; return this ; } ;
Cli.prototype.author = function( appAuthor ) { this.appAuthor = appAuthor ; return this ; } ;
Cli.prototype.version = function( appVersion ) { this.appVersion = appVersion ; return this ; } ;
Cli.prototype.license = function( appLicense ) { this.appLicense = appLicense ; return this ; } ;
Cli.prototype.date = function( appReleaseDate ) { this.appReleaseDate = appReleaseDate ; return this ; } ;
Cli.prototype.exe = function( appExe ) { this.appExe = appExe ; return this ; } ;

Cli.prototype.app = function( data ) {
	if ( typeof data === 'string' ) { return this.name( data ) ; }
	if ( ! data || typeof data !== 'object' ) { return this ; }

	if ( data.package ) { this.package( data.package ) ; }

	if ( data.name ) { this.name( data.name ) ; }
	if ( data.author ) { this.author( data.author ) ; }
	if ( data.version ) { this.version( data.version ) ; }
	if ( data.license ) { this.license( data.license ) ; }
	if ( data.date ) { this.date( data.date ) ; }
	if ( data.exe ) { this.exe( data.exe ) ; }

	if ( data.description ) { this.appDescription = data.description ; }
	if ( data.baseline ) { this.appBaseline = data.baseline ; }

	return this ;
} ;

// Global options
Cli.prototype.commandKey = function( commandKeyName ) { this.commandKeyName = commandKeyName ; return this ; } ;
Cli.prototype.commandOptionsKey = function( commandOptionsKeyName ) { this.commandOptionsKeyName = commandOptionsKeyName ; return this ; } ;
Cli.prototype.negative = function( negativePrefix ) { this.negativePrefix = negativePrefix ; return this ; } ;
Cli.prototype.negative = function( negativePrefix ) { this.negativePrefix = negativePrefix ; return this ; } ;

Cli.prototype.setStrict = function( value = true ) {
	this.strictMode = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'strict' , {
	get: function() { return this.setStrict() ; }
} ) ;

Cli.prototype.setInherit = function( value = true ) {
	this.inheritOptions = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'inherit' , {
	get: function() { return this.setInherit() ; }
} ) ;

Cli.prototype.setSplit = function( value = true ) {
	this.commandSplit = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'split' , {
	get: function() { return this.setSplit() ; }
} ) ;

Cli.prototype.setIntro = function( value = true ) {
	this.playIntro = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'noIntro' , {
	get: function() { return this.setIntro( false ) ; }
} ) ;

Object.defineProperty( Cli.prototype , 'introIfTTY' , {
	get: function() { return this.setIntro( !! process.stdout.isTTY ) ; }
} ) ;

Cli.prototype.setCommandRequired = function( value = true ) {
	if ( this.activeCli.lastOption ) { throw new Error( ".setMandatoryCommand() should be called before adding options" ) ; }

	this.isCommandRequired = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'commandRequired' , {
	get: function() { return this.setCommandRequired( true ) ; }
} ) ;



// Commands
Cli.prototype.commandGroup = function( groupName ) {
	this.lastCommandGroup = groupName ;
	return this ;
} ;



Cli.prototype.command = function( names ) {
	var pseudoOption ;

	var subCli = new Cli( names ) ;
	subCli.group = this.lastCommandGroup ;

	if ( this.inheritOptions ) {
		Object.assign( subCli.aliasOptions , this.aliasOptions ) ;
		Object.assign( subCli.canonicalOptions , this.canonicalOptions ) ;
		subCli.argOptions = this.argOptions.slice() ;
		subCli.restArgsOption = this.restArgsOption ;
		subCli.options = this.options.slice() ;
	}

	subCli.aliases.forEach( alias => this.aliasCommands[ alias ] = subCli ) ;
	this.canonicalCommands[ subCli.canonical ] = subCli ;

	if ( ! this.commands.length ) {
		pseudoOption = new Option( this.commandKeyName , undefined , true ) ;
		pseudoOption.group = 'Arguments' ;
		pseudoOption.description = 'The action to execute' ;

		this.activeCli.argOptions.unshift( pseudoOption ) ;
		this.activeCli.canonicalOptions[ pseudoOption.canonical ] = pseudoOption ;
		this.activeCli.options.push( pseudoOption ) ;
	}

	this.commands.push( subCli ) ;
	this.activeCli = subCli ;

	return this ;
} ;



// Per CLI/Sub-CLI
Cli.prototype.usage = function( str ) { this.activeCli.usageString = str ; return this ; } ;



//Cli.prototype.group =	// <-- this is already a member property
Cli.prototype.optionGroup = function( groupName ) {
	this.activeCli.lastOptionGroup = groupName ;
	return this ;
} ;



function Option( names , defaultValue , isArg ) {
	if ( ! Array.isArray( names ) ) { names = [ names ] ; }

	this.isArg = !! isArg ;
	this.canonical = names[ 0 ] ;
	this.aliases = names.slice( 1 ) ;
	this.default = defaultValue ;
	this.type = 'auto' ;
	this.typeLabel = null ;
	this.isArrayOf = false ;
	this.isFlag = false ;
	this.isConfig = false ;
	this.sanitizer = noop ;
	this.mandatory = false ;
	this.exclusive = false ;
	this.description = null ;
	this.group = null ;
	this.imply = null ;
	this.remove = null ;	// When .imply is set, .remove will remove that option from the final parsed arguments
	this.execFn = null ;
}



Cli.prototype.opt =
Cli.prototype.option = function( names , defaultValue ) {
	var option = new Option( names , defaultValue ) ;
	option.group = this.activeCli.lastOptionGroup ;

	this.activeCli.flagOptions.push( option ) ;
	option.aliases.forEach( alias => this.activeCli.aliasOptions[ alias ] = option ) ;
	this.activeCli.canonicalOptions[ option.canonical ] = option ;
	this.activeCli.options.push( option ) ;
	this.activeCli.lastOption = option ;

	return this ;
} ;



Cli.prototype.arg =
Cli.prototype.argument = function( key , defaultValue ) {
	var option = new Option( key , defaultValue , true ) ;

	option.group = 'Arguments' ;

	this.activeCli.argOptions.push( option ) ;
	this.activeCli.canonicalOptions[ option.canonical ] = option ;
	this.activeCli.options.push( option ) ;
	this.activeCli.lastOption = option ;

	return this ;
} ;



Cli.prototype.restArgs =
Cli.prototype.restArguments = function( key , defaultEmptyArray ) {
	var option = new Option( key , defaultEmptyArray ? [] : undefined , true ) ;

	option.isArrayOf = true ;
	option.group = 'Arguments' ;

	this.restArgsKeyName = key ;

	this.activeCli.restArgsOption = option ;
	this.activeCli.canonicalOptions[ option.canonical ] = option ;
	this.activeCli.options.push( option ) ;
	this.activeCli.lastOption = option ;

	return this ;
} ;



Cli.prototype.setMandatory = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setMandatory() called before adding options" ) ; }

	this.activeCli.lastOption.mandatory = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'mandatory' , {
	get: function() { return this.setMandatory() ; }
} ) ;

Object.defineProperty( Cli.prototype , 'required' , {
	get: function() { return this.setMandatory() ; }
} ) ;



Cli.prototype.setExclusive = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setExclusive() called before adding an option" ) ; }

	this.activeCli.lastOption.exclusive = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'exclusive' , {
	get: function() { return this.setExclusive() ; }
} ) ;



Cli.prototype.setCamelCase = function( value = true ) {
	this.camelCase = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'camel' , {
	get: function() { return this.setCamelCase() ; }
} ) ;



Cli.prototype.exec = function( fn ) {
	if ( ! this.activeCli.lastOption ) {
		this.activeCli.execFn.push( fn ) ;
	}
	else {
		this.activeCli.lastOption.execFn = fn ;
	}

	return this ;
} ;



Cli.prototype.setType = function( type ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setType() called before adding an option" ) ; }

	this.activeCli.lastOption.type = type ;
	return this ;
} ;

[ 'boolean' , 'string' , 'number' , 'integer' , 'object' ].forEach( type => {
	Object.defineProperty( Cli.prototype , type , {
		get: function() { return this.setType( type ) ; }
	} ) ;
} ) ;



Cli.prototype.typeLabel = function( ... typeLabel ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".typeLabel() called before adding an option" ) ; }

	this.activeCli.lastOption.typeLabel = typeLabel.length > 1 ? typeLabel : typeLabel[ 0 ] ;
	return this ;
} ;



Cli.prototype.setArrayOf = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setArrayOf() called before adding an option" ) ; }

	this.activeCli.lastOption.isArrayOf = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'arrayOf' , {
	get: function() { return this.setArrayOf() ; }
} ) ;

Object.defineProperty( Cli.prototype , 'array' , {
	get: function() { return this.setArrayOf() ; }
} ) ;



Cli.prototype.setFlag = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setFlag() called before adding an option" ) ; }

	this.activeCli.lastOption.isFlag = !! value ;
	if ( value ) { this.activeCli.lastOption.type = 'boolean' ; }
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'flag' , {
	get: function() { return this.setFlag() ; }
} ) ;



Cli.prototype.default = function( defaultValue ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".default() called before adding an option" ) ; }

	this.activeCli.lastOption.default = defaultValue ;
	return this ;
} ;



// Set what other options/arguments are implied by this option
Cli.prototype.imply = function( object ) {
	if ( ! object || typeof object !== 'object' ) { return ; }
	if ( ! this.activeCli.lastOption ) { throw new Error( ".imply() called before adding an option" ) ; }

	if ( this.activeCli.lastOption.imply ) {
		Object.assign( this.activeCli.lastOption.imply , object ) ;
	}
	else {
		this.activeCli.lastOption.imply = object ;
	}

	return this ;
} ;



// Same than imply, but the shorthand option will be removed from the final parsed arguments, and the flag-mode is set on it
Cli.prototype.shorthand = function( object ) {
	if ( ! object || typeof object !== 'object' ) { return ; }
	if ( ! this.activeCli.lastOption ) { throw new Error( ".shortHand() called before adding an option" ) ; }

	if ( this.activeCli.lastOption.imply ) {
		Object.assign( this.activeCli.lastOption.imply , object ) ;
	}
	else {
		this.activeCli.lastOption.imply = object ;
	}

	this.activeCli.lastOption.remove = true ;
	this.setFlag( true ) ;

	return this ;
} ;



Cli.prototype.setRemove = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setRemove() called before adding an option" ) ; }

	this.activeCli.lastOption.remove = !! value ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'remove' , {
	get: function() { return this.setRemove() ; }
} ) ;



Cli.prototype.setConfig = function( value = true ) {
	if ( ! this.activeCli.lastOption ) { throw new Error( ".setConfig() called before adding an option" ) ; }

	this.activeCli.lastOption.isConfig = !! value ;
	this.activeCli.lastOption.type = 'string' ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'config' , {
	get: function() { return this.setConfig() ; }
} ) ;



// Set either the app description or the option description
Cli.prototype.description = function( str ) {
	if ( ! this.activeCli.lastOption ) {
		this.activeCli.appDescription = str ;
		return this ;
	}

	this.activeCli.lastOption.description = str ;
	return this ;
} ;



// Set the app baseline / short-description
Cli.prototype.baseline = function( str ) {
	this.activeCli.appBaseline = str ;
	return this ;
} ;



// Set some in-depth details
Cli.prototype.details = function( str ) {
	this.activeCli.appDetails = str ;
	return this ;
} ;





/* Now the real thing */



Cli.prototype.parseOnly = function( raw = process.argv.slice( 2 ) , masterCli = this ) {
	var args = {} , part , chars , argOptionsIndex = 0 , index , j , indexOfEq , afterDoubleDash = false ,
		subCli , subCliArgs , error , implied = {} ;

	if ( this === masterCli ) { this.parsedArgs = args ; }

	var setKeyValue = ( key , value , strictCheck ) => {
		var option , isFlag = false ;

		if ( this.aliasOptions[ key ] ) {
			key = this.aliasOptions[ key ].canonical ;
		}

		if ( key === masterCli.restArgsKeyName && ! args[ masterCli.restArgsKeyName ] ) {
			// If present, it is always an array
			args[ masterCli.restArgsKeyName ] = [] ;
		}

		option = this.canonicalOptions[ key ] ;

		if ( option ) {
			isFlag = option.isFlag ;
			if ( isFlag ) { value = !! value ; }

			if ( option.imply ) {
				Object.assign( implied , this.substitute( option.imply , value ) ) ;
				if ( option.remove ) { return isFlag ; }
			}
		}
		else if ( strictCheck && masterCli.strictMode ) {
			error = new Error( "Unknown option '" + key + "'" ) ;
			error.code = 'unknownOption' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;
		}

		tree.path.autoPush( args , key , value ) ;

		return isFlag ;
	} ;

	for ( index = 0 ; index < raw.length ; index ++ ) {
		part = raw[ index ] ;

		if ( afterDoubleDash || part === '-' || part[ 0 ] !== '-' ) {
			if ( this.commands.length ) {
				// This is a command: start over inside the subCli
				subCli = this.canonicalCommands[ part ] || this.aliasCommands[ part ] ;

				if ( ! subCli ) {
					// Issue the error now, because we can't parse the end of the argument array
					error = new Error( "Unknown command '" + part + '"' ) ;
					error.code = 'unknownCommand' ;
					error.what = part ;
					error.cli = this ;
					error.user = true ;
					throw error ;
				}

				args[ masterCli.commandKeyName ] = subCli.canonical ;
				subCliArgs = subCli.parseOnly( raw.slice( index + 1 ) , this ) ;

				if ( masterCli.commandSplit ) {
					args[ masterCli.commandOptionsKeyName ] = subCliArgs ;
				}
				else {
					Object.assign( args , subCliArgs ) ;
				}

				// Add implied args before exiting
				Object.assign( args , implied ) ;
				return args ;
			}

			// This is a value
			if ( argOptionsIndex < this.argOptions.length ) {
				setKeyValue( this.argOptions[ argOptionsIndex ].canonical , part ) ;
			}
			else if ( this.restArgsOption ) {
				setKeyValue( this.restArgsOption.canonical , part ) ;
			}
			else if ( masterCli.strictMode ) {
				// We are in strict mode, but rest args where not defined!
				error = new Error( "Unknown argument #" + argOptionsIndex + " '" + part + "'" ) ;
				error.code = 'unknownArgument' ;
				error.key = argOptionsIndex ;
				error.what = part ;
				error.cli = this ;
				error.user = true ;
				throw error ;
			}
			else {
				setKeyValue( masterCli.restArgsKeyName , part ) ;
			}

			argOptionsIndex ++  ;

			continue ;
		}

		// Anything below start with at least one - and have more chars

		if ( part[ 1 ] !== '-' ) {
			// This is one or many single char options
			chars = string.unicode.toArray( part.slice( 1 ) ) ;

			// The first options are boolean
			for ( j = 0 ; j < chars.length - 1 ; j ++ ) {
				setKeyValue( chars[ j ] , true , true ) ;
			}

			// The last option can be a boolean or get a value from the next part
			if ( index < raw.length - 1 && raw[ index + 1 ][ 0 ] !== '-' ) {
				// If setKeyValue() return true if it is a flag and the value was not used
				setKeyValue( chars[ chars.length - 1 ] , raw[ index + 1 ] , true ) || index ++ ;
			}
			else {
				setKeyValue( chars[ chars.length - 1 ] , true , true ) ;
			}

			continue ;
		}

		// Anything below start with two --

		if ( part === '--' ) {
			afterDoubleDash = true ;
			continue ;
		}

		// Just strip those --
		part = part.slice( 2 ) ;

		if ( part.startsWith( masterCli.negativePrefix ) ) {
			// So this is a boolean, it couldn't be followed by a value
			setKeyValue( part.slice( masterCli.negativePrefix.length ) , false , true ) ;
			continue ;
		}

		indexOfEq = part.indexOf( '=' ) ;

		if ( indexOfEq !== -1 ) {
			// So this is an option of the type --option=something
			setKeyValue( part.slice( 0 , indexOfEq ) , part.slice( indexOfEq + 1 ) , true ) ;
			continue ;
		}

		// Finally, try to get a value on the next part, or it is a boolean
		if ( index < raw.length - 1 && ( raw[ index + 1 ] === '-' || raw[ index + 1 ][ 0 ] !== '-' ) ) {
			// If setKeyValue() return true if it is a flag and the value was not used
			setKeyValue( part , raw[ index + 1 ] , true ) || index ++ ;
		}
		else {
			setKeyValue( part , true , true ) ;
		}
	}

	// Add implied args before exiting
	Object.assign( args , implied ) ;
	return args ;
} ;



Cli.prototype.parse = function( raw ) {
	this.parseOnly( raw ) ;
	this.postProcess() ;
	return this.parsedArgs ;
} ;



Cli.prototype.postProcess = function( args = this.parsedArgs ) {
	var subCli , subArgs , isCommand = false , error , option , hasExclusive = false ;

	this.toExec = [] ;

	if ( this.isCommandRequired && this.commands.length && ! args[ this.commandKeyName ] ) {
		error = new Error( "Missing command" ) ;
		error.code = 'missingCommand' ;
		error.cli = this ;
		error.user = true ;
		throw error ;
	}

	if ( args[ this.commandKeyName ] ) {
		isCommand = true ;
		subCli = this.canonicalCommands[ args[ this.commandKeyName ] ] ;
		subArgs = this.commandSplit ? args[ this.commandOptionsKeyName ] : args ;
	}


	// First add all CLI hooks
	if ( this.execFn.length ) {
		this.execFn.forEach( execFn => this.toExec.push( execFn.bind( undefined , this , args , subCli , subArgs ) ) ) ;
	}


	// Check each user option
	Object.keys( args ).forEach( key => {
		// We don't touch those keys
		if ( key === this.commandKeyName || key === this.commandOptionsKeyName ) {
			return ;
		}

		if ( isCommand && ! this.commandSplit ) {
			option = subCli.canonicalOptions[ key ] || this.canonicalOptions[ key ] ;
		}
		else {
			option = this.canonicalOptions[ key ] ;
		}

		if ( option ) {
			args[ key ] = this.cast( key , args[ key ] , option.type , option.isArrayOf ) ;

			if ( option.isConfig ) { this.loadConfig( args[ key ] , args , key ) ; }

			if ( ! hasExclusive ) {
				if ( option.exclusive ) {
					hasExclusive = true ;

					if ( option.execFn ) {
						this.toExec.length = 0 ;	// Remove all non-exclusive functions
						this.toExec.push( option.execFn.bind( undefined , this , args ) ) ;
					}
				}
				else if ( option.execFn ) {
					this.toExec.push( option.execFn.bind( undefined , this , args ) ) ;
				}
			}
		}
		else if ( key === this.restArgsKeyName ) {
			return ;
		}
		else {
			// If unknown, cast to 'auto'
			args[ key ] = this.cast( key , args[ key ] , 'auto' ) ;
		}
	} ) ;

	if ( isCommand && subCli.execFn.length ) {
		subCli.execFn.forEach( execFn => this.toExec.push( execFn.bind( undefined , this , args , subCli , subArgs ) ) ) ;
	}

	if ( isCommand && this.commandSplit ) {
		// Check each command user option
		Object.keys( subArgs ).forEach( key => {

			option = subCli.canonicalOptions[ key ] ;

			if ( option ) {
				subArgs[ key ] = subCli.cast( key , subArgs[ key ] , option.type , option.isArrayOf ) ;

				if ( option.isConfig ) { subCli.loadConfig( subArgs[ key ] , subArgs , key ) ; }

				if ( ! hasExclusive ) {
					if ( option.exclusive ) {
						hasExclusive = true ;

						if ( option.execFn ) {
							this.toExec.length = 0 ;	// Remove all non-exclusive functions
							this.toExec.push( option.execFn.bind( undefined , this , args , subCli , subArgs ) ) ;
						}
					}
					else if ( option.execFn ) {
						this.toExec.push( option.execFn.bind( undefined , this , args , subCli , subArgs ) ) ;
					}
				}
			}
			else if ( key === this.restArgsKeyName ) {
				return ;
			}
			else {
				// If unknown, cast to 'auto'
				subArgs[ key ] = subCli.cast( key , subArgs[ key ] , 'auto' ) ;
			}
		} ) ;
	}

	// Default values and mandatory check option existence
	this.options.forEach( option_ => {
		if ( ! ( option_.canonical in args ) ) {
			if ( option_.default !== undefined ) {
				args[ option_.canonical ] = option_.default ;
			}
			else if ( ! hasExclusive && option_.mandatory ) {
				error = new Error( "Mandatory option '" + option_.canonical + "' missing" ) ;
				error.code = 'missingOption' ;
				error.key = option_.canonical ;
				error.cli = this ;
				error.user = true ;
				throw error ;
			}
		}
	} ) ;

	// Check for command's mandatory option existence
	if ( isCommand ) {
		subCli.options.forEach( option_ => {
			if ( ! ( option_.canonical in subArgs ) ) {
				if ( option_.default !== undefined ) {
					subArgs[ option_.canonical ] = option_.default ;
				}
				else if ( ! hasExclusive && option_.mandatory ) {
					error = new Error( "Mandatory option '" + option_.canonical + "' missing" ) ;
					error.code = 'missingOption' ;
					error.key = option_.canonical ;
					error.cli = subCli ;
					error.user = true ;
					throw error ;
				}
			}
		} ) ;
	}

	// camelCase pass
	if ( this.camelCase ) {
		if ( subArgs && subArgs !== args ) { this.toCamelCase( subArgs ) ; }
		this.toCamelCase( args ) ;
	}

	// Function execution should be post-poned, or they would have non-sanitized data
	//this.toExec.forEach( fn => fn() ) ;

	return args ;
} ;



Cli.prototype.cast = function( key , value , type , isArrayOf = false ) {
	var error , casted ;

	if ( isArrayOf ) {
		if ( Array.isArray( value ) ) { casted = value ; }
		else if ( ! value || typeof value !== 'object' ) { casted = [ value ] ; }

		if ( Array.isArray( casted ) ) {
			return casted.map( e => this.cast( key , e , type ) ) ;
		}

		error = new Error( "Bad type for option '" + key + "', expecting an array but got '" + value +  "'" ) ;
		error.code = 'badType' ;
		error.key = key ;
		error.what = value ;
		error.cli = this ;
		error.user = true ;
		throw error ;
	}

	switch ( type ) {
		case 'auto' :
			// It accepts everything, but convert to number when possible
			if ( Array.isArray( value ) ) {
				return value.map( e => this.cast( key , e , 'auto' ) ) ;
			}

			if ( value === true || value === false ) { return value ; }

			casted = + value ;
			if ( ! Number.isNaN( casted ) ) { return casted ; }

			return value ;

		case 'boolean' :
			if ( value === true || value === false ) { return value ; }
			if ( value === 'true' || value === 'on' || value === 'yes' || value === '1' ) { return true ; }
			if ( value === 'false' || value === 'off' || value === 'no' || value === '0' ) { return false ; }

			error = new Error( "Bad type for option '" + key + "', expecting a boolean but got '" + value +  "'" ) ;
			error.code = 'badType' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;

		case 'string' :
			if ( typeof value === 'string' ) { return value ; }

			error = new Error( "Bad type for option '" + key + "', expecting a string but got '" + value +  "'" ) ;
			error.code = 'badType' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;

		case 'number' :
			if ( value !== true && value !== false ) {
				casted = + value ;
				if ( ! Number.isNaN( casted ) ) { return casted ; }
			}

			error = new Error( "Bad type for option '" + key + "', expecting a number but got '" + value +  "'" ) ;
			error.code = 'badType' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;

		case 'integer' :
			if ( value !== true && value !== false ) {
				casted = + value ;
				if ( ! Number.isNaN( casted ) && casted === Math.round( casted ) ) { return casted ; }
			}

			error = new Error( "Bad type for option '" + key + "', expecting an integer but got '" + value +  "'" ) ;
			error.code = 'badType' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;

		case 'object' :
			if ( value && typeof value === 'object' && ! Array.isArray( value ) ) { return value ; }

			error = new Error( "Bad type for option '" + key + "', expecting an object but got '" + value +  "'" ) ;
			error.code = 'badType' ;
			error.key = key ;
			error.what = value ;
			error.cli = this ;
			error.user = true ;
			throw error ;
	}
} ;



Cli.prototype.toCamelCase = function( object ) {
	Object.keys( object ).forEach( key => {
		var camelKey = string.toCamelCase( key , true ) ;

		if ( camelKey !== key ) {
			object[ camelKey ] = object[ key ] ;
			delete object[ key ] ;
		}
	} ) ;
} ;



Cli.prototype.substitute = function( object , value ) {
	var nested , output = object ;

	Object.keys( object ).forEach( key => {
		if ( object[ key ] === Cli.ARG ) {
			if ( output === object ) {
				// Make a shallow copy, if not already done
				output = Object.assign( {} , object ) ;
			}

			output[ key ] = value ;
		}

		if ( object[ key ] && typeof object[ key ] === 'object' ) {
			nested = this.substitute( object[ key ] , value ) ;

			if ( nested !== object[ key ] ) {
				if ( output === object ) {
					// Make a shallow copy, if not already done
					output = Object.assign( {} , object ) ;
				}

				output[ key ] = nested ;
			}
		}
	} ) ;

	return output ;
} ;



Cli.prototype.run = function() {
	this.mergeInfo() ;

	try {
		this.parse() ;
	}
	catch ( error ) {
		if ( ! error.user ) { throw error ; }

		if ( this.playIntro ) { this.displayIntro() ; }
		this.displayUserError( error ) ;

		if ( error.user ) {
			this.displayHelp( error.cli , false ) ;
		}

		term( '\n' ) ;
		process.exit( 1 ) ;
	}

	this.toExec.forEach( fn => fn() ) ;

	if ( this.playIntro ) { this.displayIntro() ; }

	return this.parsedArgs ;
} ;



// Merge information from multiple sources (currently: user-defined and package.json)
Cli.prototype.mergeInfo = function() {
	if ( ! this.packageJson ) { return ; }

	if ( ! this.appName && this.packageJson.copyright && this.packageJson.copyright.title ) {
		// Specific to my own packages
		this.appName = this.packageJson.copyright.title ;
	}

	if ( ! this.appName && this.packageJson.name ) {
		this.appName = string.toTitleCase( this.packageJson.name.replace( /-/g , ' ' ) ) ;
	}

	if ( ! this.appAuthor && this.packageJson.author ) {
		if ( typeof this.packageJson.author === 'string' ) {
			this.appAuthor = this.packageJson.author ;
		}
		else if ( typeof this.packageJson.author.name === 'string' ) {
			this.appAuthor = this.packageJson.author.name ;
		}
	}

	if ( ! this.appVersion && this.packageJson.version ) {
		this.appVersion = this.packageJson.version ;
	}

	if ( ! this.appDescription && this.packageJson.description ) {
		this.appDescription = this.packageJson.description ;
	}

	if ( ! this.appLicense && this.packageJson.license ) {
		this.appLicense = this.packageJson.license ;
	}

	if ( ! this.appExe ) {
		this.appExe = path.basename( process.argv[ 1 ] ) ;
	}
} ;



Cli.prototype.loadConfig = function( configPath , args , key ) {
	var error ;

	if ( ! path.isAbsolute( configPath ) ) {
		configPath = path.join( process.cwd() , configPath ) ;
	}

	try {
		var config = require( configPath ) ;
	}
	catch ( error_ ) {
		error = new Error( "Cannot load '" + configPath + "'" ) ;
		error.code = 'cantLoadConfig' ;
		error.key = key ;
		error.what = configPath ;
		error.cli = this ;
		error.user = true ;
		throw error ;
	}

	return this.mergeConfig( args , config ) ;
} ;



Cli.prototype.mergeConfig = function( args , config ) {
	// Do not overwrite
	return tree.extend( { deep: true , preserve: true } , args , config ) ;
} ;



Cli.prototype.displayIntro = function() {
	if ( this.appName ) {
		term.bold.magenta( this.appName ) ;

		if ( this.appVersion ) {
			term.dim( ' v%s' , this.appVersion ) ;
		}

		if ( this.appAuthor ) {
			term.dim( ' by ^/%s' , this.appAuthor ) ;
		}

		term( '\n' ) ;

		if ( this.appBaseline ) {
			term.bold.yellow( '%S' , this.appBaseline )( '\n' ) ;
		}

		if ( this.appLicense ) {
			term.dim( 'Licensed under the ^/%s license.' , this.appLicense )( '\n' ) ;
		}

		term( '\n' ) ;
	}
} ;



Cli.prototype.displayHelp = function( subCli = this , descriptionEnabled = true ) {
	// Generic description/summary
	if ( subCli.appDescription &&  descriptionEnabled ) {
		term( "%S" , subCli.appDescription )( '\n\n' ) ;
	}

	// Usage
	this.displayUsageHelp( subCli ) ;
	term( '\n' ) ;

	// Arguments
	if ( subCli.argOptions.length || subCli.restArgsOption ) {
		subCli.displayOptionsHelp( subCli.restArgsOption ? [ ... subCli.argOptions , subCli.restArgsOption ] : subCli.argOptions ) ;
		term( '\n' ) ;
	}

	// Flag-options
	if ( subCli.flagOptions.length ) {
		subCli.displayOptionsHelp( subCli.flagOptions ) ;
		term( '\n' ) ;
	}

	// Commands
	if ( subCli.commands.length ) {
		subCli.displayOptionsHelp( subCli.commands ) ;
		term( '\n' ) ;
	}

	if ( subCli !== this && this.flagOptions.length ) {
		this.displayOptionsHelp( this.flagOptions , 'global' ) ;
		term( '\n' ) ;
	}

	// In-depth manual
	if ( subCli.appDetails ) {
		term( "%S" , string.wordwrap( subCli.appDetails , Math.min( 120 , term.width || 120 ) ) ) ;
		term( '\n' ) ;
	}
} ;



Cli.prototype.displayUsageHelp = function( subCli ) {
	var mandatoryOptions ,
		usage = subCli.usageString ;

	if ( ! usage ) {
		usage = [] ;

		// Command, if any, is already in the argOptions array

		// Arguments
		usage.push( ... subCli.argOptions.map( option => option.mandatory ? '<' + option.canonical + '>' : '[<' + option.canonical + '>]' ) ) ;
		if ( subCli.restArgsOption ) { usage.push( '[...]' ) ; }

		// Mandatory flags
		mandatoryOptions = this.flagOptions.filter( option => option.mandatory ) ;
		if ( subCli !== this ) { mandatoryOptions.push( ... subCli.flagOptions.filter( option => option.mandatory ) ) ; }

		usage.push( ... mandatoryOptions.map( option => {
			var optionStr = string.unicode.length( option.canonical ) > 1 ? '--' + option.canonical : '-' + option.canonical ;

			switch ( option.type ) {
				case 'string' :
					optionStr += ' <string>' ;
					break ;
				case 'number' :
					optionStr += ' <number>' ;
					break ;
				case 'integer' :
					optionStr += ' <integer>' ;
					break ;
			}

			return optionStr ;
		} ) ) ;

		usage = usage.join( ' ' ) ;
	}

	if ( subCli !== this ) {
		term( 'Usage is: %s %s %s' , this.appExe , subCli.canonical , usage ) ;
	}
	else if ( this.commands.length ) {
		term( 'Usage is: %s <command> %s' , this.appExe , usage ) ;
	}
	else {
		term( 'Usage is: %s %s' , this.appExe , usage ) ;
	}

	term( '\n' ) ;
} ;



Cli.prototype.displayOptionsHelp = function( list , masterGroup ) {
	var table , reformattedTable , altOptionsMaxWidth = 0 , descriptionMaxWidth = 0 ,
		leftColumnWidth , rightColumnWidth , fullWidth ,
		leftMargin , leftMarginString , rightMargin ,
		leftIndent , group = null ;

	table = [] ;

	list.forEach( option => {
		var isOption = option instanceof Option ,
			optionalValue = false ,
			typeLabel = isOption && option.typeLabel ;

		if ( option.group !== group ) {
			group = option.group ;
			table.push( [ masterGroup ? group + ' (' + masterGroup + '):' : group + ':' ] ) ;
		}

		var altOptions = [ option.canonical , ... option.aliases ].map( oneOption => {
			if ( isOption ) {
				if ( option.isArg ) {
					if ( option.isArrayOf ) {
						return '[...]' ;
					}

					return '<' + oneOption + '>' ;
				}

				if ( string.unicode.length( oneOption ) > 1 ) {
					if ( option.type === 'boolean' && ! option.isFlag ) {
						return '--' + oneOption + '/--' + this.negativePrefix + oneOption ;
					}

					return '--' + oneOption ;
				}

				return '-' + oneOption ;
			}

			return oneOption ;
		} ).join( ', ' ) ;

		switch ( option.type ) {
			case 'string' :
			case 'number' :
			case 'integer' :
				if ( ! typeLabel ) { typeLabel = option.type ; }
				break ;
			case 'auto' :
				optionalValue = true ;
				break ;
		}

		if ( typeLabel ) {
			if ( Array.isArray( typeLabel ) ) { typeLabel = typeLabel.join( '|' ) ; }

			if ( option.isArg ) {
				altOptions += ' (' + typeLabel + ')' ;
			}
			else if ( optionalValue ) {
				altOptions += ' [<' + typeLabel + '>]' ;
			}
			else {
				altOptions += ' <' + typeLabel + '>' ;
			}
		}

		var altOptionsWidth = string.unicode.width( altOptions ) ;
		if ( altOptionsWidth > altOptionsMaxWidth ) { altOptionsMaxWidth = altOptionsWidth ; }

		var description = ''
			+ ( isOption ? option.description : option.appDescription )
			+ ( isOption && option.mandatory ? ' [required]' : '' )
			+ ( isOption && option.imply ? ' ' + this.implyString( option ) : '' ) ;

		var descriptionWidth = string.unicode.width( description ) ;
		if ( descriptionWidth > descriptionMaxWidth ) { descriptionMaxWidth = descriptionWidth ; }

		table.push( [ altOptions , description ] ) ;
	} ) ;

	leftIndent = 4 ;
	leftMargin = 2 ;
	leftMarginString = ' '.repeat( leftMargin ) ;
	rightMargin = 6 ;
	leftColumnWidth = Math.min( altOptionsMaxWidth + leftIndent , 40 , Math.floor( ( ( term.width || 120 ) - leftMargin - rightMargin ) / 3 ) ) ;
	rightColumnWidth = Math.min( descriptionMaxWidth , 80 , Math.floor( ( ( term.width || 120 ) - leftMargin - rightMargin ) * 2 / 3 ) ) ;
	fullWidth = Math.min( 120 , term.width || 120 ) ;

	reformattedTable = [] ;

	table.forEach( line => {
		if ( line.length === 1 ) {
			// This is a group, taking up the full width
			var fullLines = string.wordwrap( line[ 0 ] , { width: fullWidth , noJoin: true } ) ;
			fullLines.forEach( fullLine => {
				reformattedTable.push( [ fullLine ] ) ;
			} ) ;
			return ;
		}

		var leftLines = string.wordwrap( line[ 0 ] , { width: leftColumnWidth - leftIndent , noJoin: true } ) ;
		var rightLines = string.wordwrap( line[ 1 ] , { width: rightColumnWidth , noJoin: true } ) ;

		if ( leftLines.length >= rightLines.length ) {
			leftLines.forEach( ( leftLine , index ) => {
				reformattedTable.push( [
					( index ? ' '.repeat( leftIndent ) : '' ) + leftLine ,
					rightLines[ index ] || ''
				] ) ;
			} ) ;
		}
		else {
			rightLines.forEach( ( rightLine , index ) => {
				reformattedTable.push( [
					( index ? ' '.repeat( leftIndent ) : '' ) + ( leftLines[ index ] || '' ) ,
					rightLine
				] ) ;
			} ) ;
		}
	} ) ;

	reformattedTable.forEach( line => {
		if ( line.length === 1 ) {
			// This is a group, taking up the full width
			term( "%S" , line[ 0 ] ) ;
			term( '\n' ) ;
			return ;
		}

		var [ left , right ] = line ;

		/*
		// This does not works well when not inside a TTY (move-to-column does not output spaces)
		term.column.gray( 1 + leftMargin , "%S" , left ) ;
		term.column.cyan( 1 + leftMargin + leftColumnWidth + rightMargin , "%S" , right ) ;
		*/

		// This is more universal
		term( leftMarginString ) ;
		term.gray( "%S" , left ) ;
		term( ' '.repeat( rightMargin + leftColumnWidth - string.unicode.width( left ) ) ) ;
		term.cyan( "%S" , right ) ;

		term( '\n' ) ;
	} ) ;
} ;



Cli.prototype.implyString = function( option ) {
	var str = '[' + ( option.remove ? 'shorthand for' : 'imply' ) + ': ' ;

	str += Object.keys( option.imply ).map( key => {
		var keyStr ,
			impliedOption = this.canonicalOptions[ key ] ,
			value = option.imply[ key ] ,
			valueStr ;

		if ( impliedOption && ! impliedOption.isArg ) {
			keyStr = ( string.unicode.length( key ) > 1 ? '--' : '-' ) + key ;

			if ( value === true ) {
				return keyStr ;
			}
			else if ( value === false ) {
				return this.negativePrefix + keyStr ;
			}
			else if ( value === Cli.ARG ) {
				valueStr = '<arg>' ;
			}
			else if ( typeof value === 'number' ) {
				valueStr = value ;
			}
			else if ( typeof value === 'string' && value && value.indexOf( ' ' ) === -1 ) {
				// No white space are allowed
				valueStr = value ;
			}
			else {
				valueStr = JSON.stringify( value ) ;
			}

			keyStr += ' ' ;
		}
		else {
			keyStr = key + ': ' ;
			// Do not try-catch, let it crash
			valueStr = JSON.stringify( value ) ;
		}

		return keyStr + valueStr ;
	} )
		.join( ' ' ) ;

	str += ']' ;

	return str ;
} ;



Cli.prototype.displayUserError = function( userError ) {
	term.red( "Command line error: %s." , userError.message )( '\n' ) ;
	term( '\n' ) ;
} ;



// This add some common options and their automatic process
Cli.prototype.addCommonOptions = function() {
	this.addHelpOption() ;
	this.addLogOptions() ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'commonOptions' , {
	get: function() { return this.addCommonOptions() ; }
} ) ;



Cli.prototype.addHelpOption = function() {
	this.opt( [ 'help' , 'h' ] ).flag
		.description( 'Display help and exit' )
		.exec( ( ... args ) => this.helpOptionHook( ... args ) ) ;

	this.lastOption = null ;

	return this ;
} ;

Object.defineProperty( Cli.prototype , 'helpOption' , {
	get: function() { return this.addHelpOption() ; }
} ) ;

Cli.prototype.helpOptionHook = function( cli , args , subCli , subArgs ) {
	this.displayIntro() ;

	if ( subCli ) {
		// Called from a sub CLI
		this.displayHelp( subCli ) ;
	}
	else if ( args[ this.commandKeyName ] ) {
		// Called from the master CLI as a top-level option, but there is actually a command
		this.displayHelp( this.canonicalCommands[ args[ this.commandKeyName ] ] ) ;
	}
	else {
		// Called from the master CLI, no command
		this.displayHelp() ;
	}

	term( '\n' ) ;
	process.exit() ;
} ;



Cli.prototype.addLogOptions = function( options = {} ) {
	this.opt( [ 'log' ] , 'info' ).string
		.description( 'Set the log level (one of: trace, debug, verbose, info, warning, error, fatal)' ) ;

	this.opt( [ 'debug' ] ).shorthand( { log: 'debug' } )
		.description( 'Output debugging information (debug-level log)' ) ;

	this.opt( [ 'verbose' ] ).shorthand( { log: 'verbose' } )
		.description( 'Output more information (verbose-level log)' ) ;

	this.opt( [ 'quiet' , 'q' ] ).shorthand( { log: 'warning' } )
		.description( 'Do not log or output unimportant informations (warning-level log)' ) ;

	this.opt( [ 'color' ] , !! process.stdout.isTTY ).boolean
		.description( 'Enable/disable color (default: yes on TTY, no on non-TTY)' ) ;

	try {
		// If Logfella is present...
		require( 'logfella' ) ;

		if ( options.stderr || options.stderrIfNotTTY ) {
			this.opt( [ 'err-color' ] , !! process.stderr.isTTY ).flag
				.description( 'Enable/disable color on stderr (default: yes on TTY, no on non-TTY)' ) ;
		}

		if ( options.mon ) {
			this.opt( [ 'mon' ] )
				.typeLabel( 'port' , 'socket' )
				.description( 'Activate Logfella monitoring on this port' ) ;
		}

		if ( options.symbol ) {
			this.opt( [ 'log-symbol' ] ).flag
				.description( 'When enabled, lines of log are prefixed by a symbol to keep track of items' ) ;
		}
	}
	catch ( error ) {}

	// Always add the log hook
	this.execFn.push( ( ... args ) => this.logOptionsHook( options , ... args ) ) ;

	this.lastOption = null ;

	return this ;
} ;

Object.defineProperty( Cli.prototype , 'logOptions' , {
	get: function() { return this.addLogOptions() ; }
} ) ;

Cli.prototype.logOptionsHook = function( options , cli , args , subCli , subArgs ) {
	if ( args.log === 'warning' ) {
		// Because it is the 'quiet' mode
		this.playIntro = false ;
	}

	try {
		var Logfella = require( 'logfella' ) ;
		Logfella.setStackTraceLimit( 30 ) ;
	}
	catch ( error ) {
		// Just do nothing if it is not present
		return ;
	}

	Logfella.global.configure( {
		minLevel: args.log ,
		overrideConsole: false ,
		transports: [ {
			type: 'console' ,
			timeFormatter: 'dateTime' ,
			color: args.color ,
			symbol: options.symbol && ( args['log-symbol'] || args.logSymbol ) ,
			output: 'stdout'
		} ]
	} ) ;

	if ( options.stderr || ( options.stderrIfNotTTY && ! process.stdout.isTTY ) ) {
		Logfella.global.addTransport( 'console' , {
			minLevel: 'error' ,
			timeFormatter: 'dateTime' ,
			color: args['err-color'] || args.errColor ,
			symbol: options.symbol && ( args['log-symbol'] || args.logSymbol ) ,
			output: 'stderr'
		} ) ;
	}

	if ( options.mon && args.mon ) {
		Logfella.global.configure( { monPeriod: 1000 } ) ;
		Logfella.global.addTransport( 'netServer' , {
			role: 'mon' ,
			port: typeof args.mon === 'number' ? args.mon : 10632
		} ) ;
	}
} ;



// This add some common command and their automatic process
Cli.prototype.addCommonCommands = function() {
	this.addHelpCommand() ;
	return this ;
} ;

Object.defineProperty( Cli.prototype , 'commonCommands' , {
	get: function() { return this.addCommonCommands() ; }
} ) ;



Cli.prototype.addHelpCommand = function() {
	if ( this.lastOption || this.activeCli !== this ) {
		throw new Error( ".addCommonCommands() should be invoked before any option/command definition" ) ;
	}

	this.command( 'help' )
		.description( 'Display help and exit' )
		.exec( ( ... args ) => this.helpCommandHook( ... args ) )
		.arg( 'command-name' ).string.description( "The command to get help on" ) ;

	this.activeCli = this ;

	return this ;
} ;

Object.defineProperty( Cli.prototype , 'helpCommand' , {
	get: function() { return this.addHelpCommand() ; }
} ) ;

Cli.prototype.helpCommandHook = function( cli , args , subCli , subArgs ) {
	this.displayIntro() ;

	var commandName = this.camelCase ? subArgs.commandName : subArgs['command-name'] ;

	if ( commandName ) {
		if ( this.canonicalCommands[ commandName ] ) {
			this.displayHelp( this.canonicalCommands[ commandName ] ) ;
		}
		else if ( this.aliasCommands[ commandName ] ) {
			this.displayHelp( this.aliasCommands[ commandName ] ) ;
		}
		else {
			term.red( "Unknown command '%s'" , commandName ) ;
			term( '\n\n' ) ;

			this.displayHelp( this , false ) ;
		}
	}
	else {
		this.displayHelp() ;
	}

	term( '\n' ) ;
	process.exit() ;
} ;



// Create a default parser, add Cli to prototype, so it is possible to instanciate our own Cli
Cli.prototype.Cli = Cli ;
module.exports = new Cli() ;

