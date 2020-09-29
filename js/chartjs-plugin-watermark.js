/* chartjs-plugin-watermark | AlbinoDrought | MIT License | https://github.com/AlbinoDrought/chartjs-plugin-watermark/blob/master/LICENSE */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/**
 * Chart.js Simple Watermark plugin
 *
 * Valid options:
 *
 * options: {
 *      watermark: {
 *          // required
 *          image: new Image(),
 *
 *          x: 0,
 *          y: 0,
 *
 *          width: 0,
 *          height: 0,
 *
 *          alignX: "left"/"right",
 *          alignY: "top"/"bottom",
 *
 *          position: "front"/"back",
 *
 *          opacity: 0 to 1, // uses ctx.globalAlpha
 *      }
 * }
 *
 * Created by Sean on 12/19/2016.
 */

// https://github.com/chartjs/chartjs-plugin-zoom/blob/14590e77b58b10d65d25c4241bb71bd26a5383dd/src/chart.zoom.js#L9
// register as window global if used in browser
var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

var watermarkPlugin = {

    defaultOptions: {
        x: 0,
        y: 0,

        height: false,
        width: false,

        alignX: "top",
        alignY: "left",
        alignToChartArea: false,

        position: "front",

        opacity: 1,

        image: false,
    },

    isPercentage: function (value) {
        return typeof(value) == "string" && value.charAt(value.length - 1) == "%";
    },

    calcPercentage: function (percentage, max) {
        var value = percentage.substr(0, percentage.length - 1);
        value = parseFloat(value);

        return max * (value / 100);
    },

    autoPercentage: function (value, maxIfPercentage) {
        if (this.isPercentage(value)) {
            value = this.calcPercentage(value, maxIfPercentage);
        }

        return value;
    },

    imageFromString: function (imageSrc) {
        // create the image object with this as our src
        var imageObj = new Image();
        imageObj.src = imageSrc;

        return imageObj;
    },

    drawWatermark: function (chartInstance, position) {
        var watermark = chartInstance.watermark;

        // only draw watermarks meant for us
        if (watermark.position != position) return;

        if (watermark.image) {
            var image = watermark.image;

            var context = chartInstance.chart.ctx;
            var canvas = context.canvas;

            var cHeight, cWidth;
            var offsetX = 0, offsetY = 0;

            if(watermark.alignToChartArea) {
                var chartArea = chartInstance.chartArea;

                cHeight = chartArea.bottom - chartArea.top;
                cWidth = chartArea.right - chartArea.left;

                offsetX = chartArea.left;
                offsetY = chartArea.top;
            } else {
                cHeight = canvas.clientHeight || canvas.height;
                cWidth = canvas.clientWidth || canvas.width;
            }

            var height = watermark.height || image.height;
            height = this.autoPercentage(height, cHeight);

            var width = watermark.width || image.width;
            width = this.autoPercentage(width, cWidth);

            var x = this.autoPercentage(watermark.x, cWidth);
            var y = this.autoPercentage(watermark.y, cHeight);

            switch (watermark.alignX) {
                case "right":
                    x = cWidth - x - width;
                    break;
                case "middle":
                    x = (cWidth / 2) - (width / 2) - x;
                    break;
            }

            switch (watermark.alignY) {
                case "bottom":
                    y = cHeight - y - height;
                    break;
                case "middle":
                    y = (cHeight / 2) - (height / 2) - y;
                    break;
            }

            // avoid unnecessary calls to context save/restore, just manually restore the single value we change
            var oldAlpha = context.globalAlpha;
            context.globalAlpha = watermark.opacity;

            context.drawImage(image, offsetX + x, offsetY + y, width, height);

            context.globalAlpha = oldAlpha;
        }
    },

    beforeInit: function (chartInstance) {
        chartInstance.watermark = {};

        var helpers = Chart.helpers,
            options = chartInstance.options;

        if (options.watermark) {
            var clonedDefaultOptions = helpers.clone(this.defaultOptions),
                watermark = helpers.extend(clonedDefaultOptions, options.watermark);

            if (watermark.image) {
                var image = watermark.image;

                if (typeof(image) == "string") {
                    image = this.imageFromString(image);
                }

                // automatically refresh the chart once the image has loaded (if necessary)
                image.onload = function () {
                    chartInstance.update();
                };

                watermark.image = image;
            }

            chartInstance.watermark = watermark;
        }
    },

    // draw the image behind most chart elements
    beforeDraw: function (chartInstance) {
        this.drawWatermark(chartInstance, "back");
    },
    // draw the image in front of most chart elements
    afterDraw: function (chartInstance) {
        this.drawWatermark(chartInstance, "front");
    },
};

module.exports = watermarkPlugin;
Chart.pluginService.register(watermarkPlugin);

},{"chart.js":1}]},{},[2]);
