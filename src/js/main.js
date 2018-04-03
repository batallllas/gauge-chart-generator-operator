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
    var init = function init() {
        MashupPlatform.wiring.registerCallback("value", function (newValue) {
            value = getValue(newValue);
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

                min: MashupPlatform.prefs.get('min'),
                max: MashupPlatform.prefs.get('max'),

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
                tooltip: {
                    valueSuffix: ' km/h'
                },
                dataLabels: {
                    format: "<div style='text-align:center'><span style='font-size:25px;color:black'>{y:.1f}</span><br/>"
                }
            }]
        };

        // Push the highcharts options
        MashupPlatform.wiring.pushEvent("chart-options", options);
    };

    init();

})();
