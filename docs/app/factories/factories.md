**Overview:** Angular factories that handle cache, Underscore and HTTP requests.



**Author:** Martin Vach




* * *

# Global





* * *

## myCache
The factory that handles angular $cacheFactory


## Underscore
The factory that handles the Underscore library


## dataFactory
The factory that handles all local and remote HTTP requests

### dataFactory.pingServer(url) 

Connect to the specified url

**Parameters**

**url**: `string`

**Returns**: `unresolved`

### dataFactory.logInApi(data) 

Handles login process

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataFactory.sessionApi() 

Get Z-Wave session

**Returns**: `unresolved`

### dataFactory.getApiLocal(file) 

Get local data from the storage directory

**Parameters**

**file**: `string`

**Returns**: `unresolved`

### dataFactory.getApi(api, params, noCache, fatalError) 

Get ZAutomation api data

**Parameters**

**api**: `string`

**params**: `string`

**noCache**: `boolean`

**fatalError**: `boolean`

**Returns**: `unresolved`

### dataFactory.postApi(api, data, params) 

Post ZAutomation api data

**Parameters**

**api**: `string`

**data**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.putApi(api, id, data, params) 

Put ZAutomation api data

**Parameters**

**api**: `string`

**id**: `int`

**data**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.putApiWithHeaders(api, id, data, headers, params) 

Put ZAutomation api data with predefined HTTP headers

**Parameters**

**api**: `string`

**id**: `int`

**data**: `object`

**headers**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.putApiFormdata(api, data, params) 

Put ZAutomation api data with x-www-form-urlencoded header

**Parameters**

**api**: `string`

**data**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.storeApi(api, id, data, params) 

Put or Post ZAutomation api data - depends on id

**Parameters**

**api**: `string`

**id**: `int`

**data**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.deleteApi(api, id, params) 

Delete ZAutomation api data

**Parameters**

**api**: `string`

**id**: `int`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.deleteApiFormdata(api, data, params) 

Delete ZAutomation api data with x-www-form-urlencoded header

**Parameters**

**api**: `string`

**data**: `object`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.runApiCmd(cmd) 

Get ZAutomation api command

**Parameters**

**cmd**: `string`

**Returns**: `unresolved`

### dataFactory.runExpertCmd(param) 

Post ZWaveAPI run command

**Parameters**

**param**: `type`

**Returns**: `unresolved`

### dataFactory.xmlToJson(url, noCache) 

Get XML from url and convert it to JSON

**Parameters**

**url**: `string`

**noCache**: `boolean`

**Returns**: `unresolved`

### dataFactory.putCfgXml(data) 

Put XML configuration file into Configuration.xml

**Parameters**

**data**: `xml`

**Returns**: `unresolved`

### dataFactory.getRemoteData(url, noCache) 

Get data from the remote resource

**Parameters**

**url**: `string`

**noCache**: `boolean`

**Returns**: `unresolved`

### dataFactory.refreshApi(api, params) 

Get data from the ZAutomation api and update it

**Parameters**

**api**: `string`

**params**: `string`

**Returns**: `unresolved`

### dataFactory.uploadApiFile(cmd, data) 

Upload a file to ZAutomation

**Parameters**

**cmd**: `type`

**data**: `type`

**Returns**: `unresolved`

### dataFactory.getSystemCmd(cmd) 

Get ZAutomation api system command

**Parameters**

**cmd**: `string`

**Returns**: `unresolved`

### dataFactory.getLanguageFile(lang) 

Get a file with language keys values from the app/lang directory

**Parameters**

**lang**: `string`

**Returns**: `unresolved`

### dataFactory.loadZwaveApiData(noCache) 

Get data holder from ZWaveAPI api

**Parameters**

**noCache**: `boolean`

**Returns**: `unresolved`

### dataFactory.refreshZwaveApiData() 

Get updated data holder from the ZAutomation

**Returns**: `unresolved`

### dataFactory.joinedZwaveData(ZWaveAPIData) 

Get updated ZAutomation data and join it to ZAutomation data holder

**Parameters**

**ZWaveAPIData**: `object`

**Returns**: `unresolved`

### dataFactory.runZwaveCmd(cmd) 

Get Zwave api command

**Parameters**

**cmd**: `string`

**Returns**: `unresolved`

### dataFactory.loadEnoceanApiData(noCache) 

Get EnOcean data holder from the EnOceanAPI

**Parameters**

**noCache**: `boolean`

**Returns**: `unresolved`

### dataFactory.runEnoceanCmd(cmd) 

Get EnOcean command from the EnOceanAPI Run

**Parameters**

**cmd**: `string`

**Returns**: `unresolved`

### dataFactory.refreshEnoceanApiData() 

Get updated Enocean data from the EnOceanAPI

**Returns**: `unresolved`

### dataFactory.getLicense(data) 

Post licence data from the remote server

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataFactory.zmeCapabilities(data) 

Post ZME Capabilities

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataFactory.postReport(data) 

Post a bug report on the remote server

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataFactory.postToRemote(url, data) 

Post on the remote server

**Parameters**

**url**: `string`

**data**: `object`

**Returns**: `unresolved`

### dataFactory.getOnlineModules(data, noCache) 

Load On-line modules from the remote server

**Parameters**

**data**: `object`

**noCache**: `boolean`

**Returns**: `unresolved`

### dataFactory.installOnlineModule(data, api) 

Install a module from the remote server

**Parameters**

**data**: `object`

**api**: `string`

**Returns**: `unresolved`

### dataFactory.restoreFromBck(data) 

Resore the system from the backup file

**Parameters**

**data**: `object`

**Returns**: `unresolved`

### dataFactory.getHelp(file) 

Load a help page from the storage directory

**Parameters**

**file**: `string`

**Returns**: `unresolved`

### dataFactory.getAppBuiltInfo() 

Get app built info

**Returns**: `unresolved`



* * *
