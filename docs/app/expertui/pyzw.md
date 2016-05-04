**Overview:** Functions used to render the configuration arrays.



**Author:** Unknown




* * *

# Global





* * *

### devices_htmlSelect_filter(ZWaveAPIData, span, dev, type) 

Device filter for device select menu

**Parameters**

**ZWaveAPIData**: `object`

**span**: `string`

**dev**: `string`

**type**: `string`

**Returns**: `Boolean`


### method_defaultValues(ZWaveAPIData, method) 

Returns array with default values: first value from the enum, minimum value for range, empty string for string, first nodeId for node, default schedule for the climate_schedule

**Parameters**

**ZWaveAPIData**: `object`

**method**: `object`

**Returns**: `Array`


### repr_array(arr) 

Represent array with number, string and array elements in reversible way: use eval('[' + return_value + ']') to rever back to an array

**Parameters**

**arr**: `array`

**Returns**: `String`


### array_unique(arr) 

Array unique

**Parameters**

**arr**: `array`

**Returns**: `Array`



* * *
