**Overview:** Handles Z-Wave device inclusion actions.



**Author:** Martin Vach




* * *

# Global





* * *

## ZwaveInclusionController
The controller that handles Z-Wave device inclusion process.

### ZwaveInclusionController.allSettled() 

Load all promises


### ZwaveInclusionController.refreshZwaveApiData() 

Refresh ZwaveApiData


### ZwaveInclusionController.startStopExclusion() 

Start/Stop Exclusion


### ZwaveInclusionController.startStopInclusion() 

Start/Stop Inclusion


### ZwaveInclusionController.startConfiguration() 

Start configuration


### ZwaveInclusionController.startManualConfiguration() 

Start manual configuration


### ZwaveInclusionController.cancelManualConfiguration() 

Cancel manual configuration


### ZwaveInclusionController.runZwaveCmd() 

Run zwave command


### ZwaveInclusionController.forceInterview() 

Force interview


### ZwaveInclusionController.setSecureInclusion(cmd) 

Set inclusion as Secure/Unsecure.state=true Set as secure.state=false Set as unsecure.

**Parameters**

**cmd**: `string`


### ZwaveInclusionController.dskBlock(publicKey, block) 

Get block of DSK

**Parameters**

**publicKey**: `array`

**block**: `num`

**Returns**: `string`

### ZwaveInclusionController.handleInclusionVerifyDSK(nodeId) 

Handle inclusionS2VerifyDSK

**Parameters**

**nodeId**: `int`


### ZwaveInclusionController.verifyS2cc() 

S2 test


### ZwaveInclusionController.checkS2cc(nodeId) 

Check S2 command class

**Parameters**

**nodeId**: `int`


### ZwaveInclusionController.handleInclusionS2PublicKey() 

Handle nclusionS2PublicKey


### ZwaveInclusionController.checkS2Interview() 

Check S2 CC interview


### ZwaveInclusionController.setDeviceId() 

Set device by ID


### ZwaveInclusionController.setSecureInclusion() 

Set secure inclusion


### ZwaveInclusionController.setZWaveAPIData() 

Set ZWave API Data


### ZwaveInclusionController.updateController() 

Update controller data


### ZwaveInclusionController.resetExclusion() 

Reset exclusion


### ZwaveInclusionController.resetInclusion() 

Reset inclusion


### ZwaveInclusionController.resetConfiguration() 

Reset automated configuration


### ZwaveInclusionController.checkInterview() 

Check interview


### ZwaveInclusionController.resetManualConfiguration() 

Reset manual configuration




* * *
