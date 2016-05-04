**Overview:** Controllers that handle the Local apps, Online Apps and Active apps.



**Author:** Martin Vach




* * *

# Global





* * *

## AppBaseController
Apps root controller

### AppBaseController.loadTokens() 

Load tokens


### AppBaseController.allSettled() 

Load all promises


### AppBaseController.updateModule() 

Update module


### AppBaseController.setModules() 

Set local modules


### AppBaseController.setOnlineModules() 

Set online modules


### AppBaseController.setInstances() 

Set instances



## AppLocalController
The controller that handles all local APPs actions.

### AppLocalController.setOrderBy() 

Set order by


### AppLocalController.setFilter() 

Set filter


### AppLocalController.deleteModule() 

Delete module


### AppLocalController.resetModule() 

Reset module



## AppOnlineController
The controller that handles all online APPs actions.

### AppOnlineController.setOrderBy() 

Set order by


### AppOnlineController.hideInstalled() 

Hide installed


### AppOnlineController.setFilter() 

Set filter


### AppOnlineController.installModule() 

Install module



## AppInstanceController
The controller that handles all instances actions.

### AppInstanceController.setOrderBy() 

Set order by


### AppInstanceController.activateInstance() 

Activate instance


### AppInstanceController.deleteInstance() 

Delete instance



## AppLocalDetailController
The controller that handles local app detail actions.

### AppLocalDetailController.loadCategories() 

Load categories


### AppLocalDetailController.loadModule() 

Load module detail



## AppOnlineDetailController
The controller that handles on-line app detail actions.

### AppOnlineDetailController.loadRemoteAccess() 

Load Remote access data


### AppOnlineDetailController.loadCategories() 

Load categories


### AppOnlineDetailController.loadLocalModules() 

Load local modules


### AppOnlineDetailController.loadModuleId() 

Load module detail


### AppOnlineDetailController.loadComments() 

Load comments


### AppOnlineDetailController.installModule() 

Install module


### AppOnlineDetailController.addComment() 

Add comment


### AppOnlineDetailController.rateModule() 

Rate module



## AppModuleAlpacaController
The controller that handles Alpaca forms inputs and outputs.

### AppModuleAlpacaController.loadCategories() 

Load categories


### AppModuleAlpacaController.postModule() 

Generates the form for creating a new app instance


### AppModuleAlpacaController.putModule() 

Generates the form for updating an app instance


### AppModuleAlpacaController.store() 

Create/Update an app instance


### AppModuleAlpacaController.activateInstance() 

Activates an instance of the module


### AppModuleAlpacaController.installModule() 

Install the module


### AppModuleAlpacaController.setDependencies() 

Set moduledependencies




* * *
