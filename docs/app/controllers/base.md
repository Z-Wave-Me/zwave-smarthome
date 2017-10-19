**Overview:** The parent controller that stores all function used in the child controllers.



**Author:** Martin Vach




* * *

# Global





* * *

## BaseController
The app base controller.

**naviExpanded**:  , Expand/collapse navigation
**autocompleteExpanded**:  , Expand/collapse autocomplete
**modalArr**:  , Open/close a modal window
**sidebarState**:  , Expand/collapse sidebar
### BaseController.extendUser() 

Extend an user

**Returns**: `undefined`

### BaseController.setSkin() 

Set app skin

**Returns**: `undefined`

### BaseController.routeMatch(path) 

Check if route match the pattern.

**Parameters**

**path**: `string`

**Returns**: `Boolean`

### BaseController.elementAccess(roles, mobile) 

Allow to access page elements by role.

**Parameters**

**roles**: `array`

**mobile**: `boolean`

**Returns**: `Boolean`

### BaseController.loadRssInfo() 

Load a rss info

**Returns**: `undefined`

### BaseController.setTimeStamp() 

Set timestamp and ping server if request fails

**Returns**: `undefined`

### BaseController.reloadAfterError() 

Set user session and reload page after connection error

**Returns**: `undefined`

### BaseController.setPollInterval() 

Set poll interval

**Returns**: `undefined`

### BaseController.isInArray(array, value) 

Check if value is in array

**Parameters**

**array**: `array`

**value**: `mixed`

**Returns**: `Boolean`

### BaseController.getLang() 

Get a language key from the cookie or set a default language.

**Returns**: `undefined`

### BaseController.loadLang(lang) 

Load an language file

**Parameters**

**lang**: `string`

**Returns**: `undefined`

### BaseController.orderBy(field) 

Order by

**Parameters**

**field**: `string`

**Returns**: `undefined`

### BaseController.getBodyId() 

Get body ID

**Returns**: `String`

### BaseController.isActive(route) 

Check if the route match the given param and set active class in the element.

**Parameters**

**route**: `string`

**Returns**: `String`

### BaseController.reloadData() 

Causes $route service to reload the current route even if $location hasn't changed.

**Returns**: `undefined`

### BaseController.redirectToRoute(url) 

Redirect to given url

**Parameters**

**url**: `string`

**Returns**: `undefined`

### BaseController.getAppLogo() 

Get an app logo according to app_type settings

**Returns**: `String`

### BaseController.getHiddenApps() 

Get an array of the hidden apps according to app_type settings

**Returns**: `Array`

### BaseController.getCustomCfgArr(key) 

Get array from custom config

**Parameters**

**key**: `string`

**Returns**: `Array`

### BaseController.toExpert(url, message) 

Redirect to Expert

**Parameters**

**url**: `string`

**message**: `string`

**Returns**: `undefined`

### BaseController.onclick() 

Collapse navi, menu and autocomplete when clicking outside


### BaseController.expandElement(key) 

Expand/collapse an element

**Parameters**

**key**: `string`

**Returns**: `undefined`

### BaseController.toggleRowSpinner(key) 

Toggle row spinner

**Parameters**

**key**: `string`

**Returns**: `undefined`

### BaseController.setAlertifyDefaults() 

Set alertify defaults




* * *
