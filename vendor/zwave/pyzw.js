// device filter for device select menu
function devices_htmlSelect_filter(ZWaveAPIData,span,dev,type) {
	// return true means to skip this node
	switch(type) {
		case 'srcnode':
			// allow everything, since events can come from any device via timed_event
			return false;

			// skip virtual, controller or broadcast as event source
			//return ( (ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value || dev == 255));

		case 'dstnode':
			// skip not virtual, not controller and not broadcast as event destination
			return (!(ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value || dev == 255));

		case 'device':
			return ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value;

		case 'node':
			// skip non-FLiRS sleeping in list of associations/wakeup node notifications/... in CC params of type node
			return (!ZWaveAPIData.devices[dev].data.isListening.value && !ZWaveAPIData.devices[dev].data.sensor250.value && !ZWaveAPIData.devices[dev].data.sensor1000.value);

		default:
			return false;
	}
};

// returns array with default values: first value from the enum, minimum value for range, empty string for string, first nodeId for node, default schedule for the climate_schedule
function method_defaultValues(ZWaveAPIData,method) {
     
	function method_defaultValue(val) {
		if ('enumof' in val['type']) {
			if (val['type']['enumof'][0])
				return method_defaultValue(val['type']['enumof'][0]); // take first item of enumof
			else
				return null;
		}
		if ('range' in val['type'])
			return val['type']['range']['min'];
		if ('fix' in val['type'])
			return val['type']['fix']['value'];
		if ('string' in val['type'])
			return "";
		if ('node' in val['type'])
			for (var dev in ZWaveAPIData.devices) {
				if (devices_htmlSelect_filter(ZWaveAPIData,null,dev,'node')) {
					continue;
				};
				return parseInt(dev);
			};
		alert('method_defaultValue: unknown type of value');
	};

	var parameters = [];
//	method.forEach(function(val,parameter_index){
//		parameters[parameter_index] = method_defaultValue(val);
//	});
        angular.forEach(method,function(val,parameter_index){
		parameters[parameter_index] = method_defaultValue(val);
	});
       
	return parameters;
};

// represent array with number, string and array elements in reversible way: use eval('[' + return_value + ']') to rever back to an array
function repr_array(arr) {
	var repr='';
	for (var indx in arr) {
		if (repr != '')
			repr += ',';
		switch (typeof(arr[indx])) {
			case 'number':
				repr += arr[indx].toString();
				break;
			case 'string':
				repr += "'" + arr[indx].replace(/'/g, "\'") + "'"; // " // just for joe to hilight syntax properly
				break;
			case 'object':
				repr += '[' + repr_array(arr[indx]) + ']';
				break;
			default:
				if (arr[indx] === null)
					repr += 'null'; // for null object
				else
					error_msg('Unknown type of parameter: ' + typeof(arr[indx]));
		}
	};

	return repr;
};

/*
	Array unique
*/
function array_unique(arr) {
	var newArray = new Array();

	label:for (var i=0; i<arr.length;i++ ) {  
		for (var j=0; j<newArray.length;j++ )
			if (newArray[j] == arr[i]) 
				continue label;
		newArray[newArray.length] = arr[i];
	}
	return newArray;
};