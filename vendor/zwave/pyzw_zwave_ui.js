var _methods_specs_rendered = null;

function getMethodSpec(ZWaveAPIData,devId, instId, ccId, method) {
	if (_methods_specs_rendered === null) {
		renderAllMethodSpec(ZWaveAPIData);
	}
	
	try {
		if (!(devId in _methods_specs_rendered)) {
			_methods_specs_rendered[devId] = {};
		}
		if (!(instId in _methods_specs_rendered[devId])) {
			_methods_specs_rendered[devId][instId] = {};
		}
		if (!(ccId in _methods_specs_rendered[devId][instId])) {
			 _methods_specs_rendered[devId][instId][ccId] = renderMethodSpec(parseInt(ccId, 10), ZWaveAPIData.devices[devId].instances[instId].commandClasses[ccId].data);
		}

		var methods = _methods_specs_rendered[devId][instId][ccId];
		if (method) {
			return methods[method];
		} else {
			return methods;
		}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
											if (data.version.value >= 2 && data.min.value !== null) {
												return data.min.value;
											}
										} catch(err) {}
										return 0;
									}
									)(),
								"max": 	(
									function() {
										try {
											if (data.version.value >= 2 && data.max.value !== null) {
												return data.max.value;
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
				"Set": [
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
					/* Current version of SimpleAV implementation does not support media item
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
					*/
					{
						"label": "Button",
						"type": {
							"enumof": (
									function() {
										var buttons = ["Mute","Volume down","Volume up","Channel up","Channel down","0","1","2","3","4","5","6","7","8","9","Last channel","Display","Favorite channel","Play","Stop","Pause","Fast forward","Rewind","Instant replay","Record","AC3","PVR menu","Guide","Menu","Menu up","Menu down","Menu left","Menu right","Page up","Page down","Select","Exit","Input","Power","Enter channel","10","11","12","13","14","15","16","+10","+20","+100","-/--","3-CH","3D","6-CH input","A","Add","Alarm","AM","Analog","Angle","Antenna","Antenna east","Antenna west","Aspect","Audio 1","Audio 2","Audio 3","Audio dubbing","Audio level down","Audio level up","Auto/Manual","Aux 1","Aux 2","B","Back","Background","Balance","Balance left","Balance right","Band","Bandwidth","Bass","Bass down","Bass up","Blank","Breeze mode","Bright","Brightness","Brightness down","Brightness up","Buy","C","Camera","Category down","Category up","Center","Center down","Center mode","Center up","Channel/Program","Clear","Close","Closed caption","Cold","Color","Color down","Color up","Component 1","Component 2","Component 3","Concert","Confirm","Continue","Contrast","Contrast down","Contrast up","Counter","Counter reset","D","Day down","Day up","Delay","Delay down","Delay up","Delete","Delimiter","Digest","Digital","Dim","Direct","Disarm","Disc","Disc 1","Disc 2","Disc 3","Disc 4","Disc 5","Disc 6","Disc down","Disc up","Disco","Edit","Effect down","Effect up","Eject","End","EQ","Fader","Fan","Fan high","Fan low","Fan medium","Fan speed","Fastext blue","Fastext green","Fastext purple","Fastext red","Fastext white","Fastext yellow","Favorite channel down","Favorite channel up","Finalize","Fine tune","Flat","FM","Focus down","Focus up","Freeze","Front","Game","GoTo","Hall","Heat","Help","Home","Index","Index forward","Index reverse","Interactive","Intro scan","Jazz","Karaoke","Keystone","Keystone down","Keystone up","Language","Left click","Level","Light","List","Live TV","Local/Dx","Loudness","Mail","Mark","Memory recall","Monitor","Movie","Multi room","Music","Music scan","Natural","Night","Noise reduction","Normalize","Discrete input CableTV","Discrete input CD 1","Discrete input CD 2","Discrete input CD Recorder","Discrete input DAT (Digital Audio Tape)","Discrete input DVD","Discrete input DVI","Discrete input HDTV","Discrete input LaserDisc","Discrete input MiniDisc","Discrete input PC","Discrete input Personal Video Recorder","Discrete input TV","Discrete input TV/VCR or TV/DVD","Discrete input VCR","One touch playback","One touch record","Open","Optical","Options","Orchestra","PAL/NTSC","Parental lock","PBC","Phono","Photos","Picture menu","Picture mode","Picture mute","PIP channel down","PIP channel up","PIP freeze","PIP input","PIP move","PIP Off","PIP On","PIP size","PIP split","PIP swap","Play mode","Play reverse","Power Off","Power On","PPV (Pay per view)","Preset","Program","Progressive scan","ProLogic","PTY","Quick skip","Random","RDS","Rear","Rear volume down","Rear volume up","Record mute","Record pause","Repeat","Repeat A-B","Resume","RGB","Right click","Rock","Rotate left","Rotate right","SAT","Scan","Scart","Scene","Scroll","Services","Setup menu","Sharp","Sharpness","Sharpness down","Sharpness up","Side A/B","Skip forward","Skip reverse","Sleep","Slow","Slow forward","Slow reverse","Sound menu","Sound mode","Speed","Speed down","Speed up","Sports","Stadium","Start","Start ID erase","Start ID renumber","Start ID write","Step","Stereo/Mono","Still forward","Still reverse","Subtitle","Subwoofer down","Subwoofer up","Super bass","Surround","Surround mode","S-Video","Sweep","Synchro record","Tape 1","Tape 1-2","Tape 2","Temperature down","Temperature up","Test tone","Text (Teletext)","Text expand","Text hold","Text index","Text mix","Text off","Text reveal","Text subpage","Text timer page","Text update","Theater","Theme","Thumbs down","Thumbs up","Tilt down","Tilt up","Time","Timer","Timer down","Timer up","Tint","Tint down","Tint up","Title","Track","Tracking","Tracking down","Tracking up","Treble","Treble down","Treble up","Tune down","Tune up","Tuner","VCR Plus+","Video 1","Video 2","Video 3","Video 4","Video 5","View","Voice","Zoom","Zoom in","Zoom out","eHome","Details","DVD menu","My TV","Recorded TV","My videos","DVD angle","DVD audio","DVD subtitle","Radio","#","*","OEM 1","OEM 2","Info","CAPS NUM","TV MODE","SOURCE","FILEMODE","Time seek","Mouse enable","Mouse disable","VOD","Thumbs Up","Thumbs Down","Apps","Mouse toggle","TV Mode","DVD Mode","STB Mode","AUX Mode","BluRay Mode","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Reserved (Mode)","Standby 1","Standby 2","Standby 3","HDMI 1","HDMI 2","HDMI 3","HDMI 4","HDMI 5","HDMI 6","HDMI 7","HDMI 8","HDMI 9","USB 1","USB 2","USB 3","USB 4","USB 5","ZOOM 4:3 Normal","ZOOM 4:3 Zoom","ZOOM 16:9 Normal","ZOOM 16:9 Zoom","ZOOM 16:9 Wide 1","ZOOM 16:9 Wide 2","ZOOM 16:9 Wide 3","ZOOM Cinema","ZOOM 16:9 Default","Reserved (ZOOM mode)","Reserved (ZOOM mode)","Auto Zoom","ZOOM Set as Default Zoom","Mute On","Mute Off","AUDIO Mode AUDYSSEY AUDIO OFF","AUDIO Mode AUDYSSEY AUDIO LO","AUDIO Mode AUDYSSEY AUDIO MED","AUDIO Mode AUDYSSEY AUDIO HI","Reserved","Reserved","AUDIO Mode SRS SURROUND ON","AUDIO Mode SRS SURROUND OFF","Reserved","Reserved","Reserved","Picture Mode Home","Picture Mode Retail","Picture Mode Vivid","Picture Mode Standard","Picture Mode Theater","Picture Mode Sports","Picture Mode Energy savings","Picture Mode Custom","Cool","Medium","Warm_D65","CC ON","CC OFF","Video Mute ON","Video Mute OFF","Next Event","Previous Event","CEC device list","MTS SAP"];
										try {
											var arr = [];
											var masks = data.bitmask.value;
											for (var i = 0; i < masks.length * 8; i++) {
												if (masks[Math.floor(i / 8)] & (1 << (i % 8))) {
													arr.push({
														"label": buttons[i],
														"type": {
															"fix": 	{
																"value": (i + 1)
															}
														}
													});
												}
											}
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
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
				"Enable": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 	0,
								"max": 255
							}
						}
					},
					{
						"label": "Status",
						"type": {
							"enumof": [
								{
									"label": "disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "enable",
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
				"WeekdayGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Slot",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"WeekdaySet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Slot",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Day of week",
						"type": {
							"enumof": [
								{
									"label": "Monday",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Tuesday",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "Wednesday",
									"type": {
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "Thursday",
									"type": {
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "Friday",
									"type": {
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "Saturday",
									"type": {
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "Sunday",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}
					},
					{
						"label": "Begin hour",
						"type": {
							"range": {
								"min": 0,
								"max": 23
							}
						}
					},
					{
						"label": "Begin minute",
						"type": {
							"range": {
								"min": 0,
								"max": 59
							}
						}
					},
					{
						"label": "End hour",
						"type": {
							"range": {
								"min": 0,
								"max": 23
							}
						}
					},
					{
						"label": "End minute",
						"type": {
							"range": {
								"min": 0,
								"max": 59
							}
						}
					}
				],
				"YearGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Slot",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"YearSet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Slot",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Begin year",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					},
					{
						"label": "Begin month",
						"type": {
							"range": {
								"min": 1,
								"max": 12
							}
						}
					},
					{
						"label": "Begin day",
						"type": {
							"range": {
								"min": 1,
								"max": 31
							}
						}
					},
					{
						"label": "Begin hour",
						"type": {
							"range": {
								"min": 0,
								"max": 23
							}
						}
					},
					{
						"label": "Begin minute",
						"type": {
							"range": {
								"min": 0,
								"max": 59
							}
						}
					},
					{
						"label": "End year",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					},
					{
						"label": "End month",
						"type": {
							"range": {
								"min": 1,
								"max": 12
							}
						}
					},
					{
						"label": "End day",
						"type": {
							"range": {
								"min": 1,
								"max": 31
							}
						}
					},
					{
						"label": "End hour",
						"type": {
							"range": {
								"min": 0,
								"max": 23
							}
						}
					},
					{
						"label": "End minute",
						"type": {
							"range": {
								"min": 0,
								"max": 59
							}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
												if (!isNaN(ikey)) {
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
												}
											}
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
		
		// BarrierOperator
		case 0x66:
			return {
				"Get": [],
				"Set": [
					{
						"label": "State",
						"type": {
							"enumof": [
								{
									"label": "Close",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "Open",
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
				"SignalGet": [
					{
						"label": "Signal type",
						"type": {
							"enumof": [
								{
									"label": "Not supported",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "Audible notification",
									"type": {
										"fix": 	{
											"value": 0x01
										}
									}
								},
								{
									"label": "Visual notification",
									"type": {
										"fix": 	{
											"value": 0x02
										}
									}
								}
							]
						}
					}
				],
				"SignalSet": [
					{
						"label": "Signal type",
						"type": {
							"enumof": [
								{
									"label": "Not supported",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "Audible notification",
									"type": {
										"fix": 	{
											"value": 0x01
										}
									}
								},
								{
									"label": "Visual notification",
									"type": {
										"fix": 	{
											"value": 0x02
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
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "On",
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
						"label": "Operation Mode",
						"type": {
							"enumof": [
								{
									"label": "Constant operation",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Timed operation",
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
						"label": "Outside state",
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
					},
					{
						"label": "Inside state",
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
					},
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
