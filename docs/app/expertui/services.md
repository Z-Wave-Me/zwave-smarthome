**Overview:** Common functions that are used within device hardware configuration



**Author:** Martin Vach




* * *

# Global





* * *

## expertService
Angular module initialization

### expertService.getLangLine(key, languages) 

Get language line by key

**Parameters**

**key**: `string`

**languages**: `object`

**Returns**: `unresolved`

### expertService.configGetNav(ZWaveAPIData) 

Get config navigation devices

**Parameters**

**ZWaveAPIData**: `object`

**Returns**: `unresolved`

### expertService.configGetZddxLang(node, lang) 

Get language from zddx

**Parameters**

**node**: `object`

**lang**: `string`

**Returns**: `unresolved`

### expertService.getCfgXmlParam(cfgXml, nodeId, instance, commandClass, command) 

Get xml config param

**Parameters**

**cfgXml**: `object`

**nodeId**: `int`

**instance**: `string`

**commandClass**: `string`

**command**: `string`

**Returns**: `unresolved`

### expertService.configConfigCont(node, nodeId, zddXml, cfgXml, lang, languages) 

Config cont

**Parameters**

**node**: `object`

**nodeId**: `int`

**zddXml**: `object`

**cfgXml**: `object`

**lang**: `string`

**languages**: `object`

**Returns**: `unresolved`

### expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml) 

Switch all cont

**Parameters**

**node**: `object`

**nodeId**: `int`

**ZWaveAPIData**: `object`

**cfgXml**: `object`

**Returns**: `unresolved`

### expertService.configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml) 

Protection cont

**Parameters**

**node**: `object`

**nodeId**: `int`

**ZWaveAPIData**: `object`

**cfgXml**: `object`

**Returns**: `unresolved`

### expertService.configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml) 

Wakeup cont

**Parameters**

**node**: `object`

**nodeId**: `int`

**ZWaveAPIData**: `object`

**cfgXml**: `object`

**Returns**: `unresolved`

### expertService.buildCfgXml(data, cfgXml, id, commandclass) 

Build config XML file

**Parameters**

**data**: `object`

**cfgXml**: `object`

**id**: `int`

**commandclass**: `string`

**Returns**: `unresolved`

### expertService.getLangLine() 

Get language line by key


### expertService.configGetNav() 

Get config navigation devices


### expertService.configGetZddxLang() 

Get language from zddx


### expertService.getCfgXmlParam() 

Get xml config param


### expertService.configConfigCont() 

Config cont


### expertService.configSwitchAllCont() 

Switch all cont


### expertService.configProtectionCont() 

Protection cont


### expertService.configWakeupCont() 

Wakeup cont


### expertService.buildCfgXml() 

Build config XML file


### expertService.buildCfgXmlFile() 

Build cfg XML file




* * *
