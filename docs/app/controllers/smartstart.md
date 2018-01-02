**Overview:** Handles Z-Wave SmartStart process.



**Author:** Martin Vach




* * *

# Global





* * *

## SmartStartBaseController
The controller that .


## SmartStartDskController
The controller that include device with DSK.

### SmartStartDskController.checkSdkVersion() 

Check if SDK version matchTODO: Unncoment when finished


### SmartStartDskController.addDskProvisioningList() 

Add DSK

**Returns**: `undefined`


## SmartStartListController
The controller that displays DSK list.

### SmartStartListController.loadXml() 

Load DeviceClasses.xml from translations


### SmartStartListController.loadDeviceInfo() 

Load device info


### SmartStartListController.getDskCollectionDemo() 

Get DSK Collection - DEMO


### SmartStartListController.updateDsk() 

Update DSK

**Returns**: `undefined`

### SmartStartListController.removeDsk(input, message) 

Remov a DSK item

**Parameters**

**input**: `object`

**message**: `string`

**Returns**: `undefined`


## SmartStartQrController
The controller that include device by scanning QR code.

### SmartStartQrController.callbackQrCode() 

Callback


### SmartStartQrController.initQRCodeReader() 

Init QR-Code-Reader if supported


### SmartStartQrController.initCanvas() 

Init canvas to discover qrcode




* * *
