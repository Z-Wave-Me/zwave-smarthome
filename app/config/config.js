/**
 * App configuration
 * @author Martin Vach
 */

var config_module = angular.module('myAppConfig', []);
var config_data = {
  'cfg': {
    //Application name
    'app_name': 'My App',
    
    // Application version
    'app_version': '0.1',
    
    // Api server base url
    'server_url': '',
    
    // Demo ddata path
    'demo_url': 'storage/demo/',
    
    // Language directory
    'lang_dir': 'app/lang/',
    
     // Default language
    'lang': 'en',
    
    // List of supported languages
    'lang_list': ["en","de","fr","es"],
    
    // List of profile colors
    'profile_colors': ['#3071A9','#449D44','#31B0D5','#F0AD4E','#D9534F'],
    
     // Results per page
    'page_results': 12
    
    
    
  }
};
angular.forEach(config_data,function(key,value) {
  config_module.constant(value,key);
});