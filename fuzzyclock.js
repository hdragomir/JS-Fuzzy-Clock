/**
 * @author Horia Dragomir horia@hdragomir.com http://hdragomir.com
 */
(function (window, document, undefined) {
    
    var translateMinutes = {
        30: "half",
        20: "twenty",
        15: "quarter",
        10: "ten",
        5: "five",
        0: ''
    },
        translateHours = "twelve,one,two,three,four,five,six,seven,eight,nine,ten,eleven".split(','),
        infix = {
            past: "past",
            to: "to"
        },
        sharp = "o'clock";

    translateHours[translateHours.length] = translateHours[0];

    var fuzzy = function (date) {
        date = date || new Date;
        var minutes = date.getMinutes(), hours = date.getHours();
        var data = {
            minutes: this.understandMinutes(minutes),
            hours: this.understandHours(hours, minutes),
            infix: this.decideInfix(minutes),
            suffix: this.decideSuffix(minutes),
        };
        var pattern = this.decidePattern(data);
        this.data = data;
        this.string = this.interpolate(pattern, data);
    };

    fuzzy.prototype.understandMinutes = function (minutes) {
        if( minutes > 30 ) {
            minutes = 60 - minutes;
        }
        var i = 0, key, keys = [30, 20, 15, 10, 5, 0], l = keys.length;
        for(; i < l && minutes < keys[i]; i++);
        return translateMinutes[keys[i]];
    };

    fuzzy.prototype.understandHours = function (hours, minutes) {
        return translateHours[ (hours + (minutes > 30 ? 1 : 0) ) % 12 ];
    };

    fuzzy.prototype.decideInfix = function (minutes) {
        return infix[ minutes > 30 ? 'to' : 'past' ];
    };

    fuzzy.prototype.decideSuffix = function (minutes) {
        return minutes > 55 || minutes < 4 ? sharp : '';
    };

    fuzzy.prototype.decidePattern = function (data) {
        return data.minutes? '{minutes} {infix} {hours}' : '{hours} {suffix}';
    };

    fuzzy.prototype.interpolate = function (pattern, data) {
        for( var i in data ){
            pattern = pattern.replace('{' + i + '}', data[i]);
        }
        return pattern;
    };


    var canvas = function ( element, options ) {
        options = options || {};
        ('interval' in options) || (options.interval = 100);
        this.options = options;
        if( element ){
            this.attachTo( element );
        }
    };

    canvas.prototype.understandElement = function (element) {
        if( "string" === typeof element ){
            if( 'querySelector' in document ){
                element = document.querySelector( element );
            } else {
                element = document.getElementById(element.replace(/^#/, ''));
            }
        }
        return element;
    };

    canvas.prototype.attachTo = function (element) {
        this.element = this.understandElement( element );
        if( this.element ){
            this.startDrawing();
        } else {
            this.stopDrawing();
        }
    };

    canvas.prototype.startDrawing = function () {
        if( this.interval ) this.stopDrawing();
        this.interval = setInterval( function (self) {
            self.draw();
        }, this.options.interval, this );
        return this.draw();
    }

   canvas.prototype.draw = function () {
       this.element.innerHTML = (new fuzzy).string;
       return this;
   };

   canvas.prototype.stopDrawing = function () {
       this.interval && clearInterval(this.interval);
       return this;
   };

    window.fuzzyclock = canvas;
    window.fuzzyclock.fuzzy = fuzzy;

}(window, document));
