



window.console = window.console || { log: function() {} };

window.developerRedirect = window.developerRedirect || {};

//region vsQuery

window.developerRedirect.vsQuery = (function () {

    'use strict';

    /**
     * Create the constructor
     * @param {String} selector The selector to use
     */
    var Constructor = function (selector, args) {
        //For checking that this element is a vsQuery element
        this.type = 'vsQuery';

        //Ensures a selector was supplied;
        if (!selector) return;
        //Attempts to create find the requested elements.
        try {
            //If it is already a vsQuery object, just assign the elements.
            if ( this.isQuery(selector) ) {
                this.elems = selector.elems;
            //Checks if the supplied object is a node list
            } else if ( this.isNodeList( selector ) ) {
                this.elems = selector;
            //checks if the supplied object is an element.
            } else if ( this.isElement( selector ) ) {
                this.elems = [ selector ];
            //Checks for the document selector.
            } else if (selector === 'document' || selector === document) {
                this.elems = [document];
            //checks for the window selector
            } else if (selector === 'window' || selector === window ) {
                this.elems = [window];
            //If it is a string either create or select the element
            } else if ( typeof selector === 'string' ) {
                //check if the selector is wrapped in html brackets
                let match = selector.match(/^[<](\w+)[>]$/);
                //If not wrapped in html brackets, select elements
                if (match === null || match.length < 2) {
                    this.elems = document.querySelectorAll(selector);
                //if wrapped in html brackets, create element,
                } else {
                    this.elems = [document.createElement(match[1])];
                    this.addAttributes(args);
                }
            } else {
                //You fucked up.
                throw new Error('You must supply a string, vsQuery object, element, or node list to the vsQuery constructor.')
            }
        } catch( err ) {
            //Log the error and initialize the elems var so it doesnt crash
            console.error( err );
            this.elems = [];
        }

    };


    Constructor.prototype.id = function() {
        if ( this.elems.length ) {
            return this.elems[0].id;
        }
        return '';
    }

    Constructor.prototype.isQuery = function( obj ) {
        return ( obj && typeof obj === 'object' && obj.type && obj.type === 'vsQuery' );
    }

    /**
     * Checks if the supplied object is a node list.
     *
     * @param nodes
     * @returns {boolean|boolean}
     */
    Constructor.prototype.isNodeList = function(nodes) {
        var stringRepr = Object.prototype.toString.call(nodes);

        return typeof nodes === 'object' &&
            /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
            (typeof nodes.length === 'number') &&
            (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
    }

    /**
     * Checks if the supplied object is a dom element
     *
     * @param obj
     * @returns {boolean|boolean}
     */
    Constructor.prototype.isElement = function(obj) {
        try {
            //Using W3 DOM2 (works for FF, Opera and Chrome)
            return obj instanceof HTMLElement;
        }
        catch(e){
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have (works on IE7)
            return (typeof obj==="object") &&
                (obj.nodeType===1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument ==="object");
        }
    }



    /**
     * Runs a callback on each key / value of a object
     * @param obj       The object to loop through
     * @param callback  The callback function to run
     */
    Constructor.prototype.forEach = function( obj, callback ) {
        Object.keys(obj).forEach(function (key) {
            callback( key, obj[key] )
        });
    }


    /**
     * Run a callback on each item
     * @param  {Function} callback The callback function to run
     */
    Constructor.prototype.each = function (callback) {
        if (!callback || typeof callback !== 'function') return;
        for (var i = 0; i < this.elems.length; i++) {
            callback(this.elems[i], i);
        }
        return this;
    };


    /**
     * Adds an event listener to the elements
     * @param {string}    event       the event to attach to
     * @param {function}  callback    The function to call
     * @param  {Boolean}  useCapture  If true, set useCapture to true [optional]
     */
    Constructor.prototype.on = function( event, callback, useCapture ) {
        if ( !event || typeof event !== 'string' || !callback || typeof callback !== 'function') return;
        for (var i = 0; i < this.elems.length; i++) {
            this.elems[i].addEventListener(event, callback, useCapture || false);
        }
        return this;
    }

    /**
     * Fires the supplied callback when document is loaded.
     * @param {function}  callback    The function to call
     */
    Constructor.prototype.docReady = function( callback ) {
        if ( ! callback || typeof callback !== 'function' ) return;
        if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", function() { callback() });
        }
        return true;
    }

    /**
     * Add a class to elements
     * @param {String} className The class name
     */
    Constructor.prototype.addClass = function (className) {
        this.each(function (item) {
            item.classList.add(className);
        });
        return this;
    };

    /**
     * Remove a class to elements
     * @param {String} className The class name
     */
    Constructor.prototype.removeClass = function (className) {
        this.each(function (item) {
            item.classList.remove(className);
        });
        return this;
    };


    Constructor.prototype.addAttribute = function( key, value ) {
        this.each( function(item) {
            item.setAttribute( key, value );
        } );
        return this;
    }

    Constructor.prototype.addAttributes = function( args ) {
        let that = this;
        this.forEach( args, function( key, value ){
            that.addAttribute( key, value );
        });
        return this;
    }

    /**
     * Append the current elements to the specified selector
     *
     * @param selector        The selector element or vsQuery to append to.
     * @param args            Args to supply to the vsQuery constructor
     * @returns {Constructor}
     */
    Constructor.prototype.appendTo = function( selector, args ) {
        if ( ! this.isQuery( selector ) ) {
            selector = new Constructor( selector, args || {} );
        }
        if ( selector.elems.length < 1 ) return;
        this.each(function(item) {
            selector.elems[0].appendChild( item );
        })
        return this;
    }

    /**
     * Append the current elements to the specified selector
     *
     * @param selector        The selector element or vsQuery to be appended.
     * @param args            Args to supply to the vsQuery constructor
     * @returns {Constructor}
     */
    Constructor.prototype.appendChild = function( selector, args ) {
        if ( ! this.isQuery( selector ) ) {
            selector = new Constructor( selector, args || {} );
        }
        if ( this.elems.length < 1 || selector.elems.length < 1 ) return;
        let that = this;
        selector.each(function(item) {
            that.elems[0].appendChild(item);
        })
        return this;
    }

    /**
     * Set the inner text of the elements
     *
     * @param text             The text to set
     * @returns {Constructor}
     */
    Constructor.prototype.text = function(text) {
        this.each(function(item) {
            item.innerText = text;
        })
        return this;
    }

    /**
     * Sets the inner html of the elements.
     *
     * @param html
     * @returns {Constructor}
     */
    Constructor.prototype.html = function(html) {
        this.each(function(item) {
            item.innerHTML = html;
        })
        return this;
    }

    Constructor.prototype.find = function( selector ) {
        if ( this.elems.length ) {
            return new Constructor( this.elems[0].querySelectorAll( selector ) );
        }
    }

    Constructor.prototype.attr = function( attr, value ) {
        this.each(function(item) {
            item.setAttribute( attr, value );
        })
        return this;
    }

    Constructor.prototype.val = function(value = null) {
        if ( value === null ) {
            if ( this.elems.length ) {
                return this.elems[0].value;
            }
        } else {
            this.each(function(item) {
                item.value = value;
            })
        }
        
    }


    /**
     * Instantiate a new constructor
     */
    var instantiate = function (selector, args) {
        return new Constructor(selector, args || {});
    };

    /**
     * Return the constructor instantiation
     */
    return instantiate;

})();

