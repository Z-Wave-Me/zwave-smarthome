var config_data = {
    'cfg': {
        //Application name
        'app_name': 'HAUI',
        // Application version
        'app_version': '0.1',
        // Application type: web/app
        'app_type': 'web',
        // Server base url
        //'server_url': '/',
        'server_url': 'http://zwave.dyndns.org:8083/',
        // Interval in miliseconds to refresh data
        'interval': 3000,
        // List of API links
        'api': {
            'devices': 'ZAutomation/api/v1/devices',
            'profiles': 'ZAutomation/api/v1/profiles',
            'locations': 'ZAutomation/api/v1/locations',
            'notifications': 'ZAutomation/api/v1/notifications',
            'modules': 'ZAutomation/api/v1/modules',
            'modules_categories': 'ZAutomation/api/v1/modules/categories',
            'instances': 'ZAutomation/api/v1/instances',
            'namespaces': 'ZAutomation/api/v1/namespaces'
        },
        // List of image pathes
        'img': {
            'icons': 'storage/img/icons/'
        },
        // Api url
        'api_url': 'ZAutomation/api/v1/',
        // ZWave api url
        'zwave_api_url': 'ZWaveAPI/',
        // Local data path
        'local_data_url': 'storage/data/',
        // Language directory
        'lang_dir': 'app/lang/',
        // Default language
        'lang': 'en',
        // List of supported languages
        'lang_list': ["en", "de","ru"],
         // List of language codes
        'lang_codes': {
            'en': 'en_EN',
            'de': 'de_AT',
            'ru': 'en_EN'
        },
        // List of profile colors
        'profile_colors': ['#6C7A89', '#3071A9', '#449D44', '#31B0D5', '#F0AD4E', '#D9534F'],
        // Chart colors
        'chart_colors': {
                fillColor: 'rgba(151,187,205,0.5)',
                strokeColor: 'rgba(151,187,205,1)',
                pointColor: 'rgba(151,187,205,1)',
                pointStrokeColor: '#fff'
            },
        // Device vendors
        'device_vendors': ['zwave', 'enocean', 'ipcamera'],
        // Results per page
        'page_results': 12



    }
};