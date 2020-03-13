<?php 
/**
 * Plugin Name:       Developer Redirect
 * Plugin URI:        https://techdisorder/wordpress/plugins/developer-redirect
 * Description:       Adds a Developer Console to the page and disables the cache. 
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.0
 * Author:            Veronica Sheehan
 * Author URI:        https://techdisorder.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */
 
namespace TechDisorder;


if ( ! class_exists( __NAMESPACE__ . '\DeveloperRedirect' ) ) {

    class DeveloperRedirect {
        
        public static $instance = false;
        
        public static function get_instance() {
            if ( ! self::$instance ) {
                self::$instance = new self();
            }
            return self::$instance;
        
        }
        
        private function __construct() {
            if ( WP_DEBUG ) {
                add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
                add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
                add_action( 'get_header',  [ $this, 'disable_cache' ] );
            }
        }
        
    
        public static function disable_cache() {
			header('Cache-Control: no-cache, must-revalidate');
		}
    
    
        public function enqueue() {
            $git_url = 'https://vsheehan.github.io/wordpress-common/';
            $assets = trailingslashit( plugin_dir_url( __FILE__ ) ) . 'assets/';
        
            wp_register_script(
            	'techdisorder-common-developer-redirect',
            	$assets . 'js/developer-redirect.js',
            	[],
            	filemtime( plugin_dir_path( __FILE__ ) . 'assets/css/developer-redirect.less' ),
            	false
        	);

            //die( $assets. 'js/developer-redirect.js' );

			wp_register_style(
				'techdisorder-common-developer-redirect',
				$assets . 'css/developer-redirect.css',
				[],
				'1.0.0',
				'all'
			);

			wp_enqueue_script('techdisorder-common-developer-redirect');
					
			wp_enqueue_style('techdisorder-common-developer-redirect');
        
        }
    }
    
    DeveloperRedirect::get_instance();   
    
}