//endregion

(function( dev, vs ) {
    dev.instances  = dev.instances || {};


    dev.tabs = function() {
        let that = this;
        this.tabCount = 0;
        //this.tabs = [];
        //this.tWrap;
        //this.contentWrap;
        //this.tabsWrap;

        this.appendWrap = function() {
            let body = document.querySelectorAll(".wrap");
            body = body.length < 1 ? body = vs( 'body' ) :  vs(body[ body.length - 1 ]);
            that.rWrap.appendTo(body);
        }


        this.init = function() {
            that.tabsWrap    = vs( '<ul>', { id: 'developer-redirect-tabs' } );
            that.contentWrap = vs( '<div>', { id: 'developer-redirect-content' } );
            that.rWrap        = vs( '<div>', { id: 'developer-redirect-wrap' } )
                .appendChild( that.tabsWrap )
                .appendChild( that.contentWrap );
            vs().docReady( that.appendWrap );
        }

        this.tabClick = function(e) {
            let contentId = this.getAttribute('data-content');

            vs( '.tabmenu.active' ).removeClass('active');
            vs( '.tabcontent.active' ).removeClass('active');
            vs('#' + contentId).addClass('active');
            vs(this).addClass('active');
        }


        this.addTab = function( title, content ) {
            let $content = vs(content).addClass('tabcontent'),
                tab = vs('<li>')
                    .attr('id', 'menutab-' + that.tabCount)
                    .attr('data-content', $content.id())
                    .addClass('tabmenu')
                    .on('click', that.tabClick)
                    .text(title);
            if ( that.tabCount < 1 ) {
                tab.addClass( 'active' );
                $content.addClass('active');
            }
            that.tabsWrap.appendChild( tab );
            that.contentWrap.appendChild( content );
            that.tabCount++;
        }


        this.init();
        return this;
    }



    dev.instances.tabs = dev.tabs();


    dev.console = function() {
        let that = this;


        this.oldConole = window.console.log;

        this.multiClick = function(e) {
            if ( e.target !== this ) return;
            this.classList.toggle('open');
            vs(this).find( '.open' ).removeClass( 'open' );
        }



        this.clearClick = function(e) {
            that.output.html('');
        }

        this.submitClick = function(e) {

            let cmd = that.inputField.val(),
                result = eval(cmd);
                
            if ( typeof(result) !== 'undefined' ) {
                console.log( result );
            }
            
            that.inputField.val('');
        }

        this.enterPressed = function(event) {
            if (event.which === 13 || event.keyCode === 13) {
                that.submitClick(null);
                return false;
            }
            return true;
        }


        //Creates the debug console and appends it to the page.
        this.initialize = function() {
            that.output = vs('<ul>', { id: 'debug-console-output' });
            that.inputField = vs( '<input>', { id: 'debug-console-input', type: 'text' } )
                .on( 'keypress', that.enterPressed );
            that.inputButton = vs( '<input>', { id: 'debug-console-input-button', type: 'button', value: 'Submit' } )
                .on('click', that.submitClick);

            that.clearButton = vs( '<input>', { id: 'debug-console-clear-button', type: 'button', value: 'Clear Console' } )
                .on('click', that.clearClick);

            that.inputWrap = vs( '<div>', {id: 'debug-console-input-wrap'} )
                .appendChild( that.inputField )
                .appendChild( that.inputButton )
                .appendChild( that.clearButton );

            that.wrap = vs( '<div>', { id: 'debug-console-wrap' } )
                .appendChild( that.output )
                .appendChild( that.inputWrap );

            dev.instances.tabs.addTab( 'Console', that.wrap );


        }





        this.getObjString = function( obj ) {

            if ( typeof( obj ) === 'undefined' ) {
                return 'undefined';
            } else if ( typeof(obj) === 'function' )  {
                return 'ƒ ()';
            } else {

                return obj.toString().replace(/(\r\n|\n|\r)/gm," ");
            }
        }


        this.printObject = function(obj, container, type = false, firstLevel = false) {
            try {
                for (var key in obj) {
                    let itemWrap = vs( '<li>', { class: 'debug-item' } );
                    if ( type ) {
                        itemWrap.addClass( type );
                    }
                    if ( typeof( obj[key] ) !== 'object') {
                        let str = this.getObjString( obj[key] );
                        itemWrap.text( firstLevel ? str : key + ': ' + str ).addClass('single');
                    } else {
                        if ( ! firstLevel ) itemWrap.text(key);
                        itemWrap.addClass('multi').on('click', that.multiClick);
                        let subContainer = vs('<ul>').appendTo( itemWrap );
                        that.printObject( obj[key], subContainer );
                    }
                    container.appendChild( itemWrap );
                }
            } catch( err ) {
                console.error( 'A Console Redirect error occured', err );
            }


            return container;
        }

        this.appendOutput = function( attributes, type = 'information' ) {
            that.oldConole.apply(console, attributes);
            that.printObject( attributes, that.output, type, true );
        }


        window.console.log = function() {
            that.appendOutput( arguments, false );
        }

        window.console.info = function() {
            that.appendOutput( arguments, 'information' );
        }

        window.console.warn = function() {
            that.appendOutput( arguments, 'warning' );
        }

        window.console.error = function() {
            that.appendOutput( arguments, 'error' );
        }




        this.initialize();

        return this;
    }


    dev.instances.console = dev.console();

    window.onerror = function(msg, url, linenumber) {
        console.error( { message: msg, line: linenumber, url: url,  } );
        //alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
        return true;
    }


    dev.sources = function() {
        let that = this;
        this.sources = {};

        this.initialize = function() {
            that.sourceList = vs( '<ul>', { id: 'developer-redirect-source-list' } );
            dev.instances.tabs.addTab( 'Sources', that.sourceList )
            vs().docReady(this.populateData);
        }
        
        this.sourceMultiClick = function(e) {
            if ( e.target !== this ) return;
            this.classList.toggle('open');
            vs(this).find( '.open' ).removeClass( 'open' );
        }

        this.printSources = function(items, container) {
            try {
                for ( var key in items ) {
                    let itemWrap = vs( '<li>', { class: 'source-item' } );
                    if ( typeof items[key] !== 'object' ) {
                        itemWrap
                            .addClass('single')
                            .text(items[key]);
                            
                    } else {
                        itemWrap
                            .addClass('multi')
                            .on('click', that.sourceMultiClick)
                            .text(key)
                        let subContainer = vs('<ul>').appendTo( itemWrap );
                        that.printSources( items[key], subContainer );
                    }
                     container.appendChild( itemWrap );
                
                    
                }
            } catch( err ) {
                console.error( 'A Sources Redirect error occured', err );
            }


            return container;
        }


        this.populateData = function() {

            var r = window.performance.getEntriesByType("resource");
  
            let map = r.map((value, index) => {
                return value.name.replace(/(^\w+:|^)\/\//, '').split('/');
            })

            let result = {};
            for ( let index in map ) {
                let item = map[index],
                    current = result;
                for ( let i in item ) {
                    if ( i == (item.length - 1) ) {
                        current[Object.keys(current).length] = item[i];
                    } else {
                        current[item[i]] = current[item[i]] || {};
                        current = current[item[i]];
                    }
                }
            }
            
            
            that.printSources( result, that.sourceList );
        }


        this.initialize();
        return this;


    }


    dev.pageSource = function() {
        let that = this;
        
        
        
        this.initialize = function() {
            that.pageSource = vs( '<div>', { id: 'developer-redirect-page-source' } );
            that.htmlWrap   = vs('<pre>').appendTo(that.pageSource);
            that.refreshButton = vs( '<input>', { type: 'button', id: 'developer-redirect-page-source-button', value: 'Refresh' } )
                .appendTo(that.pageSource)
                .on('click',this.render);
            
            
            
            dev.instances.tabs.addTab( 'Page Source', that.pageSource )
            vs().docReady(that.render);
            
        }
        
        this.render = function() {
            let html = vs('html').elems[0].outerHTML;
            that.htmlWrap.text(html);
            
        }
        
        this.initialize();
        return this;
        
        
        
    }

    dev.instances.sources = dev.sources();
    dev.instances.pageSource = dev.pageSource();
    //dev.instances.tabs.addTab('Test', vs('<div>', { id:'test' }).text('test'));

})( window.developerRedirect, window.developerRedirect.vsQuery );


