# Global





* * *

## Class: myCache
The factory that handles angular $cacheFactory


## Class: myCache
The factory that handles the Underscore library


## Class: dataFactory
The factory that handles all local and remote HTTP requests

### dataFactory.logInApi(data) 

Handles login process

**Parameters**

**data**: `object`, Handles login process

**Returns**: `unresolved`

### dataFactory.sessionApi() 

Get Z-Wave session

**Returns**: `unresolved`

### dataFactory.getApiLocal(file) 

Get local data from the storage directory

**Parameters**

**file**: `string`, Get local data from the storage directory

**Returns**: `unresolved`

### dataFactory.getApi(api, params, noCache, fatalError) 

Get ZAutomation api data

**Parameters**

**api**: `string`, Get ZAutomation api data

**params**: `string`, Get ZAutomation api data

**noCache**: `boolean`, Get ZAutomation api data

**fatalError**: `boolean`, Get ZAutomation api data

**Returns**: `unresolved`

### dataFactory.postApi(api, data, params) 

Post ZAutomation api data

**Parameters**

**api**: `string`, Post ZAutomation api data

**data**: `object`, Post ZAutomation api data

**params**: `string`, Post ZAutomation api data

**Returns**: `unresolved`

### dataFactory.putApi(api, id, data, params) 

Put ZAutomation api data

**Parameters**

**api**: `string`, Put ZAutomation api data

**id**: `int`, Put ZAutomation api data

**data**: `object`, Put ZAutomation api data

**params**: `string`, Put ZAutomation api data

**Returns**: `unresolved`

### dataFactory.putApiWithHeaders(api, id, data, headers, params) 

Put ZAutomation api data with predefined HTTP headers

**Parameters**

**api**: `string`, Put ZAutomation api data with predefined HTTP headers

**id**: `int`, Put ZAutomation api data with predefined HTTP headers

**data**: `object`, Put ZAutomation api data with predefined HTTP headers

**headers**: `object`, Put ZAutomation api data with predefined HTTP headers

**params**: `string`, Put ZAutomation api data with predefined HTTP headers

**Returns**: `unresolved`

### dataFactory.putApiFormdata(api, data, params) 

Put ZAutomation api data with x-www-form-urlencoded header

**Parameters**

**api**: `string`, Put ZAutomation api data with x-www-form-urlencoded header

**data**: `object`, Put ZAutomation api data with x-www-form-urlencoded header

**params**: `string`, Put ZAutomation api data with x-www-form-urlencoded header

**Returns**: `unresolved`

### dataFactory.storeApi(api, id, data, params) 

Put or Post ZAutomation api data - depends on id

**Parameters**

**api**: `string`, Put or Post ZAutomation api data - depends on id

**id**: `int`, Put or Post ZAutomation api data - depends on id

**data**: `object`, Put or Post ZAutomation api data - depends on id

**params**: `string`, Put or Post ZAutomation api data - depends on id

**Returns**: `unresolved`

### dataFactory.deleteApi(api, id, params) 

Delete ZAutomation api data

**Parameters**

**api**: `string`, Delete ZAutomation api data

**id**: `int`, Delete ZAutomation api data

**params**: `string`, Delete ZAutomation api data

**Returns**: `unresolved`

### dataFactory.deleteApiFormdata(api, data, params) 

Delete ZAutomation api data with x-www-form-urlencoded header

**Parameters**

**api**: `string`, Delete ZAutomation api data with x-www-form-urlencoded header

**data**: `object`, Delete ZAutomation api data with x-www-form-urlencoded header

**params**: `string`, Delete ZAutomation api data with x-www-form-urlencoded header

**Returns**: `unresolved`

### dataFactory.runApiCmd(cmd) 

Get ZAutomation api command

**Parameters**

**cmd**: `string`, Get ZAutomation api command

**Returns**: `unresolved`

### dataFactory.runExpertCmd(param) 

Post ZWaveAPI run command

**Parameters**

**param**: `type`, Post ZWaveAPI run command

**Returns**: `unresolved`

### dataFactory.xmlToJson(url, noCache) 

Get XML from url and convert it to JSON

**Parameters**

**url**: `string`, Get XML from url and convert it to JSON

**noCache**: `boolean`, Get XML from url and convert it to JSON

**Returns**: `unresolved`

### dataFactory.putCfgXml(data) 

Put XML configuration file into Configuration.xml

**Parameters**

