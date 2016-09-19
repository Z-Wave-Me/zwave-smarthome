**Overview:** Stores methods that are used within controllers.



**Author:** Martin Vach




* * *

# Global





* * *

## dataService
Angular module initialization

### dataService.getLangLine(key, languages, replacement) 

Get a language string by key

**Parameters**

**key**: `string`

**languages**: `object`

**replacement**: `object`

**Returns**: `unresolved`

### dataService.showNotifier(notifier) 

Render alertify notifier

**Parameters**

**notifier**: `object`

**Returns**: `undefined`

### dataService.logError(error, message) 

Log error in the console

**Parameters**

**error**: `string`

**message**: `string`

**Returns**: `undefined`

### dataService.getOs() 

Get OS (operating system)

**Returns**: `String`

### dataService.isIeEdge() 

Get OS (operating system)

**Returns**: `String`

### dataService.isMobile(a) 

Detect a mobile device

**Parameters**

**a**: `string`

**Returns**: `Boolean`

### dataService.goBack() 

Window history go back

**Returns**: `undefined`

### dataService.getUser() 

Get user data from cookies

**Returns**: `Array | Boolean`

### dataService.setUser(data) 

Set user data

**Parameters**

**data**: `object`

**Returns**: `Boolean | Object`

### dataService.unsetUser() 

Unset user data - delete user cookies

**Returns**: `undefined`

### dataService.getZWAYSession() 

Get ZWAY session

**Returns**: `string`

### dataService.setZWAYSession(sid) 

Set ZWAY session

**Parameters**

**sid**: `string`

**Returns**: `Boolean | Object`

### dataService.getLastLogin() 

Get last login info

**Returns**: `Sring | Boolean`

### dataService.setLastLogin(val) 

Set last login

**Parameters**

**val**: `string`

**Returns**: `undefined`

### dataService.getRememberMe() 

Get remember me

**Returns**: `Object | Boolean`

### dataService.setRememberMe(data) 

Set remember me

**Parameters**

**data**: `object`

**Returns**: `Boolean | Object`

### dataService.logOut() 

Logout from the system

**Returns**: `undefined`

### dataService.uploadFileNewName(fileName) 

Build a new file name without invalid chars

**Parameters**

**fileName**: `string`

**Returns**: `string`

### dataService.assignElementIcon(element) 

Assign an icon to the element

**Parameters**

**element**: `object`

**Returns**: `string`

### dataService.getDevicesData(data, showHidden) 

Get devices -  filtered data from devices dataholder

**Parameters**

**data**: `object`

**showHidden**: `boolean`

**Returns**: `unresolved`

### dataService.getSingleElementIcons(element) 

Get an object with element icons

**Parameters**

**element**: `object`

**Returns**: `object`

### dataService.getRooms(data) 

Get rooms - filtered data from locations dataholder

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataService.getLocalSkins(data) 

Get local skins - filtered data from skin dataholder

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataService.getZwaveProducts(data) 

Get zwave products - filtered data from devices dataholder

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataService.getChartData(data, colors) 

Renders the chart data

**Parameters**

**data**: `object`

**colors**: `object`

**Returns**: `Object | NULL`

### dataService.getModuleFormData(module, data) 

Renders Alpaca module data

**Parameters**

**module**: `object`

**data**: `object`

**Returns**: `unresolved`

### dataService.getModuleConfigInputs(module, params, namespaces) 

Renders module config data

**Parameters**

**module**: `object`

**params**: `string`

**namespaces**: `object`

**Returns**: `unresolved`

### dataService.setArrayValue(data, key, add) 

Angular module initialization

**Parameters**

**data**: `object`

**key**: `string`

**add**: `boolean`

**Returns**: `Array`

### dataService.getEventLevel(data, set) 

Get event level

**Parameters**

**data**: `object`

**set**: `array`

**Returns**: `unresolved`

### dataService.setEnoProfile(data) 

Renders EnOcean profile

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataService.compareVersions(v1, v2) 

Compare whether two versions of a resource are the same

**Parameters**

**v1**: `string`

**v2**: `string`

**Returns**: `Boolean`

### dataService.assignElementIcon() 

Assign an icon to the element


### dataService.getLangLine() 

Get a language string by key


### dataService.setLangLine() 

Set lang line params


### dataService.getModuleFormData() 

Renders Alpaca module data


### dataService.replaceModuleFormData() 

Replace module object


### dataService.addArrayValue() 

Add array value


### dataService.removeArrayValue() 

Remove array value




* * *
