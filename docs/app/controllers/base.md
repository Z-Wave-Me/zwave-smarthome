# Global





* * *

## Class: BaseController
The app base controller.

### BaseController.resetFatalError(obj) 

Reset a fatal error.

**Parameters**

**obj**: `object`, Reset a fatal error.

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

**roles**: `array`, Allow to access page elements by role.

**mobile**: `boolean`, Allow to access page elements by role.

**Returns**: `Boolean`

### BaseController.getLang() 

Get a language key from the cookie or set a default language.

**Returns**: `undefined`

### BaseController.loadLang(lang) 

Load an language file

**Parameters**

**lang**: `string`, Load an language file

**Returns**: `undefined`

### BaseController.orderBy(field) 

Order by

**Parameters**

**field**: `string`, Order by

**Returns**: `undefined`

### BaseController.routeMatch(path) 

Check if route match the pattern.

**Parameters**

**path**: `string`, Check if route match the pattern.

**Returns**: `Boolean`

### BaseController.getBodyId() 

Get body ID

**Returns**: `String`

### BaseController.isActive(route) 

Check if the route match the given param and set active class in the element.

**Parameters**

**route**: `string`, Check if the route match the given param and set active class in the element.

**Returns**: `String`

### BaseController.reloadData() 

Causes $route service to reload the current route even if $location hasn't changed.

**Returns**: `undefined`

### BaseController.redirectToRoute(url) 

Redirect to given url

**Parameters**

**url**: `string`, Redirect to given url

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

**key**: `string`, Get array from custom config

**Returns**: `Array`

### BaseController.toExpert(url, message) 

Redirect to Expert

**Parameters**

**url**: `string`, Redirect to Expert

**message**: `string`, Redirect to Expert

**Returns**: `undefined`

### BaseController.expandNavi(key, $event, status) 

Expand/collapse navigation

**Parameters**

**key**: `string`, Expand/collapse navigation

**$event**: `object`, Expand/collapse navigation

**status**: `boolean`, Expand/collapse navigation

**Returns**: `undefined`

### BaseController.handleModal(key, $event, status) 

Open/close a modal window

**Parameters**

**key**: `string`, Open/close a modal window

**$event**: `object`, Open/close a modal window

**status**: `boolean`, Open/close a modal window

**Returns**: `undefined`

### BaseController.expandElement(key) 

Expand/collapse an element

**Parameters**

**key**: `string`, Expand/collapse an element

**Returns**: `undefined`



* * *



**Author:** Martin Vach



**Overview:** The parent controller that stores all function used in the child controllers.