**data**: `xml`, Put XML configuration file into Configuration.xml

**Returns**: `unresolved`

### dataFactory.getRemoteData(url, noCache) 

Get data from the remote resource

**Parameters**

**url**: `string`, Get data from the remote resource

**noCache**: `boolean`, Get data from the remote resource

**Returns**: `unresolved`

### dataFactory.refreshApi(api, params) 

Get data from the ZAutomation api and update it

**Parameters**

**api**: `string`, Get data from the ZAutomation api and update it

**params**: `string`, Get data from the ZAutomation api and update it

**Returns**: `unresolved`

### dataFactory.uploadApiFile(cmd, data) 

Upload a file to ZAutomation

**Parameters**

**cmd**: `type`, Upload a file to ZAutomation

**data**: `type`, Upload a file to ZAutomation

**Returns**: `unresolved`

### dataFactory.getSystemCmd(cmd) 

Get ZAutomation api system command

**Parameters**

**cmd**: `string`, Get ZAutomation api system command

**Returns**: `unresolved`

### dataFactory.getLanguageFile(lang) 

Get a file with language keys values from the app/lang directory

**Parameters**

**lang**: `string`, Get a file with language keys values from the app/lang directory

**Returns**: `unresolved`

### dataFactory.loadZwaveApiData(noCache, fatalError) 

Get data holder from ZWaveAPI api

**Parameters**

**noCache**: `boolean`, Get data holder from ZWaveAPI api

**fatalError**: `boolean`, Get data holder from ZWaveAPI api

**Returns**: `unresolved`

### dataFactory.refreshZwaveApiData() 

Get updated data holder from the ZAutomation

**Returns**: `unresolved`

### dataFactory.joinedZwaveData(ZWaveAPIData) 

Get updated ZAutomation data and join it to ZAutomation data holder

**Parameters**

**ZWaveAPIData**: `object`, Get updated ZAutomation data and join it to ZAutomation data holder

**Returns**: `unresolved`

### dataFactory.runZwaveCmd(cmd) 

Get Zwave api command

**Parameters**

**cmd**: `string`, Get Zwave api command

**Returns**: `unresolved`

### dataFactory.loadEnoceanApiData(noCache) 

Get EnOcean data holder from the EnOceanAPI

**Parameters**

**noCache**: `boolean`, Get EnOcean data holder from the EnOceanAPI

**Returns**: `unresolved`

### dataFactory.runEnoceanCmd(cmd) 

Get EnOcean command from the EnOceanAPI Run

**Parameters**

**cmd**: `string`, Get EnOcean command from the EnOceanAPI Run

**Returns**: `unresolved`

### dataFactory.refreshEnoceanApiData() 

Get updated Enocean data from the EnOceanAPI

**Returns**: `unresolved`

### dataFactory.getLicense(data) 

Post licence data from the remote server

**Parameters**

**data**: `object`, Post licence data from the remote server

**Returns**: `unresolved`

### dataFactory.zmeCapabilities(data) 

Post ZME Capabilities

**Parameters**

**data**: `object`, Post ZME Capabilities

**Returns**: `unresolved`

### dataFactory.postReport(data) 

Post a bug report on the remote server

**Parameters**

**data**: `object`, Post a bug report on the remote server

**Returns**: `unresolved`

### dataFactory.postToRemote(url, data) 

Post on the remote server

**Parameters**

**url**: `string`, Post on the remote server

**data**: `object`, Post on the remote server

**Returns**: `unresolved`

### dataFactory.getOnlineModules(data, noCache) 

Load On-line modules from the remote server

**Parameters**

**data**: `object`, Load On-line modules from the remote server

**noCache**: `boolean`, Load On-line modules from the remote server

**Returns**: `unresolved`

### dataFactory.installOnlineModule(data, api) 

Install a module from the remote server

**Parameters**

**data**: `object`, Install a module from the remote server

**api**: `string`, Install a module from the remote server

**Returns**: `unresolved`

### dataFactory.restoreFromBck(data) 

Resore the system from the backup file

**Parameters**

**data**: `object`, Resore the system from the backup file

**Returns**: `unresolved`

### dataFactory.getHelp(file) 

Load a help page from the storage directory

**Parameters**

**file**: `string`, Load a help page from the storage directory

**Returns**: `unresolved`



* * *



**Author:** Martin Vach



**Overview:** Angular factories that handle cache, Underscore and HTTP requests.


