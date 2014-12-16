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
    
    // Server base url
    'server_url': 'http://zwave.dyndns.org:8083/',
    
    // Interval in miliseconds to refresh data
     'interval': 3000,
    
    // List of API links
    'api': {
        'devices':'ZAutomation/api/v1/devices',
        'profiles':'ZAutomation/api/v1/profiles',
        'locations':'ZAutomation/api/v1/locations',
        'notifications':'/ZAutomation/api/v1/notifications',
        'modules':'ZAutomation/api/v1/modules',
        'modules_categories':'/ZAutomation/api/v1/modules/categories',
        'instances':'ZAutomation/api/v1/instances'
    },
    
    // List of image pathes
    'img': {
        'icons':'storage/img/icons/'
    },
    
    // Api url
    'api_url': '/ZAutomation/api/v1/',
    
    // Demo data path
    'demo_url': 'storage/demo/',
    
    // Language directory
    'lang_dir': 'app/lang/',
    
     // Default language
    'lang': 'en',
    
    // List of supported languages
    'lang_list': ["en","de"],
    
    // List of profile colors
    'profile_colors': ['#6C7A89','#3071A9','#449D44','#31B0D5','#F0AD4E','#D9534F'],
    
     // Results per page
    'page_results': 12
    
    
    
  }
};
angular.forEach(config_data,function(key,value) {
  config_module.constant(value,key);
});