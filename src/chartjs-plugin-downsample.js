var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

var helpers = Chart.helpers;

var defaultOptions = {
    enabled: false,

    // max number of points to display per dataset
    threshold: 1000,

    // if true, downsamples data automatically every update
    auto: true,
    // if true, downsamples data when the chart is initialized
    onInit: true,

    // if true, replaces the downsampled data with the original data after each update
    restoreOriginalData: true,
    // if true, downsamples original data instead of data
    preferOriginalData: false,

    //if not undefined and not empty, indicates the ids of the datasets to downsample
    targetDatasets: [],

};

var floor = Math.floor,
    abs = Math.abs;

function downsample(data, threshold) {
    // this function is from flot-downsample (MIT), with modifications

    var dataLength = data.length;
    if (threshold >= dataLength || threshold <= 0) {
        return data; // nothing to do
    }

    var sampled = [],
        sampledIndex = 0;

    // bucket size, leave room for start and end data points
    var every = (dataLength - 2) / (threshold - 2);

    var a = 0,  // initially a is the first point in the triangle
        maxAreaPoint,
        maxArea,
        area,
        nextA;

    // always add the first point
    sampled[sampledIndex++] = data[a];

    for (var i = 0; i < threshold - 2; i++) {
        // Calculate point average for next bucket (containing c)
        var avgX = 0,
            avgY = 0,
            avgRangeStart = floor(( i + 1 ) * every) + 1,
            avgRangeEnd = floor(( i + 2 ) * every) + 1;
        avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

        var avgRangeLength = avgRangeEnd - avgRangeStart;

        for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
            avgX += data[avgRangeStart].x * 1; // * 1 enforces Number (value may be Date)
            avgY += data[avgRangeStart].y * 1;
        }
        avgX /= avgRangeLength;
        avgY /= avgRangeLength;

        // Get the range for this bucket
        var rangeOffs = floor((i + 0) * every) + 1,
            rangeTo = floor((i + 1) * every) + 1;

        // Point a
        var pointAX = data[a].x * 1, // enforce Number (value may be Date)
            pointAY = data[a].y * 1;

        maxArea = area = -1;

        for (; rangeOffs < rangeTo; rangeOffs++) {
            // Calculate triangle area over three buckets
            area = abs(( pointAX - avgX ) * ( data[rangeOffs].y - pointAY ) -
                    ( pointAX - data[rangeOffs].x ) * ( avgY - pointAY )
                ) * 0.5;
            if (area > maxArea) {
                maxArea = area;
                maxAreaPoint = data[rangeOffs];
                nextA = rangeOffs; // Next a is this b
            }
        }

        sampled[sampledIndex++] = maxAreaPoint; // Pick this point from the bucket
        a = nextA; // This a is the next a (chosen b)
    }

    sampled[sampledIndex] = data[dataLength - 1]; // Always add last

    return sampled;
}

function getOptions(chartInstance) {
    return chartInstance.options.downsample;
}

function getFilteredDatasets(chartInstance){
    var targetDatasets = getOptions(chartInstance).targetDatasets;
    var datasets = chartInstance.data.datasets;

    if (targetDatasets.length === 0) {
        return datasets;
    }

    var targetDatasetsMap = {};
    for (var i = 0; i < targetDatasets.length; i++) {
        var targetDataset = targetDatasets[i];
        targetDatasetsMap[targetDataset] = true;
    }

    var filteredDatasets = [];
    for (var i = 0; i < datasets.length; i++) {
        var dataset = datasets[i];

        if (targetDatasetsMap[dataset.id]) {
            filteredDatasets.push(dataset);
        }
    }

    return filteredDatasets;
}

function downsampleChart(chartInstance) {
    var options = getOptions(chartInstance),
        threshold = options.threshold;
    if(!options.enabled) return;

    var datasets = getFilteredDatasets(chartInstance);
    for(var i = 0; i < datasets.length; i++) {
        var dataset = datasets[i];

        var dataToDownsample = null;
        if(options.preferOriginalData) {
            dataToDownsample = dataset.originalData;
        }
        dataToDownsample = dataToDownsample || dataset.data;

        dataset.originalData = dataToDownsample;
        dataset.data = downsample(dataToDownsample, threshold);
    }
}

var downsamplePlugin = {
    beforeInit: function (chartInstance) {
        var options = chartInstance.options.downsample = helpers.extend({}, defaultOptions, chartInstance.options.downsample || {});

        if(options.onInit) {
            downsampleChart(chartInstance);
        }

        // allow manual downsample-triggering with chartInstance.downsample();
        chartInstance.downsample = function(threshold) {
            if(typeof(threshold) !== 'undefined') {
                chartInstance.options.downsample.threshold = threshold;
            }

            downsampleChart(chartInstance);
        }
    },

    beforeDatasetsUpdate: function(chartInstance) {
        if(chartInstance.options.downsample.auto) {
            downsampleChart(chartInstance);
        }
    },

    afterDatasetsUpdate: function(chartInstance) {
        var options = getOptions(chartInstance);
        if(!options.enabled || !options.restoreOriginalData) return;

        var datasets = getFilteredDatasets(chartInstance);
        for(var i = 0; i < datasets.length; i++) {
            var dataset = datasets[i];

            dataset.data = dataset.originalData || dataset.data;
            dataset.originalData = null;
        }
    }
};

module.exports = downsamplePlugin;
Chart.pluginService.register(downsamplePlugin);