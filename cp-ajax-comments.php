<?php

/*
Plugin Name: Commentpress Ajaxified
Version: 1.0
Plugin URI: http://www.futureofthebook.org/commentpress/
Description: This plugin allows comments to be posted without leaving or refreshing the page as well as a number of other enhancements. <strong>Please note:</strong> this plugin only works with the official Commentpress theme. <strong>For Wordpress Multisite:</strong> do not network activate this plugin. For more information see the Commentpress Plugin docs.
Author: Institute for the Future of the Book
Author URI: http://www.futureofthebook.org
*/






// activation
register_activation_hook( __FILE__, 'cpac_activate' );

// deactivation
register_deactivation_hook( __FILE__, 'cpac_deactivate' );

// enable the plugin at the appropriate point
add_action( 'wp', 'cpac_enable_plugin' );

// always add AJAX functionality
add_action( 'wp_ajax_cpac_get_new_comments', 'cpac_get_new_comments' );
add_action( 'wp_ajax_nopriv_cpac_get_new_comments', 'cpac_get_new_comments' );

// remove comment flood filter if you want more 'chat-like' functionality
//remove_filter('comment_flood_filter', 'wp_throttle_comment_flood', 10, 3);






/** 
 * @description: create option
 * @todo:
 *
 */
function cpac_activate() {

	// live comments disabled by default
	add_option( 'cp_para_comments_live', 0 );
	
}

/** 
 * @description: delete option
 * @todo: 
 *
 */
function cpac_deactivate() {
	
	// delete
	delete_option( 'cp_para_comments_live' );
	
}







/** 
 * @description: get context in which to enable this plugin
 * @todo: 
 *
 */
function cpac_enable_plugin() {

	// access globals
	global $commentpress_obj;
	
	// kick out if...
	
	// cp is not enabled
	if ( is_null( $commentpress_obj ) OR !is_object( $commentpress_obj ) )  { return; }
	
	// we're in the WP back end
	if ( is_admin() ) { return; }
		
	
	
	// add localised text
	add_action('wp_head', 'cpac_localise');

	// add our javascripts
	add_action('wp_enqueue_scripts', 'cpac_add_javascripts', 20);
	
}






/** 
 * @description: get new comments in response to an ajax request
 * @todo: 
 *
 */
function cpac_get_new_comments() {

	// init return
	$data = array();

	// get incoming data
	$last_comment_count = isset( $_POST[ 'last_count' ] ) ? $_POST[ 'last_count' ] : NULL;

	// store incoming unless updated later
	$data['cpac_comment_count'] = $last_comment_count;
	
	// get post ID
	$post_id = isset( $_POST[ 'post_id' ] ) ? $_POST[ 'post_id' ] : NULL;
	
	// make it an integer, just to be sure
	$post_id = (int) $post_id;
	
	// enable Wordpress API on post
	$GLOBALS['post'] = get_post( $post_id );



	// get any comments posted since last update time
	$data['cpac_new_comments'] = array();
	
	// get current array
	$current_comment_count_array = get_comment_count( $post_id );
	
	// get approved -> do we want others?
	$current_comment_count = $current_comment_count_array['approved'];
	
	// get number of new comments to fetch
	$num_to_get = (int) $current_comment_count - (int) $last_comment_count;
	
	// are there any?
	if ( $num_to_get > 0 ) {
	
		
		
		// update comment count since last request
		$data['cpac_comment_count'] = (string) $current_comment_count;
		
		
		
		// set get_comments defaults
		$defaults = array(
			'number' => $num_to_get,
			'orderby' => 'comment_date',
			'order' => 'DESC',
			'post_id' => $post_id,
			'status' => 'approve',
			'type' => 'comment'
		);
	
		// get them
		$comments = get_comments( $defaults );
		
		
		
		// if we get some - again, just to be sure
		if ( count( $comments ) > 0 ) {
		
			// init identifier
			$identifier = 1;
		
			// set args
			$args = array();
			$args['max_depth'] = get_option( 'thread_comments_depth' );
			
			// loop
			foreach( $comments AS $_comment ) {
			
				// assume top level
				$depth = 1;

				// if no parent
				if ( $_comment->comment_parent != '0' ) {
				
					// override depth
					$depth = cpac_get_comment_depth( $_comment, $depth );
					
				}
				
				// get comment markup
				$html = cp_get_comment_markup( $_comment, $args, $depth );
				
				// close li (walker would normally do this)
				$html .= '</li>'."\n\n\n\n";
				
				// add comment to array
				$data['cpac_new_comment_'.$identifier] = array(
				
					'parent' => $_comment->comment_parent,
					'id' => $_comment->comment_ID,
					'text_sig' => $_comment->comment_text_signature,
					'markup' => $html
					
				);
				
				// increment
				$identifier++;
			
			}
		
		}



	}
	


	// set reasonable headers
	header('Content-type: text/plain'); 
	header("Cache-Control: no-cache");
	header("Expires: -1");

	// echo
	echo json_encode( $data );
	//print_r( $last_comment_count );
	
	// die!
	exit();
	
}






