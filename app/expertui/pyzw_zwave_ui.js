var _methods_specs_rendered = null;
function getMethodSpec(ZWaveAPIData,devId, instId, ccId, method) {
	if (_methods_specs_rendered === null)
        renderAllMethodSpec(ZWaveAPIData);
	
	try {
		if (!(devId in _methods_specs_rendered))
			_methods_specs_rendered[devId] = {};
		if (!(instId in _methods_specs_rendered[devId]))
			_methods_specs_rendered[devId][instId] = {};
		if (!(ccId in _methods_specs_rendered[devId][instId]))
			 _methods_specs_rendered[devId][instId][ccId] = renderMethodSpec(parseInt(ccId, 10), ZWaveAPIData.devices[devId].instances[instId].commandClasses[ccId].data);

		var methods = _methods_specs_rendered[devId][instId][ccId];
		if (method)
			return methods[method];
		else
			return methods;
	} catch(err) {
		return null;
	}
}

function renderAllMethodSpec(ZWaveAPIData) {
	_methods_specs_rendered = {};
	
	for (var devId in ZWaveAPIData.devices) {
		_methods_specs_rendered[devId] = {};
		for (var instId in ZWaveAPIData.devices[devId].instances) {
			_methods_specs_rendered[devId][instId] = {};
			for (var ccId in ZWaveAPIData.devices[devId].instances[instId].commandClasses) {
				_methods_specs_rendered[devId][instId][ccId] = renderMethodSpec(parseInt(ccId, 10), ZWaveAPIData.devices[devId].instances[instId].commandClasses[ccId].data);
			}
		}
	}
}

