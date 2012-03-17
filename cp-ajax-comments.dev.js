/*
===============================================================
CommentPress AJAX Comment Submission
===============================================================
AUTHOR			: Christian Wach <needle@haystack.co.uk>
LAST MODIFIED	: 16/09/2010
DEPENDENCIES	: jquery.js
---------------------------------------------------------------
NOTES

This script enables AJAX comment posting when the CommentPress theme is active.

Based on the 'Ajax Comment Posting' WordPress plugin (version 2.0)

---------------------------------------------------------------
*/






// test for our localisation object
if ( 'undefined' !== typeof CommentpressAjaxSettings ) {

	// reference our object vars
	var cpac_live = CommentpressAjaxSettings.cpac_live;
	var cpac_ajax_url = CommentpressAjaxSettings.cpac_ajax_url;
	var cpac_spinner_url = CommentpressAjaxSettings.cpac_spinner_url;
	var cpac_post_id = CommentpressAjaxSettings.cpac_post_id;

}

// init submitting flag
var cpac_submitting = false;






/** 
 * @description: an example ajax callback
 *
 */
function cpac_ajax_callback( data ) {
	
	// get diff
	var diff = parseInt( data.cpac_comment_count ) - parseInt( CommentpressAjaxSettings.cpac_comment_count );
	
	// did we get any new comments?
	if ( diff > 0 ) {
	
		// loop through them
		for( var i = 1; i <= diff; i++ ) {
		
			// get comment array (will rejig when I can find a way to pass nested arrays)
			var comment = eval( 'data.' + 'cpac_new_comment_' + i );
			
			// deal with each comment
			cpac_add_new_comment( jQuery(comment.markup), comment.text_sig, comment.parent, comment.id );
			
			// increment global
			CommentpressAjaxSettings.cpac_comment_count++;
		
		}
		
	}
	
}






/** 
 * @description: add comment to page
 * @todo: 
 *
 */
function cpac_add_new_comment( markup, text_sig, comm_parent, comm_id ) {

	// get container
	var comment_container = jQuery('div.comments_container');
	
	// kick out if we have it already
	if ( comment_container.find( '#li-comment-' + comm_id )[0] ) { return; }
	
	
	
	// get useful ids
	var para_id = '#para_wrapper-' + text_sig;
	var head_id = '#para_heading-' + text_sig;
	
	// find the commentlist we want
	var comm_list = jQuery(para_id + ' ol.commentlist:first');

	// if the comment is a reply, append the comment to the children
	if ( comm_parent != '0' ) {
		
		//alert( comm_parent );
		var parent_id = '#li-comment-' + comm_parent;
		
		// find the child list we want
		var child_list = jQuery(parent_id + ' > ol.children:first');

		// is there a child list?
		if ( child_list[0] ) {
		
			markup.hide()
				  .css('background', '#c2d8bc')
				  .appendTo( child_list )
				  .slideDown( 'fast', function() { 
				  
						// animate to white
						markup.animate({ backgroundColor: "#ffffff" }, 1000, function () {
							
							// then make transparent
							markup.css('background', 'transparent');
						
						});
						
				  });
			
		} else {
		
			markup.wrap( '<ol class="children" />' )
				  .parent()
				  .css('background', '#c2d8bc')
				  .hide()
				  .appendTo( parent_id )
				  .slideDown( 'fast', function() { 
				  
						// animate to white
						markup.parent().animate({ backgroundColor: "#ffffff" }, 1000, function () {
							
							// then make transparent
							markup.parent().css('background', 'transparent');
						
						});
						
				  });
			
		}
		
	// if not, append the new comment at the bottom
	} else {
		
		// is there a comment list?
		if ( comm_list[0] ) {
		
			markup.hide()
				  .css('background', '#c2d8bc')
				  .appendTo( comm_list )
				  .slideDown( 'fast', function() { 
				  
						// animate to white
						markup.animate({ backgroundColor: "#ffffff" }, 1000, function () {
							
							// then make transparent
							markup.css('background', 'transparent');
						
						});
						
				  });
			
		} else {
		
			markup.wrap( '<ol class="commentlist" />' )
				  .parent()
				  .css('background', '#c2d8bc')
				  .hide()
				  .prependTo( para_id )
				  .slideDown( 'fast', function() { 
				  
						// animate to white
						markup.parent().animate({ backgroundColor: "#ffffff" }, 1000, function () {
							
							// then make transparent
							markup.parent().css('background', 'transparent');
						
						});
						
				  });
			
		}
		
	}



	// get paragraph header link
	var head = comment_container.find( head_id + ' a' );
	
	// get text as array
	var head_array = head.text().split(' ');

	// get current comment number from paragraph header
	var comment_num = parseInt( head_array[0] );
	
	// increment
	comment_num++;
	
	// replace in array
	head_array[0] = comment_num;
	
	// make plural by default
	head_array[1] = 'Comments';
	
	// is the word 'comment' singular?
	if ( comment_num == 1 ) {
	
		// make singular
		head_array[1] = 'Comment';
		
	}
	
	// replace head with new
	head.text( head_array.join( ' ' ) );
	
	// get existing bg (but interferes with animate below)
	//var head_bg = head.css( 'backgroundColor' );
	
	// highlight
	head.css( 'background', '#c2d8bc' );
	
	// animate to existing bg (from css file)
	head.animate( { backgroundColor: '#EFEFEF' }, 1000 );
	
	
	
	// cast comment num as string
	var comment_num = comment_num.toString();

	// get textblock id
	var textblock_id = '#textblock-' + text_sig;

	// get small tag
	var small = textblock_id + ' span small';

	// set comment icon text
	jQuery(small).html( comment_num );
	
	// if we're changing from 0 to 1...
	if ( comment_num == '1' ) {

		// set comment icon class
		jQuery(textblock_id + ' span.commenticonbox a.para_permalink').addClass('has_comments');
	
		// show it
		jQuery(small).css( 'visibility', 'visible' );

	}



	// re-enable clicks
	cp_enable_comment_permalink_clicks();
	cp_setup_comment_headers();
	
}






