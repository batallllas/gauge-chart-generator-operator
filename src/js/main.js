/*
 * gauge-chart-generator
 * https://github.com/mognom/gauge-chart-generator-operator
 *
 * Copyright (c) 2018 CoNWeT
 * Licensed under the MIT license.
 */

(function () {

    "use strict";

    var value;
    var max, min;
    var init = function init() {
        MashupPlatform.wiring.registerCallback("value", function (newValue) {
            value = getValue(newValue);
            createGaugeChart(value);
        });
        MashupPlatform.wiring.registerCallback("newMax", function (newMax) {
            max = getValue(newMax);
            createGaugeChart(value);
        });

        MashupPlatform.wiring.registerCallback("newMin", function (newMin) {
            min = getValue(newMin);
            createGaugeChart(value);
        });
    };

    MashupPlatform.prefs.registerCallback(function (new_preferences) {
        createGaugeChart(value);
    }.bind(this));

    var getValue = function getValue(value) {
        var result = value;
        if (isNaN(value)) {
            // If its not a number or "string" number -> it must be an object
            if (typeof value === "string") {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    throw new MashupPlatform.wiring.EndpointTypeError("Data has no valid value");
                }
            }
            if ("value" in value) {
                // Get the value key and use it
                result = value.value;
            } else if (Object.keys(value).length == 1) {
                result = value[Object.keys(value)[0]];
            }  else {
                throw new MashupPlatform.wiring.EndpointTypeError("Data has no valid value");
            }

        } else {
            if (typeof value === "string") {
                result = Number(value);
            }
        }

        return result;
    };

    var createGaugeChart = function createGaugeChart(data) {
        var minVal = min | MashupPlatform.prefs.get('min');
        var maxVal = max | MashupPlatform.prefs.get('max');

        var decimalFormat = "";
        // Check if value has decimal part
        if (Number(value) % 1 !== 0) {
            decimalFormat = ":.1f";
        }


        // make sure max and min are not equal
        if (maxVal === minVal) {
            maxVal++;
        }

        var options = {
            chart: {
                type: 'solidgauge'
            },

            title: {
                text: MashupPlatform.prefs.get('title')
            },

            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },

            tooltip: {
                enabled: false
            },

            // the value axis
            yAxis: {
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.9, '#DF5353'] // red
                ],

                min: minVal,
                max: maxVal,
                tickPositions: [minVal, maxVal], // This makes sure max and min are not "rounded" and that min is always shown
                lineWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: {
                    y: 16
                }
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            },

            series: [{
                data: [Number(value)],
                dataLabels: {
                    format: "<div style='text-align:center'><span style='font-size:25px;color:black'>{y" + decimalFormat + "}</span><br/>" +
                            "<span style='font-size:12px;color:silver'>" + MashupPlatform.prefs.get("units") + "</span></div>"
                },
                tooltip: {
                    valueSuffix: " " + MashupPlatform.prefs.get("units")
                }
            }]
        };

        // Push the highcharts options
        MashupPlatform.wiring.pushEvent("chart-options", options);
    };

    init();

})();
