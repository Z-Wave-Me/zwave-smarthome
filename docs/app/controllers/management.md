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

### ManagementRemoteController.loadRemoteAccess() 

Load Remote access data


### ManagementRemoteController.putRemoteAccess() 

PUT Remote access



## ManagementLocalController
The controller that renders and handles local access.

### ManagementLocalController.updateInstance() 

Update instance


### ManagementLocalController.systemReboot() 

System rebboot



## ManagementLicenceController
The controller that handles the licence key.

### ManagementLicenceController.updateCapabilities() 

Update capabilities



## ManagementFirmwareController
The controller that handles firmware update process.

### ManagementFirmwareController.setAccess() 

Set access


### ManagementFirmwareController.loadRazLatest() 

Load latest version


### ManagementFirmwareController.updateDeviceDatabase() 

update device database



## ManagementTimezoneController
The controller that handles a timezone.

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

### ManagementReportController.loadRemoteAccess() 

Load Remote access data


### ManagementReportController.sendReport() 

Send and save report



## ManagementPostfixController
The controller that renders postfix data.

### ManagementPostfixController.loadPostfix() 

Load postfix data



## ManagementInfoController
The controller that renders info data.


## ManagementCloudBackupController
The controller that handles a backup to the cloud.

### ManagementCloudBackupController.allCloudSettled() 

Load all promises


### ManagementCloudBackupController.setSchedulerType() 

Set scheduler type


### ManagementCloudBackupController.downLoadBackup() 

Start backup and get backup.file


### ManagementCloudBackupController.manualCloudBackup() 

Start cloud backup


### ManagementCloudBackupController.activateCloudBackup() 

Activate cloud backup


### ManagementCloudBackupController.updateInstance() 

Update instance


### ManagementCloudBackupController.createInstance() 

Create instance




* * *