function renderMethodSpec(ccId, data) {
	switch (ccId) {

		// PowerLevel
		case 0x73:
			return {
				"Get": [],
				"TestNodeGet": [],



				"TestNodeSet": [
					{
						"label": "Node ID",
						"type": {
							"range": {
								"min": 0,
								"max": 232
							}
						}
					},

					{			
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}				
					},
					{				
						"label": "Number of pakets",
						"type": {
							"range": {
								"min": 0,
								"max": 1000
							}
						}					
					
					}
				],


				
				"Set":[
					{
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}
					},
					{
						"label": "Timeout (s)",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};


	
		//SwitchColor
		case 0x33:
			return {
				"Get": [
				       {
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				],
				"Set": [
				       {
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 	0,
								"max": 	255
							}
						}
					}
				],
				"StartStateChange": [
					{
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},													
				],
				"StopStateChange": [
					{
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}								
				]
			};
 

		// Schedule (incomplete)
		case 0x53:
			return {
				"Get": [
					{
						"label": "Id",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};
		
		// AssociationGroupInformation
		case 0x59:
			return {
 
				"GetName": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"GetInfo": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"GetCommands": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};

		// ZWavePlusInfo
		case 0x5e:
			return {
				"Get": []
			};
		
		case 0x85:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};
	
		// Version
		case 0x86:
			return {
				/*
				Version is not publically exported in Z-Way.C

				"CommandClassVersionGet": [
					{
						"label":"CommandClass",
						"type":	{
							"range":	{
								"min":	0x0001,
								"max":	0xFFFF
							}
						}
					}
				]
				*/
			};

		// UserCode
		case 0x63:
			return {
				"Get": [
					{
						"label": "User",
						"type":	{
							"range": {
								"min": 	0,
								"max": 	99
							}
						}
					}
				],
				"Set": [
					{
						"label": "User",
						"type": {
							"enumof": [
								{
									"label": "All usercodes",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Id",
									"type": {
										"range": {
											"min": 	1,
											"max": 	99
										}
									}
								}
							]
						}
					},
					{
						"label": "Code (4...10 Digits)",
						"type": {
							"string": {
							}
						}
					},
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Not Set",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Set",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Reserved",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								}
							]
						}
					}
				]
			};
			
		// Time Parameters
		case 0x8B:
			return {
				"Get": [],
				"Set": []
			};
			
		// Thermostat SetPoint
		case 0x43:
			return {
				"Get": [
				       {
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				],
				"Set": [
				       {
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 	0,
								"max": 	100
							}
						}
					}
				]
			};

		// Wakeup	
		case 0x84:
			return {
				"Get": [],
				"CapabilitiesGet": [],
				"Set": [
				       {
						"label": "Wakeup time, seconds",
						"type": {
							"range": {
								"min": 	(
									function() {
										try {
											if (data.version.value >= 2 && data.min.value !== null)
												return data.min.value;
										} catch(err) {}
										return 0;
									}
									)(),
								"max": 	(
									function() {
										try {
											if (data.version.value >= 2 && data.max.value !== null)
												return data.max.value;
										} catch(err) {}
										return 256 * 256 * 256 - 1;
									}
									)()
							}
						}
					},
					{
						"label": "to Node",
						"type": {
							"node": {}
						}
					}
				],
				"Sleep": []
			};

		// Time
		case 0x8A:
			return {
				"TimeGet": [],
				"DateGet": []
			};

		// ThermostatMode
		case 0x40:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};

		// ThermostatFanMode
		case 0x44:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};

		// ThermostatFanState
		case 0x45: 
			return {
				"Get": []
			};

		// ThermostatOperatingState
		case 0x42:
			return {
				"Get": [],
				"LoggingGet" : [
					{
						"label": "States (bitmask)",
						"type": {
							"range": {
								"min": 1,
								"max": 99
							}
						}
					}
				]
			};

		// SwitchMultilevel
		case 0x26:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Dimmer level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChange": [
				       {
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
				],
				"StopLevelChange": [],
				"SetWithDuration": [
					{
						"label": "Dimmer level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
									"fix": 	{
										"value": 0
										}
									}
								},
									{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
									{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
											"shift": 127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChangeWithDurationV2": [
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"SetMotorA": [
					{
						"label": "Status",
						"type": {
							"enumof": [
								{
									"label": "Close",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Open",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChangeMotorA": [
					{
						"label": "Start Move",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],
				"StopLevelChangeMotorA": [],
				"SetMotorB": [
					{
						"label": "Blind Position",
						"type": {
							"enumof": [
								{
									"label": "Close",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Open",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								]
						}
					}
				],
				"StartLevelChangeMotorB": [
					{
						"label": "Start Move",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],
				"StopLevelChange": []
			};

		// SwtichBinary
		case 0x25:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// SimpleAV
		case 0x94:
			return {
				"SetEmpty": [
					{
						"label": "Key attribute",
						"type": {
							"enumof": [
								{
									"label": "Key Down",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Key Up",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Key Alive",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								]
						}
					},
					{
						"label": "Media item",
						"type": {
							"enumof": [
								{
									"label": "No",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "ID",
									"type": {
										"range": {
											"min": 0,
											"max": 0
										}
									}
								},
								]
						}
					},
					{
						"label": "Button",
						"type": {
							"enumof": []
						}
					},
				],
				"SetFull": [
					{
						"label": "Mute",
						"type": {
							"fix": 	{
								"value": 0x0001
							}
						}
					},
					{
						"label": "Volume down",
						"type": {
							"fix": 	{
								"value": 0x0002
							}
						}
					},
					{
						"label": "Volume up",
						"type": {
							"fix": 	{
								"value": 0x0003
									}
								}
							},
							{
						"label": "Channel up",
						"type": {
							"fix": 	{
								"value": 0x0004
							}
						}
					},
					{
						"label": "Channel down",
						"type": {
							"fix": 	{
								"value": 0x0005
							}
						}
					},
					{
						"label": "0",
						"type": {
							"fix": 	{
								"value": 0x0006
							}
						}
					},
					{
						"label": "1",
						"type": {
							"fix": 	{
								"value": 0x0007
							}
						}
					},
					{
						"label": "2",
						"type": {
							"fix": 	{
								"value": 0x0008
							}
						}
					},
					{
						"label": "3",
						"type": {
							"fix": 	{
								"value": 0x0009
							}
						}
					},
					{
						"label": "4",
						"type": {
							"fix": 	{
								"value": 0x000A
							}
						}
					},
					{
						"label": "5",
						"type": {
							"fix": 	{
								"value": 0x000B
							}
						}
					},
					{
						"label": "6",
						"type": {
							"fix": 	{
								"value": 0x000C
							}
						}
					},
					{
						"label": "7",
						"type": {
							"fix": 	{
								"value": 0x000D
							}
						}
					},
					{
						"label": "8",
						"type": {
							"fix": 	{
								"value": 0x000E
							}
						}
					},
					{
						"label": "9",
						"type": {
							"fix": 	{
								"value": 0x000F
							}
						}
					},
					{
						"label": "Last channel",
						"type": {
							"fix": 	{
								"value": 0x0010
							}
						}
					},
					{
						"label": "Display",
						"type": {
							"fix": 	{
								"value": 0x0011
							}
						}
					},
					{
						"label": "Favorite channel",
						"type": {
							"fix": 	{
								"value": 0x0012
							}
						}
					},
					{
						"label": "Play",
						"type": {
							"fix": 	{
								"value": 0x0013
							}
						}
					},
					{
						"label": "Stop",
						"type": {
							"fix": 	{
								"value": 0x0014
							}
						}
					},
					{
						"label": "Pause",
						"type": {
							"fix": 	{
								"value": 0x0015
							}
						}
					},
					{
						"label": "Fast forward",
						"type": {
							"fix": 	{
								"value": 0x0016
							}
						}
					},
					{
						"label": "Rewind",
						"type": {
							"fix": 	{
								"value": 0x0017
							}
						}
					},
					{
						"label": "Instant replay",
						"type": {
							"fix": 	{
								"value": 0x0018
							}
						}
					},
					{
						"label": "Record",
						"type": {
							"fix": 	{
								"value": 0x0019
							}
						}
					},
					{
						"label": "AC3",
						"type": {
							"fix": 	{
								"value": 0x001A
							}
						}
					},
					{
						"label": "PVR menu",
						"type": {
							"fix": 	{
								"value": 0x001B
							}
						}
					},
					{
						"label": "Guide",
						"type": {
							"fix": 	{
								"value": 0x001C
							}
						}
					},
					{
						"label": "Menu",
						"type": {
							"fix": 	{
								"value": 0x001D
							}
						}
					},
					{
						"label": "Menu up",
						"type": {
							"fix": 	{
								"value": 0x001E
							}
						}
					},
					{
						"label": "Menu down",
						"type": {
							"fix": 	{
								"value": 0x001F
							}
						}
					},
					{
						"label": "Menu left",
						"type": {
							"fix": 	{
								"value": 0x0020
							}
						}
					},
					{
						"label": "Menu right",
						"type": {
							"fix": 	{
								"value": 0x0021
							}
						}
					},
					{
						"label": "Page up",
						"type": {
							"fix": 	{
								"value": 0x0022
							}
						}
					},
					{
						"label": "Page down",
						"type": {
							"fix": 	{
								"value": 0x0023
							}
						}
					},
					{
						"label": "Select",
						"type": {
							"fix": 	{
								"value": 0x0024
							}
						}
					},
					{
						"label": "Exit",
						"type": {
							"fix": 	{
								"value": 0x0025
							}
						}
					},
					{
						"label": "Input",
						"type": {
							"fix": 	{
								"value": 0x0026
							}
						}
					},
					{
						"label": "Power",
						"type": {
							"fix": 	{
								"value": 0x0027
							}
						}
					},
					{
						"label": "Enter channel",
						"type": {
							"fix": 	{
								"value": 0x0028
							}
						}
					},
					{
						"label": "10",
						"type": {
							"fix": 	{
								"value": 0x0029
							}
						}
					},
					{
						"label": "11",
						"type": {
							"fix": 	{
								"value": 0x002A
							}
						}
					},
					{
						"label": "12",
						"type": {
							"fix": 	{
								"value": 0x002B
							}
						}
					},
					{
						"label": "13",
						"type": {
							"fix": 	{
								"value": 0x002C
							}
						}
					},
					{
						"label": "14",
						"type": {
							"fix": 	{
								"value": 0x002D
							}
						}
					},
					{
						"label": "15",
						"type": {
							"fix": 	{
								"value": 0x002E
							}
						}
					},
					{
						"label": "16",
						"type": {
							"fix": 	{
								"value": 0x002F
							}
						}
					},
					{
						"label": "+10",
						"type": {
							"fix": 	{
								"value": 0x0030
							}
						}
					},
					{
						"label": "+20",
						"type": {
							"fix": 	{
								"value": 0x0031
							}
						}
					},
					{
						"label": "+100",
						"type": {
							"fix": 	{
								"value": 0x0032
							}
						}
					},
					{
						"label": "-/--",
						"type": {
							"fix": 	{
								"value": 0x0033
							}
						}
					},
					{
						"label": "3-CH",
						"type": {
							"fix": 	{
								"value": 0x0034
							}
						}
					},
					{
						"label": "3D",
						"type": {
							"fix": 	{
								"value": 0x0035
							}
						}
					},
					{
						"label": "6-CH input",
						"type": {
							"fix": 	{
								"value": 0x0036
							}
						}
					},
					{
						"label": "A",
						"type": {
							"fix": 	{
								"value": 0x0037
							}
						}
					},
					{
						"label": "Add",
						"type": {
							"fix": 	{
								"value": 0x0038
							}
						}
					},
					{
						"label": "Alarm",
						"type": {
							"fix": 	{
								"value": 0x0039
							}
						}
					},
					{
						"label": "AM",
						"type": {
							"fix": 	{
								"value": 0x003A
							}
						}
					},
					{
						"label": "Analog",
						"type": {
							"fix": 	{
								"value": 0x003B
							}
						}
					},
					{
						"label": "Angle",
						"type": {
							"fix": 	{
								"value": 0x003C
							}
						}
					},
					{
						"label": "Antenna",
						"type": {
							"fix": 	{
								"value": 0x003D
							}
						}
					},
					{
						"label": "Antenna east",
						"type": {
							"fix": 	{
								"value": 0x003E
							}
						}
					},
					{
						"label": "Antenna west",
						"type": {
							"fix": 	{
								"value": 0x003F
							}
						}
					},
					{
						"label": "Aspect",
						"type": {
							"fix": 	{
								"value": 0x0040
							}
						}
					},
					{
						"label": "Audio 1",
						"type": {
							"fix": 	{
								"value": 0x0041
							}
						}
					},
					{
						"label": "Audio 2",
						"type": {
							"fix": 	{
								"value": 0x0042
							}
						}
					},
					{
						"label": "Audio 3",
						"type": {
							"fix": 	{
								"value": 0x0043
							}
						}
					},
					{
						"label": "Audio dubbing",
						"type": {
							"fix": 	{
								"value": 0x0044
							}
						}
					},
					{
						"label": "Audio level down",
						"type": {
							"fix": 	{
								"value": 0x0045
							}
						}
					},
					{
						"label": "Audio level up",
						"type": {
							"fix": 	{
								"value": 0x0046
							}
						}
					},
					{
						"label": "Auto/Manual",
						"type": {
							"fix": 	{
								"value": 0x0047
							}
						}
					},
					{
						"label": "Aux 1",
						"type": {
							"fix": 	{
								"value": 0x0048
							}
						}
					},
					{
						"label": "Aux 2",
						"type": {
							"fix": 	{
								"value": 0x0049
							}
						}
					},
					{
						"label": "B",
						"type": {
							"fix": 	{
								"value": 0x004A
							}
						}
					},
					{
						"label": "Back",
						"type": {
							"fix": 	{
								"value": 0x004B
							}
						}
					},
					{
						"label": "Background",
						"type": {
							"fix": 	{
								"value": 0x004C
							}
						}
					},
					{
						"label": "Balance",
						"type": {
							"fix": 	{
								"value": 0x004D
							}
						}
					},
					{
						"label": "Balance left",
						"type": {
							"fix": 	{
								"value": 0x004E
							}
						}
					},
					{
						"label": "Balance right",
						"type": {
							"fix": 	{
								"value": 0x004F
							}
						}
					},
					{
						"label": "Band",
						"type": {
							"fix": 	{
								"value": 0x0050
							}
						}
					},
					{
						"label": "Bandwidth",
						"type": {
							"fix": 	{
								"value": 0x0051
							}
						}
					},
					{
						"label": "Bass",
						"type": {
							"fix": 	{
								"value": 0x0052
							}
						}
					},
					{
						"label": "Bass down",
						"type": {
							"fix": 	{
								"value": 0x0053
							}
						}
					},
					{
						"label": "Bass up",
						"type": {
							"fix": 	{
								"value": 0x0054
							}
						}
					},
					{
						"label": "Blank",
						"type": {
							"fix": 	{
								"value": 0x0055
							}
						}
					},
					{
						"label": "Breeze mode",
						"type": {
							"fix": 	{
								"value": 0x0056
							}
						}
					},
					{
						"label": "Bright",
						"type": {
							"fix": 	{
								"value": 0x0057
							}
						}
					},
					{
						"label": "Brightness",
						"type": {
							"fix": 	{
								"value": 0x0058
							}
						}
					},
					{
						"label": "Brightness down",
						"type": {
							"fix": 	{
								"value": 0x0059
							}
						}
					},
					{
						"label": "Brightness up",
						"type": {
							"fix": 	{
								"value": 0x005A
							}
						}
					},
					{
						"label": "Buy",
						"type": {
							"fix": 	{
								"value": 0x005B
							}
						}
					},
					{
						"label": "C",
						"type": {
							"fix": 	{
								"value": 0x005C
							}
						}
					},
					{
						"label": "Camera",
						"type": {
							"fix": 	{
								"value": 0x005D
							}
						}
					},
					{
						"label": "Category down",
						"type": {
							"fix": 	{
								"value": 0x005E
							}
						}
					},
					{
						"label": "Category up",
						"type": {
							"fix": 	{
								"value": 0x005F
							}
						}
					},
					{
						"label": "Center",
						"type": {
							"fix": 	{
								"value": 0x0060
							}
						}
					},
					{
						"label": "Center down",
						"type": {
							"fix": 	{
								"value": 0x0061
							}
						}
					},
					{
						"label": "Center mode",
						"type": {
							"fix": 	{
								"value": 0x0062
							}
						}
					},
					{
						"label": "Center up",
						"type": {
							"fix": 	{
								"value": 0x0063
							}
						}
					},
					{
						"label": "Channel/Program",
						"type": {
							"fix": 	{
								"value": 0x0064
							}
						}
					},
					{
						"label": "Clear",
						"type": {
							"fix": 	{
								"value": 0x0065
							}
						}
					},
					{
						"label": "Close",
						"type": {
							"fix": 	{
								"value": 0x0066
							}
						}
					},
					{
						"label": "Closed caption",
						"type": {
							"fix": 	{
								"value": 0x0067
							}
						}
					},
					{
						"label": "Cold",
						"type": {
							"fix": 	{
								"value": 0x0068
							}
						}
					},
					{
						"label": "Color",
						"type": {
							"fix": 	{
								"value": 0x0069
							}
						}
					},
					{
						"label": "Color down",
						"type": {
							"fix": 	{
								"value": 0x006A
							}
						}
					},
					{
						"label": "Color up",
						"type": {
							"fix": 	{
								"value": 0x006B
							}
						}
					},
					{
						"label": "Component 1",
						"type": {
							"fix": 	{
								"value": 0x006C
							}
						}
					},
					{
						"label": "Component 2",
						"type": {
							"fix": 	{
								"value": 0x006D
							}
						}
					},
					{
						"label": "Component 3",
						"type": {
							"fix": 	{
								"value": 0x006E
							}
						}
					},
					{
						"label": "Concert",
						"type": {
							"fix": 	{
								"value": 0x006F
							}
						}
					},
					{
						"label": "Confirm",
						"type": {
							"fix": 	{
								"value": 0x0070
							}
						}
					},
					{
						"label": "Continue",
						"type": {
							"fix": 	{
								"value": 0x0071
							}
						}
					},
					{
						"label": "Contrast",
						"type": {
							"fix": 	{
								"value": 0x0072
							}
						}
					},
					{
						"label": "Contrast down",
						"type": {
							"fix": 	{
								"value": 0x0073
							}
						}
					},
					{
						"label": "Contrast up",
						"type": {
							"fix": 	{
								"value": 0x0074
							}
						}
					},
					{
						"label": "Counter",
						"type": {
							"fix": 	{
								"value": 0x0075
							}
						}
					},
					{
						"label": "Counter reset",
						"type": {
							"fix": 	{
								"value": 0x0076
							}
						}
					},
					{
						"label": "D",
						"type": {
							"fix": 	{
								"value": 0x0077
							}
						}
					},
					{
						"label": "Day down",
						"type": {
							"fix": 	{
								"value": 0x0078
							}
						}
					},
					{
						"label": "Day up",
						"type": {
							"fix": 	{
								"value": 0x0079
							}
						}
					},
					{
						"label": "Delay",
						"type": {
							"fix": 	{
								"value": 0x007A
							}
						}
					},
					{
						"label": "Delay down",
						"type": {
							"fix": 	{
								"value": 0x007B
							}
						}
					},
					{
						"label": "Delay up",
						"type": {
							"fix": 	{
								"value": 0x007C
							}
						}
					},
					{
						"label": "Delete",
						"type": {
							"fix": 	{
								"value": 0x007D
							}
						}
					},
					{
						"label": "Delimiter",
						"type": {
							"fix": 	{
								"value": 0x007E
							}
						}
					},
					{
						"label": "Digest",
						"type": {
							"fix": 	{
								"value": 0x007F
							}
						}
					},
					{
						"label": "Digital",
						"type": {
							"fix": 	{
								"value": 0x0080
							}
						}
					},
					{
						"label": "Dim",
						"type": {
							"fix": 	{
								"value": 0x0081
							}
						}
					},
					{
						"label": "Direct",
						"type": {
							"fix": 	{
								"value": 0x0082
							}
						}
					},
					{
						"label": "Disarm",
						"type": {
							"fix": 	{
								"value": 0x0083
							}
						}
					},
					{
						"label": "Disc",
						"type": {
							"fix": 	{
								"value": 0x0084
							}
						}
					},
					{
						"label": "Disc 1",
						"type": {
							"fix": 	{
								"value": 0x0085
							}
						}
					},
					{
						"label": "Disc 2",
						"type": {
							"fix": 	{
								"value": 0x0086
							}
						}
					},
					{
						"label": "Disc 3",
						"type": {
							"fix": 	{
								"value": 0x0087
							}
						}
					},
					{
						"label": "Disc 4",
						"type": {
							"fix": 	{
								"value": 0x0088
							}
						}
					},
					{
						"label": "Disc 5",
						"type": {
							"fix": 	{
								"value": 0x0089
							}
						}
					},
					{
						"label": "Disc 6",
						"type": {
							"fix": 	{
								"value": 0x008A
							}
						}
					},
					{
						"label": "Disc down",
						"type": {
							"fix": 	{
								"value": 0x008B
							}
						}
					},
					{
						"label": "Disc up",
						"type": {
							"fix": 	{
								"value": 0x008C
							}
						}
					},
					{
						"label": "Disco",
						"type": {
							"fix": 	{
								"value": 0x008D
							}
						}
					},
					{
						"label": "Edit",
						"type": {
							"fix": 	{
								"value": 0x008E
							}
						}
					},
					{
						"label": "Effect down",
						"type": {
							"fix": 	{
								"value": 0x008F
							}
						}
					},
					{
						"label": "Effect up",
						"type": {
							"fix": 	{
								"value": 0x0090
							}
						}
					},
					{
						"label": "Eject",
						"type": {
							"fix": 	{
								"value": 0x0091
							}
						}
					},
					{
						"label": "End",
						"type": {
							"fix": 	{
								"value": 0x0092
							}
						}
					},
					{
						"label": "EQ",
						"type": {
							"fix": 	{
								"value": 0x0093
							}
						}
					},
					{
						"label": "Fader",
						"type": {
							"fix": 	{
								"value": 0x0094
							}
						}
					},
					{
						"label": "Fan",
						"type": {
							"fix": 	{
								"value": 0x0095
							}
						}
					},
					{
						"label": "Fan high",
						"type": {
							"fix": 	{
								"value": 0x0096
							}
						}
					},
					{
						"label": "Fan low",
						"type": {
							"fix": 	{
								"value": 0x0097
							}
						}
					},
					{
						"label": "Fan medium",
						"type": {
							"fix": 	{
								"value": 0x0098
							}
						}
					},
					{
						"label": "Fan speed",
						"type": {
							"fix": 	{
								"value": 0x0099
							}
						}
					},
					{
						"label": "Fastext blue",
						"type": {
							"fix": 	{
								"value": 0x009A
							}
						}
					},
					{
						"label": "Fastext green",
						"type": {
							"fix": 	{
								"value": 0x009B
							}
						}
					},
					{
						"label": "Fastext purple",
						"type": {
							"fix": 	{
								"value": 0x009C
							}
						}
					},
					{
						"label": "Fastext red",
						"type": {
							"fix": 	{
								"value": 0x009D
							}
						}
					},
					{
						"label": "Fastext white",
						"type": {
							"fix": 	{
								"value": 0x009E
							}
						}
					},
					{
						"label": "Fastext yellow",
						"type": {
							"fix": 	{
								"value": 0x009F
							}
						}
					},
					{
						"label": "Favorite channel down",
						"type": {
							"fix": 	{
								"value": 0x00A0
							}
						}
					},
					{
						"label": "Favorite channel up",
						"type": {
							"fix": 	{
								"value": 0x00A1
							}
						}
					},
					{
						"label": "Finalize",
						"type": {
							"fix": 	{
								"value": 0x00A2
							}
						}
					},
					{
						"label": "Fine tune",
						"type": {
							"fix": 	{
								"value": 0x00A3
							}
						}
					},
					{
						"label": "Flat",
						"type": {
							"fix": 	{
								"value": 0x00A4
							}
						}
					},
					{
						"label": "FM",
						"type": {
							"fix": 	{
								"value": 0x00A5
							}
						}
					},
					{
						"label": "Focus down",
						"type": {
							"fix": 	{
								"value": 0x00A6
							}
						}
					},
					{
						"label": "Focus up",
						"type": {
							"fix": 	{
								"value": 0x00A7
							}
						}
					},
					{
						"label": "Freeze",
						"type": {
							"fix": 	{
								"value": 0x00A8
							}
						}
					},
					{
						"label": "Front",
						"type": {
							"fix": 	{
								"value": 0x00A9
							}
						}
					},
					{
						"label": "Game",
						"type": {
							"fix": 	{
								"value": 0x00AA
							}
						}
					},
					{
						"label": "GoTo",
						"type": {
							"fix": 	{
								"value": 0x00AB
							}
						}
					},
					{
						"label": "Hall",
						"type": {
							"fix": 	{
								"value": 0x00AC
							}
						}
					},
					{
						"label": "Heat",
						"type": {
							"fix": 	{
								"value": 0x00AD
							}
						}
					},
					{
						"label": "Help",
						"type": {
							"fix": 	{
								"value": 0x00AE
							}
						}
					},
					{
						"label": "Home",
						"type": {
							"fix": 	{
								"value": 0x00AF
							}
						}
					},
					{
						"label": "Index",
						"type": {
							"fix": 	{
								"value": 0x00B0
							}
						}
					},
					{
						"label": "Index forward",
						"type": {
							"fix": 	{
								"value": 0x00B1
							}
						}
					},
					{
						"label": "Index reverse",
						"type": {
							"fix": 	{
								"value": 0x00B2
							}
						}
					},
					{
						"label": "Interactive",
						"type": {
							"fix": 	{
								"value": 0x00B3
							}
						}
					},
					{
						"label": "Intro scan",
						"type": {
							"fix": 	{
								"value": 0x00B4
							}
						}
					},
					{
						"label": "Jazz",
						"type": {
							"fix": 	{
								"value": 0x00B5
							}
						}
					},
					{
						"label": "Karaoke",
						"type": {
							"fix": 	{
								"value": 0x00B6
							}
						}
					},
					{
						"label": "Keystone",
						"type": {
							"fix": 	{
								"value": 0x00B7
							}
						}
					},
					{
						"label": "Keystone down",
						"type": {
							"fix": 	{
								"value": 0x00B8
							}
						}
					},
					{
						"label": "Keystone up",
						"type": {
							"fix": 	{
								"value": 0x00B9
							}
						}
					},
					{
						"label": "Language",
						"type": {
							"fix": 	{
								"value": 0x00BA
							}
						}
					},
					{
						"label": "Left click",
						"type": {
							"fix": 	{
								"value": 0x00BB
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"fix": 	{
								"value": 0x00BC
							}
						}
					},
					{
						"label": "Light",
						"type": {
							"fix": 	{
								"value": 0x00BD
							}
						}
					},
					{
						"label": "List",
						"type": {
							"fix": 	{
								"value": 0x00BE
							}
						}
					},
					{
						"label": "Live TV",
						"type": {
							"fix": 	{
								"value": 0x00BF
							}
						}
					},
					{
						"label": "Local/Dx",
						"type": {
							"fix": 	{
								"value": 0x00C0
							}
						}
					},
					{
						"label": "Loudness",
						"type": {
							"fix": 	{
								"value": 0x00C1
							}
						}
					},
					{
						"label": "Mail",
						"type": {
							"fix": 	{
								"value": 0x00C2
							}
						}
					},
					{
						"label": "Mark",
						"type": {
							"fix": 	{
								"value": 0x00C3
							}
						}
					},
					{
						"label": "Memory recall",
						"type": {
							"fix": 	{
								"value": 0x00C4
							}
						}
					},
					{
						"label": "Monitor",
						"type": {
							"fix": 	{
								"value": 0x00C5
							}
						}
					},
					{
						"label": "Movie",
						"type": {
							"fix": 	{
								"value": 0x00C6
							}
						}
					},
					{
						"label": "Multi room",
						"type": {
							"fix": 	{
								"value": 0x00C7
							}
						}
					},
					{
						"label": "Music",
						"type": {
							"fix": 	{
								"value": 0x00C8
							}
						}
					},
					{
						"label": "Music scan",
						"type": {
							"fix": 	{
								"value": 0x00C9
							}
						}
					},
					{
						"label": "Natural",
						"type": {
							"fix": 	{
								"value": 0x00CA
							}
						}
					},
					{
						"label": "Night",
						"type": {
							"fix": 	{
								"value": 0x00CB
							}
						}
					},
					{
						"label": "Noise reduction",
						"type": {
							"fix": 	{
								"value": 0x00CC
							}
						}
					},
					{
						"label": "Normalize",
						"type": {
							"fix": 	{
								"value": 0x00CD
							}
						}
					},
					{
						"label": "Discrete input CableTV",
						"type": {
							"fix": 	{
								"value": 0x00CE
							}
						}
					},
					{
						"label": "Discrete input CD 1",
						"type": {
							"fix": 	{
								"value": 0x00CF
							}
						}
					},
					{
						"label": "Discrete input CD 2",
						"type": {
							"fix": 	{
								"value": 0x00D0
							}
						}
					},
					{
						"label": "Discrete input CD Recorder",
						"type": {
							"fix": 	{
								"value": 0x00D1
							}
						}
					},
					{
						"label": "Discrete input DAT (Digital Audio Tape)",
						"type": {
							"fix": 	{
								"value": 0x00D2
							}
						}
					},
					{
						"label": "Discrete input DVD",
						"type": {
							"fix": 	{
								"value": 0x00D3
							}
						}
					},
					{
						"label": "Discrete input DVI",
						"type": {
							"fix": 	{
								"value": 0x00D4
							}
						}
					},
					{
						"label": "Discrete input HDTV",
						"type": {
							"fix": 	{
								"value": 0x00D5
							}
						}
					},
					{
						"label": "Discrete input LaserDisc",
						"type": {
							"fix": 	{
								"value": 0x00D6
							}
						}
					},
					{
						"label": "Discrete input MiniDisc",
						"type": {
							"fix": 	{
								"value": 0x00D7
							}
						}
					},
					{
						"label": "Discrete input PC",
						"type": {
							"fix": 	{
								"value": 0x00D8
							}
						}
					},
					{
						"label": "Discrete input Personal Video Recorder",
						"type": {
							"fix": 	{
								"value": 0x00D9
							}
						}
					},
					{
						"label": "Discrete input TV",
						"type": {
							"fix": 	{
								"value": 0x00DA
							}
						}
					},
					{
						"label": "Discrete input TV/VCR or TV/DVD",
						"type": {
							"fix": 	{
								"value": 0x00DB
							}
						}
					},
					{
						"label": "Discrete input VCR",
						"type": {
							"fix": 	{
								"value": 0x00DC
							}
						}
					},
					{
						"label": "One touch playback",
						"type": {
							"fix": 	{
								"value": 0x00DD
							}
						}
					},
					{
						"label": "One touch record",
						"type": {
							"fix": 	{
								"value": 0x00DE
							}
						}
					},
					{
						"label": "Open",
						"type": {
							"fix": 	{
								"value": 0x00DF
							}
						}
					},
					{
						"label": "Optical",
						"type": {
							"fix": 	{
								"value": 0x00E0
							}
						}
					},
					{
						"label": "Options",
						"type": {
							"fix": 	{
								"value": 0x00E1
							}
						}
					},
					{
						"label": "Orchestra",
						"type": {
							"fix": 	{
								"value": 0x00E2
							}
						}
					},
					{
						"label": "PAL/NTSC",
						"type": {
							"fix": 	{
								"value": 0x00E3
							}
						}
					},
					{
						"label": "Parental lock",
						"type": {
							"fix": 	{
								"value": 0x00E4
							}
						}
					},
					{
						"label": "PBC",
						"type": {
							"fix": 	{
								"value": 0x00E5
							}
						}
					},
					{
						"label": "Phono",
						"type": {
							"fix": 	{
								"value": 0x00E6
							}
						}
					},
					{
						"label": "Photos",
						"type": {
							"fix": 	{
								"value": 0x00E7
							}
						}
					},
					{
						"label": "Picture menu",
						"type": {
							"fix": 	{
								"value": 0x00E8
							}
						}
					},
					{
						"label": "Picture mode",
						"type": {
							"fix": 	{
								"value": 0x00E9
							}
						}
					},
					{
						"label": "Picture mute",
						"type": {
							"fix": 	{
								"value": 0x00EA
							}
						}
					},
					{
						"label": "PIP channel down",
						"type": {
							"fix": 	{
								"value": 0x00EB
							}
						}
					},
					{
						"label": "PIP channel up",
						"type": {
							"fix": 	{
								"value": 0x00EC
							}
						}
					},
					{
						"label": "PIP freeze",
						"type": {
							"fix": 	{
								"value": 0x00ED
							}
						}
					},
					{
						"label": "PIP input",
						"type": {
							"fix": 	{
								"value": 0x00EE
							}
						}
					},
					{
						"label": "PIP move",
						"type": {
							"fix": 	{
								"value": 0x00EF
							}
						}
					},
					{
						"label": "PIP Off",
						"type": {
							"fix": 	{
								"value": 0x00F0
							}
						}
					},
					{
						"label": "PIP On",
						"type": {
							"fix": 	{
								"value": 0x00F1
							}
						}
					},
					{
						"label": "PIP size",
						"type": {
							"fix": 	{
								"value": 0x00F2
							}
						}
					},
					{
						"label": "PIP split",
						"type": {
							"fix": 	{
								"value": 0x00F3
							}
						}
					},
					{
						"label": "PIP swap",
						"type": {
							"fix": 	{
								"value": 0x00F4
							}
						}
					},
					{
						"label": "Play mode",
						"type": {
							"fix": 	{
								"value": 0x00F5
							}
						}
					},
					{
						"label": "Play reverse",
						"type": {
							"fix": 	{
								"value": 0x00F6
							}
						}
					},
					{
						"label": "Power Off",
						"type": {
							"fix": 	{
								"value": 0x00F7
							}
						}
					},
					{
						"label": "Power On",
						"type": {
							"fix": 	{
								"value": 0x00F8
							}
						}
					},
					{
						"label": "PPV (Pay per view)",
						"type": {
							"fix": 	{
								"value": 0x00F9
							}
						}
					},
					{
						"label": "Preset",
						"type": {
							"fix": 	{
								"value": 0x00FA
							}
						}
					},
					{
						"label": "Program",
						"type": {
							"fix": 	{
								"value": 0x00FB
							}
						}
					},
					{
						"label": "Progressive scan",
						"type": {
							"fix": 	{
								"value": 0x00FC
							}
						}
					},
					{
						"label": "ProLogic",
						"type": {
							"fix": 	{
								"value": 0x00FD
							}
						}
					},
					{
						"label": "PTY",
						"type": {
							"fix": 	{
								"value": 0x00FE
							}
						}
					},
					{
						"label": "Quick skip",
						"type": {
							"fix": 	{
								"value": 0x00FF
							}
						}
					},
					{
						"label": "Random",
						"type": {
							"fix": 	{
								"value": 0x0100
							}
						}
					},
					{
						"label": "RDS",
						"type": {
							"fix": 	{
								"value": 0x0101
							}
						}
					},
					{
						"label": "Rear",
						"type": {
							"fix": 	{
								"value": 0x0102
							}
						}
					},
					{
						"label": "Rear volume down",
						"type": {
							"fix": 	{
								"value": 0x0103
							}
						}
					},
					{
						"label": "Rear volume up",
						"type": {
							"fix": 	{
								"value": 0x0104
							}
						}
					},
					{
						"label": "Record mute",
						"type": {
							"fix": 	{
								"value": 0x0105
							}
						}
					},
					{
						"label": "Record pause",
						"type": {
							"fix": 	{
								"value": 0x0106
							}
						}
					},
					{
						"label": "Repeat",
						"type": {
							"fix": 	{
								"value": 0x0107
							}
						}
					},
					{
						"label": "Repeat A-B",
						"type": {
							"fix": 	{
								"value": 0x0108
							}
						}
					},
					{
						"label": "Resume",
						"type": {
							"fix": 	{
								"value": 0x0109
							}
						}
					},
					{
						"label": "RGB",
						"type": {
							"fix": 	{
								"value": 0x010A
							}
						}
					},
					{
						"label": "Right click",
						"type": {
							"fix": 	{
								"value": 0x010B
							}
						}
					},
					{
						"label": "Rock",
						"type": {
							"fix": 	{
								"value": 0x010C
							}
						}
					},
					{
						"label": "Rotate left",
						"type": {
							"fix": 	{
								"value": 0x010D
							}
						}
					},
					{
						"label": "Rotate right",
						"type": {
							"fix": 	{
								"value": 0x010E
							}
						}
					},
					{
						"label": "SAT",
						"type": {
							"fix": 	{
								"value": 0x010F
							}
						}
					},
					{
						"label": "Scan",
						"type": {
							"fix": 	{
								"value": 0x0110
							}
						}
					},
					{
						"label": "Scart",
						"type": {
							"fix": 	{
								"value": 0x0111
							}
						}
					},
					{
						"label": "Scene",
						"type": {
							"fix": 	{
								"value": 0x0112
							}
						}
					},
					{
						"label": "Scroll",
						"type": {
							"fix": 	{
								"value": 0x0113
							}
						}
					},
					{
						"label": "Services",
						"type": {
							"fix": 	{
								"value": 0x0114
							}
						}
					},
					{
						"label": "Setup menu",
						"type": {
							"fix": 	{
								"value": 0x0115
							}
						}
					},
					{
						"label": "Sharp",
						"type": {
							"fix": 	{
								"value": 0x0116
							}
						}
					},
					{
						"label": "Sharpness",
						"type": {
							"fix": 	{
								"value": 0x0117
							}
						}
					},
					{
						"label": "Sharpness down",
						"type": {
							"fix": 	{
								"value": 0x0118
							}
						}
					},
					{
						"label": "Sharpness up",
						"type": {
							"fix": 	{
								"value": 0x0119
							}
						}
					},
					{
						"label": "Side A/B",
						"type": {
							"fix": 	{
								"value": 0x011A
							}
						}
					},
					{
						"label": "Skip forward",
						"type": {
							"fix": 	{
								"value": 0x011B
							}
						}
					},
					{
						"label": "Skip reverse",
						"type": {
							"fix": 	{
								"value": 0x011C
							}
						}
					},
					{
						"label": "Sleep",
						"type": {
							"fix": 	{
								"value": 0x011D
							}
						}
					},
					{
						"label": "Slow",
						"type": {
							"fix": 	{
								"value": 0x011E
							}
						}
					},
					{
						"label": "Slow forward",
						"type": {
							"fix": 	{
								"value": 0x011F
							}
						}
					},
					{
						"label": "Slow reverse",
						"type": {
							"fix": 	{
								"value": 0x0120
							}
						}
					},
					{
						"label": "Sound menu",
						"type": {
							"fix": 	{
								"value": 0x0121
							}
						}
					},
					{
						"label": "Sound mode",
						"type": {
							"fix": 	{
								"value": 0x0122
							}
						}
					},
					{
						"label": "Speed",
						"type": {
							"fix": 	{
								"value": 0x0123
							}
						}
					},
					{
						"label": "Speed down",
						"type": {
							"fix": 	{
								"value": 0x0124
							}
						}
					},
					{
						"label": "Speed up",
						"type": {
							"fix": 	{
								"value": 0x0125
							}
						}
					},
					{
						"label": "Sports",
						"type": {
							"fix": 	{
								"value": 0x0126
							}
						}
					},
					{
						"label": "Stadium",
						"type": {
							"fix": 	{
								"value": 0x0127
							}
						}
					},
					{
						"label": "Start",
						"type": {
							"fix": 	{
								"value": 0x0128
							}
						}
					},
					{
						"label": "Start ID erase",
						"type": {
							"fix": 	{
								"value": 0x0129
							}
						}
					},
					{
						"label": "Start ID renumber",
						"type": {
							"fix": 	{
								"value": 0x012A
							}
						}
					},
					{
						"label": "Start ID write",
						"type": {
							"fix": 	{
								"value": 0x012B
							}
						}
					},
					{
						"label": "Step",
						"type": {
							"fix": 	{
								"value": 0x012C
							}
						}
					},
					{
						"label": "Stereo/Mono",
						"type": {
							"fix": 	{
								"value": 0x012D
							}
						}
					},
					{
						"label": "Still forward",
						"type": {
							"fix": 	{
								"value": 0x012E
							}
						}
					},
					{
						"label": "Still reverse",
						"type": {
							"fix": 	{
								"value": 0x012F
							}
						}
					},
					{
						"label": "Subtitle",
						"type": {
							"fix": 	{
								"value": 0x0130
							}
						}
					},
					{
						"label": "Subwoofer down",
						"type": {
							"fix": 	{
								"value": 0x0131
							}
						}
					},
					{
						"label": "Subwoofer up",
						"type": {
							"fix": 	{
								"value": 0x0132
							}
						}
					},
					{
						"label": "Super bass",
						"type": {
							"fix": 	{
								"value": 0x0133
							}
						}
					},
					{
						"label": "Surround",
						"type": {
							"fix": 	{
								"value": 0x0134
							}
						}
					},
					{
						"label": "Surround mode",
						"type": {
							"fix": 	{
								"value": 0x0135
							}
						}
					},
					{
						"label": "S-Video",
						"type": {
							"fix": 	{
								"value": 0x0136
							}
						}
					},
					{
						"label": "Sweep",
						"type": {
							"fix": 	{
								"value": 0x0137
							}
						}
					},
					{
						"label": "Synchro record",
						"type": {
							"fix": 	{
								"value": 0x0138
							}
						}
					},
					{
						"label": "Tape 1",
						"type": {
							"fix": 	{
								"value": 0x0139
							}
						}
					},
					{
						"label": "Tape 1-2",
						"type": {
							"fix": 	{
								"value": 0x013A
							}
						}
					},
					{
						"label": "Tape 2",
						"type": {
							"fix": 	{
								"value": 0x013B
							}
						}
					},
					{
						"label": "Temperature down",
						"type": {
							"fix": 	{
								"value": 0x013C
							}
						}
					},
					{
						"label": "Temperature up",
						"type": {
							"fix": 	{
								"value": 0x013D
							}
						}
					},
					{
						"label": "Test tone",
						"type": {
							"fix": 	{
								"value": 0x013E
							}
						}
					},
					{
						"label": "Text (Teletext)",
						"type": {
							"fix": 	{
								"value": 0x013F
							}
						}
					},
					{
						"label": "Text expand",
						"type": {
							"fix": 	{
								"value": 0x0140
							}
						}
					},
					{
						"label": "Text hold",
						"type": {
							"fix": 	{
								"value": 0x0141
							}
						}
					},
					{
						"label": "Text index",
						"type": {
							"fix": 	{
								"value": 0x0142
							}
						}
					},
					{
						"label": "Text mix",
						"type": {
							"fix": 	{
								"value": 0x0143
							}
						}
					},
					{
						"label": "Text off",
						"type": {
							"fix": 	{
								"value": 0x0144
							}
						}
					},
					{
						"label": "Text reveal",
						"type": {
							"fix": 	{
								"value": 0x0145
							}
						}
					},
					{
						"label": "Text subpage",
						"type": {
							"fix": 	{
								"value": 0x0146
							}
						}
					},
					{
						"label": "Text timer page",
						"type": {
							"fix": 	{
								"value": 0x0147
							}
						}
					},
					{
						"label": "Text update",
						"type": {
							"fix": 	{
								"value": 0x0148
							}
						}
					},
					{
						"label": "Theater",
						"type": {
							"fix": 	{
								"value": 0x0149
							}
						}
					},
					{
						"label": "Theme",
						"type": {
							"fix": 	{
								"value": 0x014A
							}
						}
					},
					{
						"label": "Thumbs down",
						"type": {
							"fix": 	{
								"value": 0x014B
							}
						}
					},
					{
						"label": "Thumbs up",
						"type": {
							"fix": 	{
								"value": 0x014C
							}
						}
					},
					{
						"label": "Tilt down",
						"type": {
							"fix": 	{
								"value": 0x014D
							}
						}
					},
					{
						"label": "Tilt up",
						"type": {
							"fix": 	{
								"value": 0x014E
							}
						}
					},
					{
						"label": "Time",
						"type": {
							"fix": 	{
								"value": 0x014F
							}
						}
					},
					{
						"label": "Timer",
						"type": {
							"fix": 	{
								"value": 0x0150
							}
						}
					},
					{
						"label": "Timer down",
						"type": {
							"fix": 	{
								"value": 0x0151
							}
						}
					},
					{
						"label": "Timer up",
						"type": {
							"fix": 	{
								"value": 0x0152
							}
						}
					},
					{
						"label": "Tint",
						"type": {
							"fix": 	{
								"value": 0x0153
							}
						}
					},
					{
						"label": "Tint down",
						"type": {
							"fix": 	{
								"value": 0x0154
							}
						}
					},
					{
						"label": "Tint up",
						"type": {
							"fix": 	{
								"value": 0x0155
							}
						}
					},
					{
						"label": "Title",
						"type": {
							"fix": 	{
								"value": 0x0156
							}
						}
					},
					{
						"label": "Track",
						"type": {
							"fix": 	{
								"value": 0x0157
							}
						}
					},
					{
						"label": "Tracking",
						"type": {
							"fix": 	{
								"value": 0x0158
							}
						}
					},
					{
						"label": "Tracking down",
						"type": {
							"fix": 	{
								"value": 0x0159
							}
						}
					},
					{
						"label": "Tracking up",
						"type": {
							"fix": 	{
								"value": 0x015A
							}
						}
					},
					{
						"label": "Treble",
						"type": {
							"fix": 	{
								"value": 0x015B
							}
						}
					},
					{
						"label": "Treble down",
						"type": {
							"fix": 	{
								"value": 0x015C
							}
						}
					},
					{
						"label": "Treble up",
						"type": {
							"fix": 	{
								"value": 0x015D
							}
						}
					},
					{
						"label": "Tune down",
						"type": {
							"fix": 	{
								"value": 0x015E
							}
						}
					},
					{
						"label": "Tune up",
						"type": {
							"fix": 	{
								"value": 0x015F
							}
						}
					},
					{
						"label": "Tuner",
						"type": {
							"fix": 	{
								"value": 0x0160
							}
						}
					},
					{
						"label": "VCR Plus+",
						"type": {
							"fix": 	{
								"value": 0x0161
							}
						}
					},
					{
						"label": "Video 1",
						"type": {
							"fix": 	{
								"value": 0x0162
							}
						}
					},
					{
						"label": "Video 2",
						"type": {
							"fix": 	{
								"value": 0x0163
							}
						}
					},
					{
						"label": "Video 3",
						"type": {
							"fix": 	{
								"value": 0x0164
							}
						}
					},
					{
						"label": "Video 4",
						"type": {
							"fix": 	{
								"value": 0x0165
							}
						}
					},
					{
						"label": "Video 5",
						"type": {
							"fix": 	{
								"value": 0x0166
							}
						}
					},
					{
						"label": "View",
						"type": {
							"fix": 	{
								"value": 0x0167
							}
						}
					},
					{
						"label": "Voice",
						"type": {
							"fix": 	{
								"value": 0x0168
							}
						}
					},
					{
						"label": "Zoom",
						"type": {
							"fix": 	{
								"value": 0x0169
							}
						}
					},
					{
						"label": "Zoom in",
						"type": {
							"fix": 	{
								"value": 0x016A
							}
						}
					},
					{
						"label": "Zoom out",
						"type": {
							"fix": 	{
								"value": 0x016B
							}
						}
					},
					{
						"label": "eHome",
						"type": {
							"fix": 	{
								"value": 0x016C
							}
						}
					},
					{
						"label": "Details",
						"type": {
							"fix": 	{
								"value": 0x016D
							}
						}
					},
					{
						"label": "DVD menu",
						"type": {
							"fix": 	{
								"value": 0x016E
							}
						}
					},
					{
						"label": "My TV",
						"type": {
							"fix": 	{
								"value": 0x016F
							}
						}
					},
					{
						"label": "Recorded TV",
						"type": {
							"fix": 	{
								"value": 0x0170
							}
						}
					},
					{
						"label": "My videos",
						"type": {
							"fix": 	{
								"value": 0x0171
							}
						}
					},
					{
						"label": "DVD angle",
						"type": {
							"fix": 	{
								"value": 0x0172
							}
						}
					},
					{
						"label": "DVD audio",
						"type": {
							"fix": 	{
								"value": 0x0173
							}
						}
					},
					{
						"label": "DVD subtitle",
						"type": {
							"fix": 	{
								"value": 0x0174
							}
						}
					},
					{
						"label": "Radio",
						"type": {
							"fix": 	{
								"value": 0x0175
							}
						}
					},
					{
						"label": "#",
						"type": {
							"fix": 	{
								"value": 0x0176
							}
						}
					},
					{
						"label": "*",
						"type": {
							"fix": 	{
								"value": 0x0177
							}
						}
					},
					{
						"label": "OEM 1",
						"type": {
							"fix": 	{
								"value": 0x0178
							}
						}
					},
					{
						"label": "OEM 2",
						"type": {
							"fix": 	{
								"value": 0x0179
							}
						}
					},
					{
						"label": "Info",
						"type": {
							"fix": 	{
								"value": 0x017A
							}
						}
					},
					{
						"label": "CAPS NUM",
						"type": {
							"fix": 	{
								"value": 0x017B
							}
						}
					},
					{
						"label": "TV MODE",
						"type": {
							"fix": 	{
								"value": 0x017C
							}
						}
					},
					{
						"label": "SOURCE",
						"type": {
							"fix": 	{
								"value": 0x017D
							}
						}
					},
					{
						"label": "FILEMODE",
						"type": {
							"fix": 	{
								"value": 0x017E
							}
						}
					},
					{
						"label": "Time seek",
						"type": {
							"fix": 	{
								"value": 0x017F
							}
						}
					},
					{
						"label": "Mouse enable",
						"type": {
							"fix": 	{
								"value": 0x0180
							}
						}
					},
					{
						"label": "Mouse disable",
						"type": {
							"fix": 	{
								"value": 0x0181
							}
						}
					},
					{
						"label": "VOD",
						"type": {
							"fix": 	{
								"value": 0x0182
							}
						}
					},
					{
						"label": "Thumbs Up",
						"type": {
							"fix": 	{
								"value": 0x0183
							}
						}
					},
					{
						"label": "Thumbs Down",
						"type": {
							"fix": 	{
								"value": 0x0184
							}
						}
					},
					{
						"label": "Apps",
						"type": {
							"fix": 	{
								"value": 0x0185
							}
						}
					},
					{
						"label": "Mouse toggle",
						"type": {
							"fix": 	{
								"value": 0x0186
							}
						}
					},
					{
						"label": "TV Mode",
						"type": {
							"fix": 	{
								"value": 0x0187
							}
						}
					},
					{
						"label": "DVD Mode",
						"type": {
							"fix": 	{
								"value": 0x0188
							}
						}
					},
					{
						"label": "STB Mode",
						"type": {
							"fix": 	{
								"value": 0x0189
							}
						}
					},
					{
						"label": "AUX Mode",
						"type": {
							"fix": 	{
								"value": 0x018A
							}
						}
					},
					{
						"label": "BluRay Mode",
						"type": {
							"fix": 	{
								"value": 0x018B
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018C
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018D
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018E
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018F
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0190
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0191
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0192
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0193
							}
						}
					},
					{
						"label": "Standby 1",
						"type": {
							"fix": 	{
								"value": 0x0194
							}
						}
					},
					{
						"label": "Standby 2",
						"type": {
							"fix": 	{
								"value": 0x0195
							}
						}
					},
					{
						"label": "Standby 3",
						"type": {
							"fix": 	{
								"value": 0x0196
							}
						}
					},
					{
						"label": "HDMI 1",
						"type": {
							"fix": 	{
								"value": 0x0197
							}
						}
					},
					{
						"label": "HDMI 2",
						"type": {
							"fix": 	{
								"value": 0x0198
							}
						}
					},
					{
						"label": "HDMI 3",
						"type": {
							"fix": 	{
								"value": 0x0199
							}
						}
					},
					{
						"label": "HDMI 4",
						"type": {
							"fix": 	{
								"value": 0x019A
							}
						}
					},
					{
						"label": "HDMI 5",
						"type": {
							"fix": 	{
								"value": 0x019B
							}
						}
					},
					{
						"label": "HDMI 6",
						"type": {
							"fix": 	{
								"value": 0x019C
							}
						}
					},
					{
						"label": "HDMI 7",
						"type": {
							"fix": 	{
								"value": 0x019D
							}
						}
					},
					{
						"label": "HDMI 8",
						"type": {
							"fix": 	{
								"value": 0x019E
							}
						}
					},
					{
						"label": "HDMI 9",
						"type": {
							"fix": 	{
								"value": 0x019F
							}
						}
					},
					{
						"label": "USB 1",
						"type": {
							"fix": 	{
								"value": 0x01A0
							}
						}
					},
					{
						"label": "USB 2",
						"type": {
							"fix": 	{
								"value": 0x01A1
							}
						}
					},
					{
						"label": "USB 3",
						"type": {
							"fix": 	{
								"value": 0x01A2
							}
						}
					},
					{
						"label": "USB 4",
						"type": {
							"fix": 	{
								"value": 0x01A3
							}
						}
					},
					{
						"label": "USB 5",
						"type": {
							"fix": 	{
								"value": 0x01A4
							}
						}
					},
					{
						"label": "ZOOM 4:3 Normal",
						"type": {
							"fix": 	{
								"value": 0x01A5
							}
						}
					},
					{
						"label": "ZOOM 4:3 Zoom",
						"type": {
							"fix": 	{
								"value": 0x01A6
							}
						}
					},
					{
						"label": "ZOOM 16:9 Normal",
						"type": {
							"fix": 	{
								"value": 0x01A7
							}
						}
					},
					{
						"label": "ZOOM 16:9 Zoom",
						"type": {
							"fix": 	{
								"value": 0x01A8
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 1",
						"type": {
							"fix": 	{
								"value": 0x01A9
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 2",
						"type": {
							"fix": 	{
								"value": 0x01AA
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 3",
						"type": {
							"fix": 	{
								"value": 0x01AB
							}
						}
					},
					{
						"label": "ZOOM Cinema",
						"type": {
							"fix": 	{
								"value": 0x01AC
							}
						}
					},
					{
						"label": "ZOOM 16:9 Default",
						"type": {
							"fix": 	{
								"value": 0x01AD
							}
						}
					},
					{
						"label": "Reserved (ZOOM mode)",
						"type": {
							"fix": 	{
								"value": 0x01AE
							}
						}
					},
					{
						"label": "Reserved (ZOOM mode)",
						"type": {
							"fix": 	{
								"value": 0x01BF
							}
						}
					},
					{
						"label": "Auto Zoom",
						"type": {
							"fix": 	{
								"value": 0x01B0
							}
						}
					},
					{
						"label": "ZOOM Set as Default Zoom",
						"type": {
							"fix": 	{
								"value": 0x01B1
							}
						}
					},
					{
						"label": "Mute On",
						"type": {
							"fix": 	{
								"value": 0x01B2
							}
						}
					},
					{
						"label": "Mute Off",
						"type": {
							"fix": 	{
								"value": 0x01B3
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO OFF",
						"type": {
							"fix": 	{
								"value": 0x01B4
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO LO",
						"type": {
							"fix": 	{
								"value": 0x01B5
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO MED",
						"type": {
							"fix": 	{
								"value": 0x01B6
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO HI",
						"type": {
							"fix": 	{
								"value": 0x01B7
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01B8
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01B9
							}
						}
					},
					{
						"label": "AUDIO Mode SRS SURROUND ON",
						"type": {
							"fix": 	{
								"value": 0x01BA
							}
						}
					},
					{
						"label": "AUDIO Mode SRS SURROUND OFF",
						"type": {
							"fix": 	{
								"value": 0x01BB
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BC
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BD
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BE
							}
						}
					},
					{
						"label": "Picture Mode Home",
						"type": {
							"fix": 	{
								"value": 0x01BF
							}
						}
					},
					{
						"label": "Picture Mode Retail",
						"type": {
							"fix": 	{
								"value": 0x01C0
							}
						}
					},
					{
						"label": "Picture Mode Vivid",
						"type": {
							"fix": 	{
								"value": 0x01C1
							}
						}
					},
					{
						"label": "Picture Mode Standard",
						"type": {
							"fix": 	{
								"value": 0x01C2
							}
						}
					},
					{
						"label": "Picture Mode Theater",
						"type": {
							"fix": 	{
								"value": 0x01C3
							}
						}
					},
					{
						"label": "Picture Mode Sports",
						"type": {
							"fix": 	{
								"value": 0x01C4
							}
						}
					},
					{
						"label": "Picture Mode Energy savings",
						"type": {
							"fix": 	{
								"value": 0x01C5
							}
						}
					},
					{
						"label": "Picture Mode Custom",
						"type": {
							"fix": 	{
								"value": 0x01C6
							}
						}
					},
					{
						"label": "Cool",
						"type": {
							"fix": 	{
								"value": 0x01C7
							}
						}
					},
					{
						"label": "Medium",
						"type": {
							"fix": 	{
								"value": 0x01C8
							}
						}
					},
					{
						"label": "Warm_D65",
						"type": {
							"fix": 	{
								"value": 0x01C9
							}
						}
					},
					{
						"label": "CC ON",
						"type": {
							"fix": 	{
								"value": 0x01CA
							}
						}
					},
					{
						"label": "CC OFF",
						"type": {
							"fix": 	{
								"value": 0x01CB
							}
						}
					},
					{
						"label": "Video Mute ON",
						"type": {
							"fix": 	{
								"value": 0x01CC
							}
						}
					},
					{
						"label": "Video Mute OFF",
						"type": {
							"fix": 	{
								"value": 0x01CD
							}
						}
					},
					{
						"label": "Next Event",
						"type": {
							"fix": 	{
								"value": 0x01CE
							}
						}
					},
					{
						"label": "Previous Event",
						"type": {
							"fix": 	{
								"value": 0x01CF
							}
						}
					},
					{
						"label": "CEC device list",
						"type": {
							"fix": 	{
								"value": 0x01D0
							}
						}
					},
					{
						"label": "MTS SAP",
						"type": {
							"fix": 	{
								"value": 0x01D1
							}
						}
					},
				]
			};

		// SensorMultilevel
		case 0x31:
			return {
				"Get": [],
			};

		// SensroBinary
		case 0x30:
			return {
				"Get": [],
			};

		// PowerLevel
		case 0x73:
			return {
				"Get": [],
				"TestAllNeighbours": [],
				"TestToNode": [
					{
						"label": "Node ID",
						"type": {
							"range": {
								"min": 0,
								"max": 232
							}
						}
					}
				],
				"Set":[
					{
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}
					},
					{
						"label": "Timeout (s)",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};
			
		// Proprietary
		case 0x88:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Data in format [1,2,3,..,0xa,..]",
						"type": {
							"string": {
							}
						}
					}
				]
			};
		
		// MeterPulse
		case 0x35:
			return {
				"Get": []
			};
		
		// ManufacturerSpecific
		case 0x72:
			return {
				"Get": []
			};
		
		// Manufacturer Proprietary
		case 0x91:
			return {
				"Send": [
					{
						"label": "Data in format [1,2,3,..,0xa,..]",
						"type": {
							"string": {
							}
						}
					}
				]
			};

		// SwitchAll
		case 0x27:
			return {
				"SetOn": [],
				"SetOff": [],
				"Get": [],
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Not in switch all group",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "In switch all off group only",
									"type": {
										"fix": 	{
											"value": 0x01
										}
									}
								},
								{
									"label": "In switch all on group only",
									"type": {
										"fix": 	{
											"value": 0x02
										}
									}
								},
								{
									"label": "In switch all on and off groups",
									"type": {
										"fix": 	{
											"value": 0xff
										}
									}
								}
							]
						}
					}
				]
			};

		// SensorConfiguration
		case 0x9e:
			return	{
				"Get": [],
				"Set": [
					{
						"label": "Trigger",
							"type": {
							"enumof": [
								{
									"label": "Current",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Default",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "Value",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								]
						}
					},
					{
						"label": "Value of Sensor",
						"type": {
							"range": {
								"min": 0,
								"max": 0xffff
							}
						}
					}
				]
			};

		// ScheduleEntryLock
		case 0x4e:
			return {
				"WeekDayScheduleGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"YearScheduleGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"WeekDayScheduleSet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"YearScheduleSet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"Set": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],

				"AllSet": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				]
			};

		// SceneActivation
		case 0x2B:
			return {
				"Set": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// SceneActuatorConf
		case 0x2C:
			return {
				"Get": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Level used",
						"type": {
							"enumof": [
								{
									"label": "Current in device",
									"type": {
										"fix": 	{
											"value": 0,
											},
										}
									},
								{
									"label": "Defined",
									"type": {
										"fix": 	{
											"value": 1 << 7,
										}
									}
								}
							]
						}
					},
				]
			};

		// Protection
		case 0x75:
			return {
				"Get": [],
				"ExclusiveGet": [],
				"TimeoutGet": [],
				"Set": (function () {
					var ret = [
						{
							"label": "Local operations",
								"type": {
									"enumof": [
										{
											"label": "Unprotected",
											"type": {
												"fix": 	{
													"value": 0
												}
											}
										},
										{
											"label": "Protection by sequence",
											"type": {
												"fix": 	{
													"value": 1
												}
											}
										},
										{
											"label": "No operation possible",
											"type": {
												"fix": 	{
													"value": 2
												}
											}
										}
									]
								}
							},
						];

					if (data.version.value >= 2)
						ret.push({
								"label": "RF operations",
								"type": {
									"enumof": [
										{
											"label": "Unprotected",
											"type": {
												"fix": 	{
													"value": 0
												}
											}
										},
										{
											"label": "No RF Control",
											"type": {
												"fix": 	{
													"value": 1
												}
											}
										},
										{
											"label": "No RF Communication",
											"type": {
												"fix": 	{
													"value": 2
												}
											}
										}
									]
								}
							}
						);
						return ret;
				})(),
				
				"TimeoutSet": [
					 {
						"label": "Time",
						"type": {
							"enumof": [
								{
									"label": "No",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Sec",
									"type": {
										"range": {
											"min": 0,
											"max": 60
										}
									}
								},
								{
									"label": "Min",
									"type": {
										"range": {
											"min": 	2,
											"max": 191,
										"shift": 	63
										}
									}
								},
								{
									"label": "Infinite",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								]
						}
					}
				],
				"ExclusivitySet": [
					{
						"label": "to node",
						"type": {
							"node": {}
						}
					}
				]
			};
			
		// SceneControllerConf
		case 0x2d:
			return {
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "DimmingDuration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// Alarm
		case 0x71:
			var ret = {
				"Get": [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};
			
			if (data.version.value > 1) {
				ret["Set"] = [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Status",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				];
			}
			
			return ret;
		
		// AlarmSensor
		case 0x9c:
			return {
				"Get": []
			};
		
		// Battery
		case 0x80:
			return {
				"Get": []
			};

		// MutiChannelAssociation
		case 0x8e:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					},
					{
						"label": "instance",
						"type": {
							"range": {
								"min": 	1,
								"max": 127
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					},
					{
						"label": "instance",
						"type": {
							"range": {
								"min": 	1,
								"max": 127
							}
						}
					}
				]
			};
		
		// Meter	
		case 0x32:
			return {
				"Get": [],
				"Reset": []
			};

		// AlarmSilence
		case 0x9d:
			return {
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Disable all",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Disable all Sensor Alarms",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Enable all",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "Enable all Sensor Alarms",
									"type": {
										"fix": 	{
											"value": 3
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration in sec",
						"type": {
							"range": {
								"min": 0,
								"max": 256
							}
						}
					},
					{
						"label": "Alarm",
						"type": {
							"range": {
								"min": 0,
								"max": 0xffff
							}
						}
					}
				]
			};

		// BasicWindowCovering
		case 0x50:
			return {
				"Stop": [],
				"Start": [
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// Configuration			
		case 0x70:
			return {
				"Get": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 0,
								"max": 4294967295
							}
						}
					},
					{
						"label": "Size",
						"type": {
							"enumof": [
								{
									"label": "auto detect",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "1 byte",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "2 byte",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "4 byte",
									"type": {
										"fix": 	{
											"value": 4
										}
									}
								}
							]
						}
					}
				],
				"SetDefault": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};

		// Association
		case 0x85:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};

		// AssociationCommandConfiguration
		case 0x9b:
			return {
				"Get": []
			};
		
		// NodeNaming
		case 0x77:
			return {
				"Get": [],
				"GetName": [],
				"GetLocation": [],
				"SetName": [
					{
						"label": "Name",
						"type": {
							"string": {
							}
						}
					}
				],
				"SetLocation": [
					{
						"label": "Location",
						"type": {
							"string": {
							}
						}
					}
				]
			};
			
		// MeterTableMonitor
		case 0x3d:
			return {
				"StatusDateGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "For all entries",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Start (UNIX stamp)",
						"type": {
							"range": {
								"min": 0,
								"max": 100000000
							}
						}
					},
					{
						"label": "Stop (UNIX stamp)",
						"type": {
							"range": {
								"min": 0,
								"max": 100000000
							}
						}
					}
				],
				"StatusDepthGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "Current only",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "For all entries",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					}
				],
				"CurrentDataGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "For all supported",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// Indicator			
		case 0x87:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Active",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		/*
		This UI requires special handling of form, so it is handled in a special tab in the UI
		// FirmwareUpdateMD
		case 0x7A:
			return {
				"Get": [],
				"RequestUpdate": [
					{
						"label": "Path to File",
						"type": {
							"string": {
							}
						}
					},
					{
						"label": "FirmwareId",
						"type": {
							"range": {
								"min": 0,
								"max": 65535
							}
						}
					}
				]
			};
		*/
		
		// DoorLockLogging
		case 0x4c:
			return {
				"Get": [
					{
						"label": "Record",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				]
			};

		// DoorLock
		case 0x62:
			return {
			 	"Get": [],
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Door Unsecured",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Door Unsecured with timeout",
									"type": {
										"fix": 	{
											"value": 0x1
										}
									}
								},
								{
									"label": "Door Unsecured for inside Door Handles",
									"type": {
										"fix": 	{
											"value": 0x10
										}
									}
								},
								{
									"label": "Door Unsecured for inside Door Handles with timeout",
									"type": {
										"fix": 	{
											"value": 0x11
										}
									}
								},
								{
									"label": "Door Unsecured for outside Door Handles",
									"type": {
										"fix": 	{
											"value": 0x20
										}
									}
								},
								{
									"label": "Door Unsecured for outside Door Handles with timeout",
									"type": {
										"fix": 	{
											"value": 0x21
										}
									}
								},
								{
									"label": "Door Secured",
									"type": {
										"fix": 	{
											"value": 0xff
										}
									}
								}
							]
						}
					}
				],
				"ConfigurationGet": [],
				"ConfigurationSet": [
					{
						"label": "Timeout, minutes",
						"type": {
							"range": {
								"min": 	1,
								"max": 254
							}
						}
					},
					{
						"label": "Timeout, seconds",
						"type": {
							"range": {
								"min": 	1,
								"max": 59
							}
						}
					}
				]
			};

		// Basic
		case 0x20:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Dimmer level",
									"type": {
										"range": {
											"min": 0,
											"max": 255
										}
									}
								},
								{
									"label": "Max",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// ClimateControlSchedule	(incomplete Implementation, only overwrite but no schedule handling)
		case 0x46:
			return {
				"OverrideGet": [],
				"OverrideSet": [
					{
						"label": "Type",
						"type": {
							"enumof": [
								{
									"label": "No override",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},							
								{
									"label": "Permanently",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Temporary",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								}
							]
						}
					},
					
					{
						"label": "State",
						"type": {
							"enumof": [
								{
									"label": "Unused",
									"type": {
										"fix": 	{
											"value": 127
										}
									}
								},
								{
									"label": "Energy Saving",
									"type": {
										"fix": 	{
											"value": 122
										}
									}
								},							
								{
									"label": "Frost Protection",
									"type": {
										"fix": 	{
											"value": 121
										}
									}
								},
								{
									"label": "Temperature Offset in 1/10K",
									"type": {
										"range": {
											"min": -128,
											"max": 120
										}
									}
								},
							]
						}
					},
					
					
					
					
										
				]								
			};   

		default: return {};
	}
}
