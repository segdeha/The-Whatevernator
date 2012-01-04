/**
 * Whatevernator -- a fawning rip-off off the Discovernator (http://news.discovery.com/games-quizzes/discovernator-crazy-amazing-facts-101411.html)
 * @author Andrew Hedges <andrew@hedges.name>
 * @created 2011-12-22
 * @requires jQuery
 * @usage: var whatevernator = $.whatevernator('#my-container');
 */
;(function ($, window, undefined) {
    /**
     * Singleton for scrolling the list
     * @implements next
     */
    var scroller = {
        idxs : [], // stack of last 10 array indexes
        /**
         * Scroll the list to a random list item
         * @public
         * @param Event evt Parameter is present if method is called with the built-in button
         * @return void
         */
        next : function (evt) {
            var idx;
            evt && evt.preventDefault();
            idx = scroller.rndIdx();
            scroller.scrollTo(idx);
        },
        /**
         * Animate to the new scroll index
         * @private
         * @param Number idx Array index
         * @return void
         */
        scrollTo : function (idx) {
            var pos;
            pos = findPos(idx);
            scroller.$list.animate({
                top : '-' + pos + 'px'
            }, scroller.duration);
            window.location.hash = 1 + idx;
        },
        /**
         * Return a random, valid array index that has not been returned in the last several requests
         */
        rndIdx : function () {
            var len, max, idx;
            len = scroller.idxs.length;
            max = Math.floor(scroller.count / 2);
            if (len > max) {
                scroller.idxs = scroller.idxs.slice(len - max);
            }
            do {
                idx = rnd(scroller.count);
            } while (inArray(scroller.idxs, idx));
            scroller.idxs.push(idx);
            return idx;
        }
    };

    /**
     * Return a random number between 0 and val - 1
     * @private
     * @param Number val
     * @return Number
     */
    function rnd(val) {
        return Math.floor(Math.random() * val);
    }

    /**
     * Answering the question, "Is this (primitive value) in this array?"
     * @private
     * @param Array arr
     * @param String or Number val
     * @return Boolean
     */
    function inArray(arr, val) {
        var i;
        if (arr.indexOf) {
            return arr.indexOf(val) > -1;
        }
        i = arr.length;
        while (i--) {
            if (arr[i] === val) {
                return true;
            }
        }
        return false;
    }

    /**
     * Find true position to which to scroll (needed in case some <li>s are too tall)
     * @private
     * @param Number idx Array index of the <li>
     * @return Number
     */
    function findPos(idx) {
        var pos;
        pos = 0;
        for (var i = 0; i < idx; ++i) {
            pos += $(scroller.$items[i]).height();
        }
        return pos;
    }

    /**
     * Set up permalinks on list items
     * @private
     */
    function permalinks() {
        $.each(scroller.$items, function (idx, val) {
            $(val).find('p').append('<a href="#' + (1 + idx) + '">¶</a>');
        });
    }

    /**
     * Read hash value on page load, scroll to that item if one is present
     * @private
     */
    function handleHash() {
        var hash;
        // there is a hash value
        if ('' !== window.location.hash && '#' !== window.location.hash) {
            hash = window.location.hash.slice(1);
            // the hash value is an integer
            if (/[0-9]+/.test(hash)) {
                // the hash value is also a valid array index
                if (hash > 0 && hash <= scroller.count) {
                    // cast as a number and decrement so it's zero-indexed
                    --hash;
                    scroller.scrollTo(hash);
                }
            }
        }
        // no hash value, so go to a random whatever
        else {
            scroller.next();
        }
    }

    /**
     * Public method to create the Whatevernator
     * @param String selector CSS selector for the containing element
     * @param Number duration Number of milliseconds it will take to complete an animation
     * @param Boolean permas Whether or not to show permalinks
     * @return Object
     */
    function whatevernator(selector, duration) {
        selector          = selector || '#whatevernator';
        scroller.duration = duration || 1000;
        scroller.$list    = $(selector + ' > .whatevernator_middle > ol');
        scroller.$items   = $('li', scroller.$list);
        scroller.count    = scroller.$items.length;
        // use touch events, if present
        $(selector + ' .whatevernator_button a').bind('ontouchend' in window ? 'touchend' : 'click', scroller.next);
        // release the UI thread before we do some looping
        setTimeout(function () {
            permalinks();
            handleHash();
        }, 0);
        // only expose scroller.next as a public method
        return {
            next : scroller.next
        };
    }

    // expose public method
    $.extend({
        whatevernator : whatevernator
    });
}(jQuery, this));