/** 
 * @description: get comment depth
 * @todo: 
 *
 */
function cpac_get_comment_depth( $comment, $depth ) {
	
	// is parent top level?
	if ( $comment->comment_parent == '0' ) {
	
		// --<
		return $depth;
	
	}
	
	// get parent comment
	$parent = get_comment( $comment->comment_parent );
	
	// increase depth
	$depth++;
	
	// recurse
	return cpac_get_comment_depth( $parent, $depth );

}






/** 
 * @description: add our plugin javascripts
 * @todo: 
 *
 */
function cpac_add_javascripts() {
	
	// access globals
	global $post, $commentpress_obj;
	
	// can only now see $post
	if ( !cpac_plugin_can_activate() ) { return; }

	

	// init vars
	$vars = array();

	// is live commenting enabled?
	$vars['cpac_live'] = get_option( 'cp_para_comments_live', 0 );
	
	// get url
	$cpac_url = WP_PLUGIN_URL.'/'.str_replace(basename( __FILE__),"",plugin_basename(__FILE__));
	
	// we need to know the url of the Ajax handler
	$_ajax_url = admin_url( 'admin-ajax.php' );
	
	// prepare to pass
	$vars['cpac_ajax_url'] = $_ajax_url;
	
	// it's nice to know the url of the Ajax spinner GIF if we need it
	$_spinner_url = get_option('siteurl').'/wp-admin/images/loading.gif';
	
	// prepare to pass
	$vars['cpac_spinner_url'] = $_spinner_url;
	
	// 2009-08-09 14:46:14
	$vars['cpac_current_time'] = date('Y-m-d H:i:s');
	
	// get comment count at the time the page  is served
	$_count = get_comment_count( $post->ID );
	
	// adding moderation queue as well, since we do show these
	$vars['cpac_comment_count'] = $_count['approved']; // + $_count['awaiting_moderation'];
	
	// add post ID
	$vars['cpac_post_id'] = $post->ID;
	
	
	
	// default to minified scripts
	$debug_state = '';

	// target different scripts when debugging
	if ( defined( 'SCRIPT_DEBUG' ) AND SCRIPT_DEBUG === true ) {
	
		// use uncompressed scripts
		$debug_state = '.dev';
	
	}
	
	
	
	// are we asking for in-page comments?
	if ( $commentpress_obj->db->is_special_page() ) {
	
		// add comments in page script
		wp_enqueue_script('cpac', $cpac_url.'cp-ajax-comments-page'.$debug_state.'.js');
	
	} else {
	
		// add comments in sidebar script
		wp_enqueue_script('cpac', $cpac_url.'cp-ajax-comments'.$debug_state.'.js');
	
	}
	
	// use wp function to localise
	wp_localize_script( 'cpac', 'CommentpressAjaxSettings', $vars );
	
}






/** 
 * @description: translation
 * @todo: 
 *
 */
function cpac_localise() {
	
	// can only now see $post
	if ( !cpac_plugin_can_activate() ) { return; }
	
	// load translations
	load_plugin_textdomain('cpac');
	
	// add to head
	echo "<script type='text/javascript'>
	var cpac_lang = ['".__('Loading...', 'cpac')."',
					'".__('Please enter your name.', 'cpac')."',
					'".__('Please enter your email address.', 'cpac')."',
					'".__('Please enter a valid email address.', 'cpac')."',
					'".__('Please enter your comment.', 'cpac')."',
					'".__('Your comment has been added.', 'cpac')."',
					'".__('AJAX error!', 'cpac')."'];
	var cpac_path = '".WP_PLUGIN_URL.'/'.str_replace(basename( __FILE__),"",plugin_basename(__FILE__))."';
	</script>";
	
}






/** 
 * @description: utility to add link to settings page
 * @todo: 
 *
 */
function cpac_plugin_action_links( $links, $file ) {
	if ( $file == plugin_basename( dirname(__FILE__).'/cp-ajax-comments.php' ) ) {
		$links[] = '<a href="options-general.php?page=cp_admin_page#cp_para_comments_live">'.__('Settings').'</a>';
	}

	return $links;
}

add_filter( 'plugin_action_links', 'cpac_plugin_action_links', 10, 2 );




/** 
 * @description: validate that the plugin can be activated
 * @todo: 
 *
 */
function cpac_plugin_can_activate() {

	// access globals
	global $post, $commentpress_obj;
	
	// disallow if no post ID (such as 404)
	if ( !is_object( $post ) )  { return false; }
	
	// it's the Theme My Login page
	if ( $commentpress_obj->is_theme_my_login_page() ) { return false; }
	
	// init
	$allowed = true;
	
	// disallow generally if page doesn't have a comments sidebar
	if ( $commentpress_obj->get_default_sidebar() != 'comments' )  { $allowed = false; }
	
	// but, allow general comments page
	if ( $commentpress_obj->db->option_get( 'cp_general_comments_page' ) == $post->ID ) { $allowed = true; }
	
	// --<
	return $allowed;
	
}




?>