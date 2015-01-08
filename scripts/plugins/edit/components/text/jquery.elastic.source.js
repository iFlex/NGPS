/**
*	@name							Elastic
*	@descripton						Elastic is jQuery plugin that grow and shrink your textareas automatically
*	@version						1.6.11
*	@requires						jQuery 1.2.6+
*
*	@author							original author Jan Jarfalk. Improved by Milorad Liviu Felix
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licence						MIT License - http://www.opensource.org/licenses/mit-license.php
*/


  jQuery.fn.extend({
    elastic: function(options) {
      //	We will create a div clone of the textarea
      //	by copying these attributes from the textarea to the div.
      var mimics = [
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'fontSize',
        'lineHeight',
        'fontFamily',
        'width',
        'fontWeight',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'borderTopStyle',
        'borderTopColor',
        'borderRightStyle',
        'borderRightColor',
        'borderBottomStyle',
        'borderBottomColor',
        'borderLeftStyle',
        'borderLeftColor'
        ];

      return this.each( function() {

        // Elastic only works on textareas
        if ( this.type !== 'textarea' ) {
          return false;
        }

      var $textarea	= jQuery(this);
      $textarea.css(options);
        if($textarea[0].twin)
        {
          $twin = $textarea[0].twin;
          $twin.css({
            'width'			: 0,
            'height'		: 0,
          })
        }
        else
        {
          $twin		= jQuery('<div />').css({
            'position'		: 'absolute',
            'white-space'   : 'nowrap',
            'overflow-x'    : 'hidden',
            'visibility'    : 'hidden',
            'width'			: 0,
            'height'		: 0,
          }),
          $textarea[0].twin = $twin;
        }
        $twin.html("");
        lineHeight	= parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
        minheight	= parseInt($textarea.css('height'),10) || lineHeight*3,
        maxheight	= parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
        minwidth	= parseInt($textarea.css('width'),10) || lineHeight*3,
        maxwidth	= parseInt($textarea.css('max-width'),10) || Number.MAX_VALUE;
        // Opera returns max-height of -1 if not set
        if (maxheight < 0) { maxheight = Number.MAX_VALUE; }

        // Append the twin to the DOM
        // We are going to meassure the height of this, not the textarea.
        $twin.appendTo($textarea.parent());

        // Copy the essential styles (mimics) from the textarea to the twin
        var i = mimics.length;
        while(i--){
          $twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
        }

        $textarea[ 0 ].getSize = function(){
          //return {width:$twin[0].scrollWidth,height:$twin[0].scrollHeight}
          return {width:$textarea.width(),height:$textarea.height()}
        };

        // Sets a given height and overflow state on the textarea
        function setHeightAndOverflow()
        {
          var overflow = 'hidden';
          //this makes the div shrink if text is being deleted (could be optimized: something more sensible in stead of halving)
          var height = $twin[0].scrollHeight;
          /*if(height>= maxheight) {
            height = maxheight
            overflow = 'hidden'//'auto';
          } else if(height <= minheight) {
            height = minheight;
            overflow ='hidden';
          } else {
            overflow = 'hidden';
          }*/
          height += lineHeight;
          $textarea.css({'height': height + 'px','overflow':overflow});
        }

        // Sets a given width and overflow state on the textarea
        function setWidthAndOverflow(){
          var overflow = 'hidden';
          //this makes the div shrink if text is being deleted (could be optimized: something more sensible in stead of halving)
          var width = $twin[0].scrollWidth;
          width += lineHeight;

          if(width>= maxwidth) {
            width = maxwidth;
            allowWrap();
          } else{
            denyWrap();
            if(width <= minwidth) {
              width = minwidth;

            }
          }
          $textarea.css({'width': width + 'px','overflow':overflow});
        }

        function allowWrap(){
          $twin.css({'white-space':'','word-wrap':'break-word','width':maxwidth});
        }
        function denyWrap(){
          $twin.css({'white-space':'nowrap','word-wrap':'','width':0});
        }
        function update() {
          lineHeight	= parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10');
          $twin.css({'font-size':lineHeight});

          var textareaContent = $textarea.val().replace(/\n/g, '<br />');//.replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;')
          $twin.html(textareaContent);

          setWidthAndOverflow();
          setHeightAndOverflow();
        }

        // Hide scrollbars
        $textarea.css({'overflow':'hidden'});

        // Update textarea size on keyup, change, cut and paste
        $textarea.bind('keyup change cut paste update',update);

        // And this line is to catch the browser paste event
        $textarea.bind('input paste',function(e){ setTimeout( update, 250); });

        denyWrap();
        // Run update once when elastic is initialized
        update();

      });

        }
    });
