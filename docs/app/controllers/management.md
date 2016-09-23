**Overview:** Controllers that handle management actions.



**Author:** Martin Vach




* * *

# Global





* * *

## ManagementController
The management root controller

### ManagementController.allSettled() 

Load all promises


### ManagementController.setControllerInfo() 

Set controller info


### ManagementController.setLicenceScratchId(controllerInfo) 

Set licence ID

**Parameters**

**controllerInfo**: `object`

**Returns**: `undefined`

### ManagementController.handleLicense(controllerInfo) 

Show or hide licencese block

**Parameters**

**controllerInfo**: `object`

**Returns**: `undefined`


## ManagementUserController
The controller that renders the list of users.

### ManagementUserController.loadProfiles() 

Load profiles


### ManagementUserController.setOrderBy() 

Set order by


### ManagementUserController.deleteProfile() 

Delete an user



## ManagementUserIdController
The controller that handles user detail actions.

### ManagementUserIdController.allSettledUserId() 

Load all promises


### ManagementUserIdController.assignRoom() 

Assign room to list


### ManagementUserIdController.removeRoom() 

Remove room from the list


### ManagementUserIdController.store() 

Create/Update an item


### ManagementUserIdController.changeAuth() 

Change auth data



## ManagementRemoteController
The controller that renders and handles remote access data.


## ManagementCloudBackupController
The controller that handles a backup to the cloud.

### ManagementCloudBackupController.allCloudSettled() 

Load all promises


### ManagementCloudBackupController.setSchedulerType() 

Set scheduler type


### ManagementCloudBackupController.updateInstance() 

Update instance



## ManagementLicenceController
The controller that handles the licence key.

### ManagementLicenceController.getLicense() 

Get license key


### ManagementLicenceController.updateCapabilities() 

Update capabilities



## ManagementFirmwareController
The controller that handles firmware update process.

### ManagementFirmwareController.setAccess() 

Set access


### ManagementFirmwareController.loadRazLatest() 

Load latest version



## ManagementTimezoneController
The controller that handles a backup to the cloud.

### ManagementTimezoneController.loadModule() 

Load module detail


### ManagementTimezoneController.updateInstance() 

Update instance


### ManagementTimezoneController.systemReboot() 

System rebboot



## ManagementRestoreController
The controller that handles restore process.

### ManagementRestoreController.uploadFile() 

Upload backup file



## ManagementFactoryController
The controller that resets the system to factory default.

### ManagementFactoryController.resetFactoryDefault() 

Reset to factory default



## ManagementAppStoreController
The controller that renders and handles app store data.

### ManagementAppStoreController.appStoreLoadTokens() 

Load tokens


### ManagementAppStoreController.appStoreAddToken() 

Create/Update a token


### ManagementAppStoreController.appStoreRemoveToken() 

Remove token from the list



## ManagementReportController
The controller that handles bug report info.

### ManagementReportController.sendReport() 

Send and save report



## ManagementInfoController
The controller that renders info data.



* * *
