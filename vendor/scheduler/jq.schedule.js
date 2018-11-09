(function($) {
	$.fn.timeSchedule = function(options) {
		var defaults = {
			rows: {},
			startTime: "00:00",
			endTime: "24:00",
			widthTimeX: 4, // 1cell
			widthTime: 600, //
			timeLineY: 30, // timeline height(px)
			timeLineBorder: 1, // timeline height border
			timeBorder: 1, // border width
			timeLinePaddingTop: 0,
			timeLinePaddingBottom: 0,
			headTimeBorder: 1, // time border width
			dataWidth: 40, // data width
			verticalScrollbar: 0, // vertical scrollbar width
			removeButtonWidth: 30,
			// event
			init_data: function() {},
			change: function() {},
			click: function() {},
			append: function() {},
			time_click: function() {},
			append_on_click: function() {},
			bar_Click: function() {},
			connect: function() {},
			confirm: function() {},
			delete_bar: function() {},
			debug: "" // debug selecter
		};

		this.calcStringTime = function(string) {
			var slice = string.split(':');
			var h = Number(slice[0]) * 60 * 60;
			var i = Number(slice[1]) * 60;
			var min = h + i;
			return min;
		};
		this.formatTime = function(min) {
			var h = "" + (min / 36000 | 0) + (min / 3600 % 10 | 0);
			var i = "" + (min % 3600 / 600 | 0) + (min % 3600 / 60 % 10 | 0);
			var string = h + ":" + i;
			return string;
		};

		var setting = $.extend(defaults, options);
		this.setting = setting;
		var scheduleData = new Array();
		var timelineData = new Array();
		var $element = $(this);
		var element = (this);
		var tableStartTime = element.calcStringTime(setting.startTime);
		var tableEndTime = element.calcStringTime(setting.endTime);
		var currentNode = null;
		tableStartTime -= (tableStartTime % setting.widthTime);
		tableEndTime -= (tableEndTime % setting.widthTime);

		this.dragging = false;
		this.isResizing = false;
		this.clicking = false;
		var that = this;

		this.getScheduleData = function() {
			return scheduleData;
		}
		this.getTimelineData = function() {
				return timelineData;
			}
			//
		this.getTimeLineNumber = function(top) {
				var num = 0;
				var n = 0;
				var tn = Math.ceil(top / (setting.timeLineY + setting.timeLinePaddingTop + setting.timeLinePaddingBottom));
				for (var i in setting.rows) {
					var r = setting.rows[i];
					var tr = 0;
					if (typeof r["schedule"] == Object) {
						tr = r["schedule"].length;
					}
					if (currentNode && currentNode["timeline"]) {
						tr++;
					}
					n += Math.max(tr, 1);
					if (n >= tn) {
						break;
					}
					num++;
				}
				return num;
			}
			// add background data
		this.addScheduleBgData = function(data) {
			var st = Math.ceil((data["start"] - tableStartTime) / setting.widthTime);
			var et = Math.floor((data["end"] - tableStartTime) / setting.widthTime);
			var $bar = jQuery('<div class="sc_bgBar"><span class="text"></span></div>');
			var stext = element.formatTime(data["start"]);
			var etext = element.formatTime(data["end"]);
			var snum = element.getScheduleCount(data["timeline"]);
			$bar.css({
				left: (st * setting.widthTimeX),
				top: 0,
				width: ((et - st) * setting.widthTimeX),
				height: $element.find('.sc_main .timeline').eq(data["timeline"]).height()
			});
			if (data["text"]) {
				$bar.find(".text").text(data["text"]);
			}
			if (data["class"]) {
				$bar.addClass(data["class"]);
			}
			//$element.find('.sc_main').append($bar);
			$element.find('.sc_main .timeline').eq(data["timeline"]).append($bar);
		}

		this.removeEntry = function(event) {
			$bar = $(event.target).closest(".sc_Bar");
			var sc_key = $bar.data("sc_key");
			$bar.remove();
			delete scheduleData[sc_key];
			setting.delete_bar();
		};

		// add schedule
		this.addScheduleData = function(data) {
			var st = Math.ceil((data["start"] - tableStartTime) / setting.widthTime);
			var et = Math.floor((data["end"] - tableStartTime) / setting.widthTime);
			var $bar = jQuery('<div class="sc_Bar"><div class="sc_Bar_inner"><span class="head"><span class="time"></span></span><span class="text"></span></div></div>');
			var $removeButton = jQuery('<div class="remove"><i class="fa fa-times"></i></div>');

			var $timeline = $element.find('.sc_main .timeline').eq(data["timeline"]);

			$removeButton.bind("click touch", function(event) {
				that.removeEntry(event);
			})

			var stext = element.formatTime(data["start"]);
			var etext = element.formatTime(data["end"]);
			var snum = element.getScheduleCount(data["timeline"]);

			$bar.css({
				left: (st * setting.widthTimeX),
				top: 0,
				width: ((et - st) * setting.widthTimeX),
				height: (setting.timeLineY)
			});
			$bar.find(".time").text(stext + "-" + etext);
			if (data["text"]) {
				$bar.find(".text").text(data["text"]);
			}
			if (data["class"]) {
				$bar.addClass(data["class"]);
			}
			$bar.append($removeButton);
			$timeline.append($bar);

			scheduleData.push(data);
			// key
			var key = scheduleData.length - 1;
			$bar.data("sc_key", key);

			$bar.bind("click touch", function(event) {
				event.preventDefault();
				if (!$(event.target).hasClass("ui-resizable-handle") && !that.isResizing && !that.dragging && !that.clicking) {
					var $bar = $(event.target).closest(".sc_Bar");
					var sc_key = $bar.data("sc_key");
					setting.bar_Click.call(element, $bar, scheduleData[sc_key], sc_key);
				}
			});

			$bar.bind("mouseup touchend", function() {
				if (setting.click) {
					if (jQuery(this).data("dragCheck") !== true && jQuery(this).data("resizeCheck") !== true) {
						var node = jQuery(this);
						var sc_key = node.data("sc_key");
						setting.click(node, scheduleData[sc_key]);
					}
				}
			});

			var $node = $element.find(".sc_Bar"),
				$elements = $(".sc_Bar"),
				$sc_main = $element.find(".sc_main");
			$node.draggable({
				grid: [setting.widthTimeX, 1],
				containment: $sc_main,
				helper: 'original',
				revert: 'invalid',
				start: function(event, ui) {
					var node = {};
					node["node"] = this;
					node["offsetTop"] = ui.position.top;
					node["offsetLeft"] = ui.position.left;
					node["currentTop"] = ui.position.top;
					node["currentLeft"] = ui.position.left;
					node["timeline"] = element.getTimeLineNumber(ui.position.top);
					node["nowTimeline"] = node["timeline"];
					node["sc_key"] = $(this).data("sc_key");
					currentNode = node;
					that.dragging = true;
					// console.log("drag start");
				},
				drag: function(event, ui) {
					jQuery(this).data("dragCheck", true);
					if (!currentNode) {
						return false;
					}
					// console.log("dragging");
					that.dragging = true;
					var $moveNode = jQuery(this),
						sc_key = $moveNode.data("sc_key"),
						originalTop = ui.originalPosition.top,
						originalLeft = ui.originalPosition.left,
						positionTop = ui.position.top,
						positionLeft = ui.position.left,
						timelineNum = element.getTimeLineNumber(ui.position.top);

					if (positionLeft + $moveNode.width() + setting.removeButtonWidth >= $sc_main.width()) {
						$moveNode.find(".remove").addClass("left");
					} else {
						$moveNode.find(".remove").removeClass("left");
					}

					ui.position.left = Math.floor(ui.position.left / setting.widthTimeX) * setting.widthTimeX;

					if (currentNode["nowTimeline"] != timelineNum) {
						currentNode["nowTimeline"] = timelineNum;
					}
					currentNode["currentTop"] = ui.position.top;
					currentNode["currentLeft"] = ui.position.left;
					//
					element.rewriteBarText($moveNode, scheduleData[sc_key]);
					return true;
				},
				stop: function(event, ui) {
					event.preventDefault();
					jQuery(this).data("dragCheck", false);

					// console.log("drag stop");
					var sc_key = currentNode["sc_key"];

					that.dragging = false;
					if (scheduleData[sc_key] !== undefined) {
						var node = jQuery(this),
							$node = $(node),
							x = node.position().left,
							w = node.width(),
							start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime),
							end = start + ((scheduleData[sc_key]["end"] - scheduleData[sc_key]["start"]));

						scheduleData[sc_key]["start"] = start;
						scheduleData[sc_key]["end"] = end;
						if (setting.change) {
							setting.change(node, scheduleData[sc_key]);
						}
					}
					currentNode = null;
				}
			});

			$node.resizable({
				handles: "e, w",
				grid: [setting.widthTimeX, setting.timeLineY],
				minWidth: setting.widthTimeX,
				containment: "parent",
				start: function(event, ui) {
					event.preventDefault();
					var node = jQuery(this);
					node.data("resizeCheck", true);
					that.isResizing = true;
					// console.log("start resize");
				},
				resize: function(event, ui) {
					var $moveNode = $(this),
						sc_key = $moveNode.data("sc_key"),
						x = ui.position.left,
						w = ui.size.width,
						start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime),
						end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);

					// console.log("$moveNode", $moveNode);



					// update data
					scheduleData[sc_key]["start"] = start;
					scheduleData[sc_key]["end"] = end;

					element.rewriteBarText($moveNode, scheduleData[sc_key]);

					// schow Tooltip on resize
					// var timelineNum = scheduleData[sc_key].timeline,
					//  $timeline = $element.find('.sc_main .timeline').eq(timelineNum),

					//  $sc_main_box = $element.find(".sc_main_box"),
					//  tlIndex = Math.floor((x + w) / setting.widthTimeX),
					//  $tl = $timeline.find('.tl').eq(tlIndex),
					//  timeStr = element.formatTime(tableStartTime + (setting.widthTime * tlIndex)),
					//  html = "<span>" + timeStr + "</span>",
					//  $time = jQuery(html);

					// // console.log("$timeline", $timeline);

					// $element.find(".tooltip").position({
					//  my: "center bottom-10",
					//  at: "center top",
					//  of: $tl,
					//  collison: "flip",
					//  within: $sc_main_box,
					//  using: function(position, feedback) {
					//      $(this).removeClass("bottom center top");
					//      $(this).css({
					//          left: position.left,
					//          top: position.top
					//              //left: position.left - $element.offset().left + $element.position().left,
					//              //top: position.top - $element.offset().top + $element.position().top + jQuery(document).scrollTop()
					//      });
					//      $(this).addClass(feedback.vertical).addClass(feedback.horizontal)
					//  }
					// }).html($time).show();
				},
				stop: function(event, ui) {
					event.preventDefault();
					// console.log("stop resize");
					that.isResizing = false;
					var node = jQuery(this);
					$node = node;
					var sc_key = node.data("sc_key");
					var x = node.position().left;
					var w = node.width();
					var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
					var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
					var timelineNum = scheduleData[sc_key]["timeline"];

					scheduleData[sc_key]["start"] = start;
					scheduleData[sc_key]["end"] = end;

					$bars = $element.find('.sc_main .timeline').eq(scheduleData[sc_key]["timeline"]).find(".sc_Bar");
					var connect = false,
						collison = false,
						cancel = false;
					$bars.each(function(ele) {
						$bar = $($bars[ele]);
						if ($bar.data("sc_key") != $node.data("sc_key")) {
							if (that.isCollison($node, $bar)) {
								collison = true;
								var msg = setting.confirm();
								if (confirm(msg)) {
									connect = true;
									var newStart = 0,
										newEnd = 0,
										old_sc_key = $bar.data("sc_key"),
										end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);

									if (start <= scheduleData[old_sc_key].start) {
										newStart = start;
									} else {
										newStart = scheduleData[old_sc_key].start;
									}

									if (end <= scheduleData[old_sc_key].end) {
										newEnd = scheduleData[old_sc_key].end;
									} else {
										newEnd = end;
									}

									var data = {
										timeline: scheduleData[old_sc_key].timeline,
										start: newStart,
										end: newEnd,
										text: "",
										data: {}
									};

									$node.remove();
									$bar.remove();

									delete scheduleData[sc_key];
									delete scheduleData[old_sc_key];

									//that.addScheduleData(data);
									setting.connect.call(element, data);

								} else {
									cancel = true;
								}
								return false;
							}
						}
					});

					if (!connect && !collison && !cancel) {

						//
						element.resetBarPosition(timelineNum);
						//
						element.rewriteBarText(node, scheduleData[sc_key]);

						node.data("resizeCheck", false);
						//
						if (setting.change) {
							setting.change(node, scheduleData[sc_key]);
						}
					} else if (cancel) {
						// Move the element to its original position.
						ui.element.css(ui.originalPosition);
						// Modify the element's width& height to the original value.
						ui.element.css(ui.originalSize);
					}
				}
			});

			// flip remove icon is draggable on right side
			$node.on("mouseenter", function() {
				var $node = $(this),
					parentWidth = $sc_main.width(),
					positionLeft = $node.position().left,
					draggableRight = positionLeft + $node.width(),
					nodeRight = draggableRight + setting.removeButtonWidth;
				if (nodeRight >= parentWidth) {
					$node.find(".remove").addClass("left");
				}

			}).on("mouseleave", function() {
				var $node = $(this);
				$node.find(".remove").removeClass("left");
			});

			return key;
		};

		this.update = function(updated_data) {
			// delete all schedules (bars)
			$element.find(".sc_Bar").remove();
			scheduleData = new Array();
			setting.rows = updated_data;
			for (var row in setting.rows) {
				for (var i in setting.rows[row]["schedule"]) {
					var bdata = setting.rows[row]["schedule"][i],
						s = element.calcStringTime(bdata["start"]),
						e = element.calcStringTime(bdata["end"]),
						data = {};

					data["timeline"] = parseInt(row);
					data["start"] = s;
					data["end"] = e;
					if (bdata["text"]) {
						data["text"] = bdata["text"];
					}
					data["data"] = {};
					if (bdata["data"]) {
						data["data"] = bdata["data"];
					}
					element.addScheduleData(data);
				}
			}
		};
		//
		this.getScheduleCount = function(n) {
			var num = 0;
			for (var i in scheduleData) {
				if (scheduleData[i]["timeline"] == n) {
					num++;
				}
			}
			return num;
		};
		// add
		this.addRow = function(timeline, row) {
			var title = row["title"];
			var id = $element.find('.sc_main .timeline').length;

			var html;

			html = '';
			html += '<div class="timeline"><span class="title" data-title="' + title + '"></span></div>';
			var $data = jQuery(html);
			// event call
			if (setting.init_data) {
				setting.init_data($data, row);
			}
			$element.find('.sc_data_scroll').append($data);

			html = '';
			html += '<div class="timeline"></div>';
			var $timeline = jQuery(html);
			for (var t = tableStartTime; t < tableEndTime; t += setting.widthTime) {
				var $tl = jQuery('<div class="tl" title=""></div>');
				$tl.bind("mouseenter", function(event) {
					if (!that.isResizing) {
						var timeStr = element.formatTime(tableStartTime + (setting.widthTime * $(this).index())),
							html = "<span>" + timeStr + "</span>",
							$time = jQuery(html),
							$sc_main_box = $element.find(".sc_main_box"),
							$target = $(event.target);

						$element.find(".tooltip").position({
							my: "center bottom-10",
							at: "center top",
							of: $target,
							collison: "flip",
							within: $sc_main_box,
							using: function(position, feedback) {
								$(this).removeClass("bottom center top");
								$(this).css({
									left: position.left - $element.offset().left + $element.position().left,
									top: position.top - $element.offset().top + $element.position().top + jQuery(document).scrollTop()
								});
								$(this).addClass(feedback.vertical).addClass(feedback.horizontal)
							}
						}).html($time).show();
					}

				}).bind("mouseleave", function() {
					$element.find(".tooltip").hide().css({
						left: 0,
						top: 0
					});
				});

				$tl.width(setting.widthTimeX - setting.timeBorder);
				$tl.data("time", element.formatTime(t));
				$tl.data("timeline", timeline);
				$timeline.append($tl);
			}

			// var startTime = null,
			//     endTime = null,
			//     $clickedTl = null,
			//     timelineNum = null;

			$timeline.on("mousedown touchstart", function(event) {
				event.preventDefault();
				if(event.which == 3) { // right mouse button
					return true;
				}

				// console.log("mousedown");
				if ($(event.target).hasClass("tl")) {
					that.clicking = true;
					$clickedTl = $(event.target);
					timelineNum = $clickedTl.data("timeline");
					startTime = $clickedTl.data("time");
					endTime = null,
						$ghost_bar_temp = jQuery('<div class="sc_Bar ghost"></div>');

					$ghost_bar_temp.css({
						top: 0,
						height: (setting.timeLineY),
						display: "none"
					});

					$element.find('.sc_main .timeline').eq(timelineNum).append($ghost_bar_temp);

					element.find(".sc_Bar").css({
						"z-index": 0,
						"opacity": 0.4
					});
				} else {
					that.clicking = false;
					return true;
				}
			}).on("mousemove touchmove", function(event) {
				event.preventDefault();
				//console.log("event", event);
				if (that.clicking == false /*|| $(event.target).data("timeline") !== timelineNum*/) {
					return true;
				}

				var $ghost_bar = $element.find(".ghost"),
					targetIndex = 0;

				if (event.type == "touchmove") {
					if($ghost_bar.length > 0) {
						$ghost_bar.css({
							display: "none"
						});
					}
					var myLocation = event.originalEvent.changedTouches[0],
						realTarget = document.elementFromPoint(myLocation.clientX, myLocation.clientY);
					if (!$(realTarget).hasClass("tl")) {
						return true;
					}
					targetIndex = $(realTarget).index();
				} else {
					targetIndex = $(event.target).index();

					if($ghost_bar.length > 0) {
						var x = event.clientX,
							y = event.clientY;
						$ghost_bar.css({
							display: "none"
						});
						$element.find('.sc_main .timeline').eq(timelineNum).find('.sc_Bar').css({display: 'none'});

						var ele = document.elementFromPoint(x, y);

						if($(ele).hasClass("tl")) {
							targetIndex = $(ele).index();
						}

						$element.find('.sc_main .timeline').eq(timelineNum).find('.sc_Bar').css({display: 'block'});
					}
				}

				endTime = element.formatTime(tableStartTime + (setting.widthTime * targetIndex));

				var st = Math.ceil((element.calcStringTime(startTime) - tableStartTime) / setting.widthTime),
					et = Math.floor((element.calcStringTime(endTime) - tableStartTime) / setting.widthTime),
					left = et < st ? (et * setting.widthTimeX) : (st * setting.widthTimeX),
					width = et < st ? ((st - et) * setting.widthTimeX) : ((et - st) * setting.widthTimeX);

				if ($ghost_bar.length > 0) {
					$ghost_bar.css({
						left: left,
						top: 0,
						width: width,
						display: "block"
					});
				}
			}).on("mouseup touchend", function(event) {
				event.preventDefault();
				// console.log("event", event);
				if (that.clicking == false) {
					return true;
				}
				// console.log("timeline mouseup");
				element.find(".sc_Bar").css({
					"z-index": "auto",
					"opacity": 1
				});
				$ghost_bar_temp = $element.find('.sc_main .timeline').eq(timelineNum).find(".sc_Bar.ghost");
				endTime = endTime == null ? startTime : endTime;

				$bars = $element.find('.sc_main .timeline').eq(timelineNum).find(".sc_Bar");
				// console.log("bars", $bars);

				var connect = false,
					collison = false;

				$bars.each(function(ele) {
					$bar = $($bars[ele]);
					if (!$bar.hasClass("ghost")) {
						// console.log("$bar", $bar);
						// console.log("$ghost_bar_temp", $ghost_bar_temp);
						if (that.isCollison($ghost_bar_temp, $bar)) {
							collison = true;
							// console.log("$bar", $bar);
							// console.log("$ghost_bar_temp", $ghost_bar_temp);

							//if (confirm("connect?")) {
							// // console.log("confirm", setting.confirm.call(element));
							// if (setting.confirm.call(element)) {
							var msg = setting.confirm();
							if (confirm(msg)) {
								connect = true;
								var newStart = 0,
									newEnd = 0;

								var old_sc_key = $bar.data("sc_key");

								var x = $ghost_bar_temp.position().left;
								var w = $ghost_bar_temp.width();
								var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
								var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);

								if (start <= scheduleData[old_sc_key].start) {
									newStart = start;
								} else {
									newStart = scheduleData[old_sc_key].start;
								}

								if (end <= scheduleData[old_sc_key].end) {
									newEnd = scheduleData[old_sc_key].end;
								} else {
									newEnd = end;
								}

								var data = {
									timeline: parseInt(timelineNum),
									start: newStart,
									end: newEnd,
									text: "",
									data: {}
								};
								$bar.remove();

								delete scheduleData[old_sc_key];

								setting.connect.call(element, data);
								//that.addScheduleData(data);
							}
							return false;
						}
					}

				});

				if (!collison && !connect) {
					var st = element.calcStringTime(startTime),
						et = element.calcStringTime(endTime);

					if (et < st) {
						var temp = startTime;
						startTime = endTime;
						endTime = temp;
					}

					setting.append_on_click.call(element, timelineNum, startTime, endTime);
				}
				$ghost_bar_temp.remove();
				that.clicking = false;
				startTime = null;
				endTime = null;
				$clickedTl = null;
				timelineNum = null;

			}).bind("mouseleave", function(event) {
				// // console.log("startTime", startTime);
				// // console.log("endTime", endTime);
				if (that.clicking) {

					// console.log("timeline " + timelineNum + " leave");
				}
			});

			//
			if (setting.time_click) {
				var that = this;
				/*$timeline.find(".tl").click(function(){
				    setting.time_click.call(that, this,jQuery(this).data("time"),jQuery(this).data("timeline"),timelineData[jQuery(this).data("timeline")]);
				});*/
			}
			$element.find('.sc_main').append($timeline);

			timelineData[timeline] = row;

			if (row["class"] && (row["class"] != "")) {
				$element.find('.sc_data .timeline').eq(id).addClass(row["class"]);
				$element.find('.sc_main .timeline').eq(id).addClass(row["class"]);
			}
			//
			if (row["schedule"]) {
				for (var i in row["schedule"]) {
					var bdata = row["schedule"][i];
					var s = element.calcStringTime(bdata["start"]);
					var e = element.calcStringTime(bdata["end"]);

					var data = {};
					data["timeline"] = id;
					data["start"] = s;
					data["end"] = e;
					if (bdata["text"]) {
						data["text"] = bdata["text"];
					}
					data["data"] = {};
					if (bdata["data"]) {
						data["data"] = bdata["data"];
					}
					element.addScheduleData(data);
				}
			}
			//     // remove this
			element.resetBarPosition(id);
			$element.find('.sc_main .timeline').eq(id).droppable({
				accept: ".sc_Bar",
				drop: function(ev, ui) {
					// console.log("Drop");
					var node = ui.draggable;
					$node = node;
					var sc_key = node.data("sc_key");
					var oldTimelineNum = scheduleData[sc_key]["timeline"];
					var nowTimelineNum = $element.find('.sc_main .timeline').index(this);

					$bars = $(this).find(".sc_Bar")
					var connect = false,
						collison = false,
						cancel = false;
					$bars.each(function(ele) {
						$bar = $($bars[ele]);
						if ($bar.data("sc_key") != $node.data("sc_key")) {
							if (that.isCollison($node, $bar)) {
								collison = true;

								// $element.append($confirm);
								// // console.log("confirm 2", setting.confirm.call(element));
								// if (setting.confirm.call(element)) {
								var msg = setting.confirm();
								if (confirm(msg)) {

									connect = true;
									var newStart = 0,
										newEnd = 0;

									var old_sc_key = $bar.data("sc_key");
									// console.log("scheduleData[sc_key]", scheduleData[sc_key]);
									// console.log("scheduleData[old_sc_key]", scheduleData[old_sc_key]);

									var x = $node.position().left;
									var w = $node.width();
									var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
									var end = start + (scheduleData[sc_key].end - scheduleData[sc_key].start);

									if (start <= scheduleData[old_sc_key].start) {
										newStart = start;
									} else {
										newStart = scheduleData[old_sc_key].start;
									}

									if (end <= scheduleData[old_sc_key].end) {
										newEnd = scheduleData[old_sc_key].end;
									} else {
										newEnd = end;
									}

									var data = {
										timeline: scheduleData[old_sc_key].timeline,
										start: newStart,
										end: newEnd,
										text: "",
										data: {}
									};

									$node.remove();
									$bar.remove();

									delete scheduleData[sc_key];
									delete scheduleData[old_sc_key];

									//that.addScheduleData(data);
									setting.connect.call(element, data);
								} else {
									cancel = true;
								}

								return false;
							}
						}
					});

					if (!connect && !collison && !cancel) {
						scheduleData[sc_key]["timeline"] = nowTimelineNum;
						node.appendTo(this);
						element.resetBarPosition(oldTimelineNum);
						element.resetBarPosition(nowTimelineNum);
					} else if (cancel) {
						$node.draggable({
							revert: true
						});
						setTimeout(function() {
							$node.draggable({
								revert: false
							});
						}, 500);
					}
				}
			});
			//
			/*if(setting.append){
			    $element.find('.sc_main .timeline').eq(id).find(".sc_Bar").each(function(){
			        var node = jQuery(this);
			        var sc_key = node.data("sc_key");
			        setting.append(node, scheduleData[sc_key]);
			    });
			}*/
		};
		this.getScheduleData = function() {
			var data = new Array();

			for (var i in timelineData) {
				if (typeof timelineData[i] == "undefined") continue;
				var timeline = jQuery.extend(true, {}, timelineData[i]);
				timeline.schedule = new Array();
				data.push(timeline);
			}

			for (var i in scheduleData) {
				if (typeof scheduleData[i] == "undefined") continue;
				var schedule = jQuery.extend(true, {}, scheduleData[i]);
				schedule.start = this.formatTime(schedule.start);
				schedule.end = this.formatTime(schedule.end);
				var timelineIndex = schedule.timeline;
				delete schedule.timeline;
				data[timelineIndex].schedule.push(schedule);
			}

			return data;
		};
		// update Bar Text
		this.rewriteBarText = function(node, data) {
			var x = node.position().left;
			var w = node.width();
			var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
			//var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
			var end = start + (data["end"] - data["start"]);
			var html = element.formatTime(start) + "-" + element.formatTime(end);
			jQuery(node).find(".time").html(html);
		}
		this.resetBarPosition = function(n) {
			//
			var $bar_list = $element.find('.sc_main .timeline').eq(n).find(".sc_Bar");
			var codes = [];
			for (var i = 0; i < $bar_list.length; i++) {
				codes[i] = {
					code: i,
					x: jQuery($bar_list[i]).position().left
				};
			};
			//
			codes.sort(function(a, b) {
				if (a["x"] < b["x"]) {
					return -1;
				} else if (a["x"] > b["x"]) {
					return 1;
				}
				return 0;
			});
			var check = [];
			var h = 0;
			var $e1, $e2;
			var c1, c2;
			var s1, e1, s2, e2;
			for (var i = 0; i < codes.length; i++) {
				c1 = codes[i]["code"];
				$e1 = jQuery($bar_list[c1]);
				for (h = 0; h < check.length; h++) {
					var next = false;
					L: for (var j = 0; j < check[h].length; j++) {
						c2 = check[h][j];
						$e2 = jQuery($bar_list[c2]);

						s1 = $e1.position().left;
						e1 = $e1.position().left + $e1.width();
						s2 = $e2.position().left;
						e2 = $e2.position().left + $e2.width();
						if (s1 < e2 && e1 > s2) {
							next = true;
							continue L;
						}
					}
					if (!next) {
						break;
					}
				}
				if (!check[h]) {
					check[h] = [];
				}
				$e1.css({
					top: ((h * setting.timeLineY) + setting.timeLinePaddingTop)
				});
				check[h][check[h].length] = c1;
			}
			//
			this.resizeRow(n, check.length);
		};
		this.resizeRow = function(n, height) {
				//var h = Math.max(element.getScheduleCount(n),1);
				var h = Math.max(height, 1);
				$element.find('.sc_data .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);
				$element.find('.sc_main .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);

				$element.find('.sc_main .timeline').eq(n).find(".sc_bgBar").each(function() {
					jQuery(this).height(jQuery(this).closest(".timeline").height());
				});

				$element.find(".sc_data").height($element.find(".sc_main_box").height());
			}
			// resizeWindow
		this.resizeWindow = function() {
			var sc_width = $element.width();
			var sc_main_width = sc_width - setting.dataWidth - (setting.verticalScrollbar);
			var cell_num = Math.floor((tableEndTime - tableStartTime) / setting.widthTime);
			$element.find(".sc_header_cell").width(setting.dataWidth);
			$element.find(".sc_data,.sc_data_scroll").width(setting.dataWidth);
			$element.find(".sc_header").width(sc_main_width);
			$element.find(".sc_main_box").width(sc_main_width);
			$element.find(".sc_header_scroll").width(setting.widthTimeX * cell_num);
			$element.find(".sc_main_scroll").width(setting.widthTimeX * cell_num);
		};
		// init
		this.init = function() {
			var html = '';
			html += '<div class="sc_menu">' + "\n";
			html += '<div class="sc_header_cell"><span>&nbsp;</span></div>' + "\n";
			html += '<div class="sc_header">' + "\n";
			html += '<div class="sc_header_scroll">' + "\n";
			html += '</div>' + "\n";
			html += '</div>' + "\n";
			html += '<br class="clear" />' + "\n";
			html += '</div>' + "\n";
			html += '<div class="sc_wrapper">' + "\n";
			html += '<div class="sc_data">' + "\n";
			html += '<div class="sc_data_scroll">' + "\n";
			html += '</div>' + "\n";
			html += '</div>' + "\n";
			html += '<div class="sc_main_box">' + "\n";
			html += '<div class="sc_main_scroll">' + "\n";
			html += '<div class="sc_main">' + "\n";
			html += '</div>' + "\n";
			html += '</div>' + "\n";
			html += '</div>' + "\n";
			html += '<br class="clear" />' + "\n";
			html += '</div>' + "\n";
			html += '<div class="tooltip"></div>' + "\n";

			$element.append(html);

			$element.find(".sc_main_box").scroll(function() {
				$element.find(".sc_data_scroll").css("top", $(this).scrollTop() * -1);
				$element.find(".sc_header_scroll").css("left", $(this).scrollLeft() * -1);

			});
			// add time cell
			var cell_num = Math.floor((tableEndTime - tableStartTime) / setting.widthTime);
			var before_time = -1;
			for (var t = tableStartTime; t < tableEndTime; t += setting.widthTime) {

				if (
					(before_time < 0) ||
					(Math.floor(before_time / 3600) != Math.floor(t / 3600))) {
					var html = '';
					html += '<div class="sc_time">' + element.formatTime(t) + '</div>';
					var $time = jQuery(html);
					var cell_num = Math.floor(Number(Math.min((Math.ceil((t + setting.widthTime) / 3600) * 3600), tableEndTime) - t) / setting.widthTime);
					$time.width((cell_num * setting.widthTimeX) - setting.headTimeBorder);
					$element.find(".sc_header_scroll").append($time);

					before_time = t;
				}
			}

			jQuery(window).resize(function() {
				element.resizeWindow();
			}).trigger("resize");

			// addrow
			for (var i in setting.rows) {
				this.addRow(i, setting.rows[i]);
			}
		};
		//
		this.init();

		this.debug = function() {
			var html = '';
			for (var i in scheduleData) {
				html += '<div>';

				html += i + " : ";
				var d = scheduleData[i];
				for (var n in d) {
					var dd = d[n];
					html += n + " " + dd;
				}

				html += '</div>';
			}
			jQuery(setting.debug).html(html);
		};

		this.isCollison = function($div1, $div2) {
			var x1 = $div1.offset().left;
			var y1 = $div1.offset().top;
			var h1 = $div1.outerHeight(true);
			var w1 = $div1.outerWidth(true);
			var b1 = y1 + h1;
			var r1 = x1 + w1;
			var x2 = $div2.offset().left;
			var y2 = $div2.offset().top;
			var h2 = $div2.outerHeight(true);
			var w2 = $div2.outerWidth(true);
			var b2 = y2 + h2;
			var r2 = x2 + w2;

			if (b1 <= y2 || y1 >= b2 || r1 <= x2 || x1 >= r2) return false;
			return true;
		}

		if (setting.debug && setting.debug != "") {
			setInterval(function() {
				element.debug();
			}, 10);
		}

		return (this);
	};
})(jQuery);