/** 
 * @description: an example ajax update
 *
 */
function cpac_ajax_update() {
	
	// kick out if submitting a comment
	if ( cpac_submitting ) { return; }
	
	/*
	// we can use this to log ajax errors from jQuery.post()
	$(document).ajaxError( function( e, xhr, settings, exception ) { 
		alert( 'error in: ' + settings.url + ' \n'+'error:\n' + xhr.responseText ); 
	});
	*/
	
	// use post method
	jQuery.post(
		
		// set URL
		cpac_ajax_url,
		
		// set method to call
		{ action: 'cpac_get_new_comments',
		
		// send last comment count
		last_count: CommentpressAjaxSettings.cpac_comment_count,
		
		// send post ID
		post_id: cpac_post_id
		
		},
		
		// callback
		function( data, textStatus ) { 
		
			//alert( data );
			//alert( textStatus );
			
			// if success
			if ( textStatus == 'success' ) {
			
				// call function
				cpac_ajax_callback( data );
				
			}
			
		},
		
		// expected format
		'json'

	);

}






/** 
 * @description: an example ajax updater
 *
 */
function cpac_ajax_updater( toggle ) {

	// if set
	if ( toggle == '1' ) {
	
		// NOTE: comment_flood_filter is set to 15000, so that's what we set here. this ain't chat :)
		// if you want to change this to something more 'chat-like'...
		// add this to your theme's functions.php or uncomment it in cp-ajax-comment.php:
		// remove_filter('comment_flood_filter', 'wp_throttle_comment_flood', 10, 3);
		// use at your own risk - it could be very heavy on the database.
		
		// set repeat call
		CommentpressAjaxSettings.interval = window.setInterval( cpac_ajax_update, 5000 );
		
	} else {
		
		// stop repeat
		window.clearInterval( CommentpressAjaxSettings.interval );
	
	}

}






/** 
 * @description: define what happens when the page is ready
 * @todo: 
 *
 */
