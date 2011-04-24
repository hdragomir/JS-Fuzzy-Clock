/**
 * @author Horia Dragomir hdragomir@gmail.com http://hdragomir.com
 */
var fuzzyclock = function( element, options ){
	var fz = {
		/** holds the actual element */
		canvas : null,
		/** holds the current date object */
		date : null,
		/** holds the compiled time string */
		timeString : '',
		/** holds the interval id */
		interval : 0,
		/** public options */
		options : {
			"interval" : 180000,
			'silent' : true
		},
		/** mapps numbers to words for hours */
		hoursAsStringArray : [
			'twelve',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve'
		],
		/** maps numbers to words for minutes
		 * or actually their ranges
		 */
		minutesAsStringArray : {
			"5" 	: 'five',
			"10"	: 'ten',
			"15"	: 'quarter',
			"20"	: 'twenty',
			"30"	: 'half'
		},
		/** maps what comes in between the verbal representation of minutes
		 * and the verbal representation of hours
		 * ignored if time is sharp ( :56 -> :04 )
		 */
		infixes : { "to" : 'to', "past" : 'past' },
		/** appended to the time string when hour is sharp ( :56 -> :04 ) */
		postfixes : { "sharp" : "o'clock" },
		/**
		 * function update
		 * regenerates the internal timestring and then calls the draw function
		 * @returns {function} this
		 * @private
		 */
		update : function(){
			this.date = new Date();
			var hours = this.date.getHours(),
				minutes = this.date.getMinutes(),
				MASA = this.minutesAsStringArray,
				hoursAsString, minutesAsString, infix, postfix = '';
			if ( minutes <= 33 ) {
				infix = this.infixes.past;
			} else {
				infix = this.infixes.to;
				minutes = 60 - minutes;
				hours++;
			}
			hours >= 12 && ( hours -= 12 );
			hoursAsString = this.hoursAsStringArray[ hours ];
			if ( minutes < 4 ) {
				minutesAsString = "";
				postfix = this.postfixes.sharp;
				infix = "";
			} else if ( minutes < 8 ) {
				minutesAsString = MASA['5'];
			} else if ( minutes < 13 ) {
				minutesAsString = MASA['10'];
			} else if ( minutes < 18 ) {
				minutesAsString = MASA['15'];
			} else if ( minutes < 27 ) {
				minutesAsString = MASA['20'];
			} else {
				minutesAsString = MASA['30'];
			}
			this.timeString = minutesAsString + " " + infix + " " + hoursAsString + " " + postfix;
			return this.draw();
		},
		/**
		 * function draw
		 * this function writes the current time string to the canvas element
		 * @param	override	{stirng}	set the canvas to a custom string
		 * @returns {funciton} 	this
		 * @private
		 */
		draw : function( override ) {
			var canvas = this.canvas.cloneNode( false );
			canvas.appendChild( this.canvas.ownerDocument.createTextNode( override || this.timeString ) );
			this.canvas.parentNode.replaceChild( canvas, this.canvas );
			this.canvas = canvas;
			return this;
		},
		/**
		 * function init
		 * saves the canvas and options
		 * @param 	element		{HTMLElement}	the element that holds the clock
		 * @param	options		{hash}			the options
		 * current options are:
		 * 		interval 	{number} 	the update frequency
		 * 		silent		{boolean}	whether to throw exceptions or not
		 *
		 * @throws Exception
		 * @returns {function} this
		 */
		init : function( element, options ){

			this.options.interval = options.interval || this.options.interval;

			for( var opt in options ){
				this.options[opt] = options[opt];
			}

			this.canvas = element;

			if( ! this.canvas && ! this.options.silent ){
				throw 'fuzzyClock : Could not do anything with "' + element + '"';
			}

			return this.start();
		},
		/**
		 * function start
		 * sets the update interval, uses scope binding.
		 * calls the update function
		 * @returns {function} this ( via this.update() )
		 */
		start : function(){
			this.interval = window.setInterval( ( function( scope ){
				return function(){
					scope.update.call( scope );
				};
			} )( this ), this.options.interval );
			return this.update();
		},
		/**
		 * function stop
		 * clears the update interval
		 * @returns {function} this
		 */
		stop : function(){
			window.clearInterval( this.interval );
			return this;
		},
		/**
		 * convenient method to get the time string
		 */
		toString : function(){
			return this.timeString;
		}
	},
	/** preset the canvas to null */
	el;

	/** if we got a selector */
	if( 'string' == typeof element ){
		/** try the classic method */
		el = document.getElementById( element.replace( /^#/, '' ) ) ||
			/** if the browser supports advanced selectors, try finding the element this way  */
			( document.querySelector && ( el = document.querySelector( element ) ) );
	} else {
		/** assume we received an HTMLElement */
		el = element;
	}
	/** we'll be using options.***, so it would suck if it was null */
	options = options || {};
	/** call the initialization function
	 * @see fz.init
	 */
	return fz.init( el, options );
};

if( 'undefined' != typeof jQuery )
	jQuery.fn.fuzzyclock = function( options ){
		return this.each( function(){
			$( this ).data( 'fuzzyclock', new fuzzyclock( this, options ) );
		} );
	}
