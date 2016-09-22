**Overview:** The parent controller that stores all function used in the child controllers.



**Author:** Martin Vach




* * *

# Global





* * *

## BaseController
The app base controller.

### BaseController.setSkin() 

Set app skin

**Returns**: `undefined`

### BaseController.routeMatch(path) 

Check if route match the pattern.

**Parameters**

**path**: `string`

**Returns**: `Boolean`

### BaseController.resetFatalError(obj) 

Reset a fatal error.

**Parameters**

**obj**: `object`

**Returns**: `undefined`

### BaseController.setTimeZone() 

Set a time

**Returns**: `undefined`

### BaseController.setPollInterval() 

Set poll interval

**Returns**: `undefined`

### BaseController.elementAccess(roles, mobile) 

Allow to access page elements by role.

**Parameters**

**roles**: `array`

**mobile**: `boolean`

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

### BaseController.expandNavi(key, $event, status) 

Expand/collapse navigation

**Parameters**

**key**: `string`

**$event**: `object`

**status**: `boolean`

**Returns**: `undefined`

### BaseController.handleModal(key, $event, status) 

Open/close a modal window

**Parameters**

**key**: `string`

**$event**: `object`

**status**: `boolean`

**Returns**: `undefined`

### BaseController.expandElement(key) 

Expand/collapse an element

**Parameters**

**key**: `string`

**Returns**: `undefined`



* * *