jQuery(document).ready(function($) {

	/* cpac_lang[]:
	[0]: 'Loading...'
	[1]: 'Please enter your name.'
	[2]: 'Please enter your email address.'
	[3]: 'Please enter a valid email address.'
	[4]: 'Please enter your comment'
	[5]: 'Your comment has been added.'
	[6]: 'AJAX error!'
	*/
	
	
	
	

	// trigger repeat calls
	cpac_ajax_updater( cpac_live );
	
	/** 
	 * @description: ajax comment updating
	 * @todo: 
	 *
	jQuery('#btn_js').toggle( function() {
		
		// trigger repeat calls
		cpac_ajax_updater( false );
		
		jQuery(this).text('Javascript Off');
		
		return false;
		
	}, function() {
	
		// trigger repeat calls
		cpac_ajax_updater( true );
		
		jQuery(this).text('Javascript Off');
		
		return false;
		
	});
	 */
	
	
	
	


	/** 
	 * @description: init
	 * @todo: 
	 *
	 */
	var form, err;
	function cpac_initialise() {

		jQuery('#respond_title').after(
		
			'<div id="error" style="background: #761d19; margin: 0 0 0.4em 0; padding: 0.4em; -moz-border-radius: 6px; -khtml-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; color: #fff; line-height: 1.3em;"></div>'
			
		);
		jQuery('#commentform').after(
			'<img src="' + cpac_path + 'loading.gif" id="loading" alt="' + cpac_lang[0] + '" />'
		);
		jQuery('#loading').hide();
		form = jQuery('#commentform');
		err = jQuery('#error');
		err.hide();

	}
	
	// do it
	cpac_initialise();
	
	
	
	


	/** 
	 * @description: reset
	 * @todo: 
	 *
	 */
	function cpac_reset() {

		jQuery('#loading').hide();
		jQuery('#submit').removeAttr("disabled");
		jQuery('#submit').show();
		addComment.enableForm();
		cpac_submitting = false;

	}
	
	
	
	

	
	/** 
	 * @description: add comment to page
	 * @todo: 
	 *
	 */
	function cpac_add_comment( response ) {
	
		// get form data
		var text_sig = form.find('#text_signature').val();
		var comm_parent = form.find('#comment_parent').val();
		
		// get useful ids
		var para_id = '#para_wrapper-' + text_sig;
		var head_id = '#para_heading-' + text_sig;
		
		// if the comment is a reply, append the comment to the children
		if ( comm_parent != '0' ) {
			
			// get parent
			var parent_id = '#li-comment-' + comm_parent;
			
			// find the child list we want
			var child_list = jQuery(parent_id + ' > ol.children:first');
	
			// is there a child list?
			if ( child_list[0] ) {
			
				cpac_nice_append(
					response,
					parent_id + ' > ol.children:first li:last', 
					child_list, 
					parent_id + ' > ol.children:first li:last'
				);
				
			} else {
			
				cpac_nice_append(
					response, 
					parent_id + ' > ol.children:first', 
					parent_id,
					parent_id + ' > ol.children:first li:last'
				);
				
			}
			
		// if not, append the new comment at the bottom
		} else {
				
			// find the commentlist we want
			var comm_list = jQuery(para_id + ' > ol.commentlist:first');
	
			// is there a comment list?
			if ( comm_list[0] ) {
			
				cpac_nice_append(
					response,
					para_id + ' > ol.commentlist:first li:last',
					comm_list,
					para_id + ' > ol.commentlist:first li:last'
				);
				
			} else {
			
				cpac_nice_prepend(
					response,
					para_id + ' > ol.commentlist:first',
					para_id,
					para_id + ' > ol.commentlist:first li:last'
				);

			}
			
		}
	

		// slide up comment form
		jQuery('#respond').slideUp( 'fast', function() {  

			// after slide
			addComment.cancelForm();
			
		});
		
		// get paragraph header
		var head = response.find(head_id);
	
		// replace heading
		jQuery(head_id).replaceWith(head);
		
		// get comment number from paragraph header
		var comment_num = head.text().split(' ')[0];
		//alert(comment_num);
		
		// replace paragraph icon
		cpac_update_para_icon( text_sig, comment_num );	
	
		// re-enable clicks
		cp_enable_comment_permalink_clicks();
		cp_setup_comment_headers();
		
		// clear comment form
		form.find('#comment').val( '' );

		//err.html('<span class="success">' + cpac_lang[5] + '</span>');
		
	}
	
	
	
	
	
	
	/** 
	 * @description: do comment append
	 * @todo: 
	 *
	 */
	function cpac_nice_append( response, content, target, last ) {
	
		response.find(content)
				.hide()
				.appendTo(target);
		
		// clean up
		cpac_cleanup( content, last );
		
	}
	
	
	
	

	
	/** 
	 * @description: do comment prepend
	 * @todo: 
	 *
	 */
	function cpac_nice_prepend( response, content, target, last ) {
	
		response.find(content)
				.hide()
				.prependTo(target);
		
		// clean up
		cpac_cleanup( content, last );
		
	}
	
	
	
	

	
	/** 
	 * @description: do comment cleanup
	 * @todo: 
	 *
	 */
	function cpac_cleanup( content, last ) {
	
		// get the id of the last list item
		var last_id = jQuery(last).attr('id');
	
		// construct new comment id
		var new_comm_id = '#comment-' + last_id.split('-')[2];
		var comment = jQuery(new_comm_id);
		
		// highlight it
		comment.css('background', '#c2d8bc');
		
		jQuery(content).slideDown('slow',
		
			// animation complete
			function() {

				// scroll to new comment
				jQuery('#comments_sidebar .sidebar_contents_wrapper').scrollTo(
					comment, 
					{
						duration: cp_scroll_speed, 
						axis: 'y',
						onAfter: function() {
						
							// animate to white
							comment.animate({ backgroundColor: "#ffffff" }, 1000, function () {
								
								// then make transparent
								comment.css('background', 'transparent');
							
							});
							
						}
					}
				);
							
			}
			
		); // end slide
				
	}
	
	
	
	

	
	/** 
	 * @description: update paragraph comment icon
	 * @todo: 
	 *
	 */
	function cpac_update_para_icon( text_sig, comment_num ) {
	
		// cast comment num as string
		var comment_num = comment_num.toString();
	
		// get textblock id
		var textblock_id = '#textblock-' + text_sig;
	
		// get small tag
		var small = textblock_id + ' span small';

		// set comment icon text
		jQuery(small).html( comment_num );
		
		// if we're changing from 0 to 1...
		if ( comment_num == '1' ) {
	
			// set comment icon
			jQuery(textblock_id + ' span.commenticonbox a.para_permalink').addClass('has_comments');
		
			// show it
			jQuery(small).css( 'visibility', 'visible' );

		}

		// if not the whole page...
		if( text_sig != '' ) {

			// get text block
			var textblock = jQuery(textblock_id);
			
			// scroll page to
			cp_scroll_page( textblock );
			
		} else {
		
			// scroll to top
			cp_scroll_to_top( 0, cp_scroll_speed );
			
		}
		
	}
	
	
	
	

	
	/** 
	 * @description: comment submission method
	 * @todo: 
	 *
	 */
	jQuery('#commentform').live('submit', function(evt) {
	
		// set global flag
		cpac_submitting = true;
		
		// hide errors
		err.hide();
		
		// if not logged in, validate name and email
		if(form.find('#author')[0]) {
			
			// check for name
			if(form.find('#author').val() == '') {
				err.html('<span class="error">' + cpac_lang[1] + '</span>');
				err.show();
				cpac_submitting = false;
				return false;
			}
			
			// check for email
			if(form.find('#email').val() == '') {
				err.html('<span class="error">' + cpac_lang[2] + '</span>');
				err.show();
				cpac_submitting = false;
				return false;
			}

			// validate email
			var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				if(!filter.test(form.find('#email').val())) {
				err.html('<span class="error">' + cpac_lang[3] + '</span>');
				err.show();
				if (evt.preventDefault) {evt.preventDefault();}
				cpac_submitting = false;
				return false;
			}

		} // end if
		


		// test for tinyMCE
		if ( cp_tinymce == '1' ) {
		
			// set value of comment textarea to content
			tinyMCE.triggerSave();
			
			// unload tinyMCE
			addComment.disableForm();
		
		}
		
		// check for comment
		if(form.find('#comment').val() == '') {
			err.html('<span class="error">' + cpac_lang[4] + '</span>');
			err.show();
			// reload tinyMCE
			addComment.enableForm();
			cpac_submitting = false;
			return false;
		}
		


		// submit the form
		jQuery(this).ajaxSubmit({
			
			
			
			beforeSubmit: function() {
				
				jQuery('#loading').show();
				jQuery('#submit').attr('disabled','disabled');
				jQuery('#submit').hide();

			}, // end beforeSubmit
			


			error: function(request) {

				err.empty();
				var data = request.responseText.match(/<p>(.*)<\/p>/);
				err.html('<span class="error">' + data[1] + '</span>');
				err.show();

				cpac_reset();

				return false;

			}, // end error()
			


			success: function(data) {

				try {
				
					// get our data as object
					var response = jQuery(data);
					
					// add comment
					cpac_add_comment( response );
					cpac_reset();
				
				} catch (e) {

					cpac_reset();
					alert( cpac_lang[6] + '\n\n' + e );

				} // end try
				
			} // end success()
			


		}); // end ajaxSubmit()
		
		
		
		// --<
		return false; 

	}); // end form.submit()
	
	
	
	
	
	
	
}); // end document.ready()