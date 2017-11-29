**Overview:** Handles Z-Wave SmartStart process.



**Author:** Martin Vach




* * *

# Global





* * *

## SmartStartDskController
The controller that include device with DSK.

### SmartStartDskController.checkSdkVersion() 

Check if SDK version matchTODO: Unncoment when finished


### SmartStartDskController.addDskProvisioningList() 

Add DSK

**Returns**: `undefined`


## SmartStartQrController
The controller that include device by scanning QR code.

### SmartStartQrController.resetState() 

Reset state to start


### SmartStartQrController.scan() 

Scan QR code


### SmartStartQrController.discover() 

Discover the device



## SmartStartListController
The controller that displays DSK list.

### SmartStartListController.getDskProvisioningList() 

Get DSK Provisioning List


### SmartStartListController.removeDsk(dsk) 

Remov a DSK item

**Parameters**

**dsk**: `string`

**Returns**: `undefined`



* * *
