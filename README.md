# chartjs-plugin-downsample

Plugin for downsampling data in Chart.js, based off of [sveinn-steinarsson/flot-downsample](https://github.com/sveinn-steinarsson/flot-downsample).

[![NPM](https://nodei.co/npm/chartjs-plugin-downsample.png)](https://npmjs.org/package/chartjs-plugin-downsample)

## Samples

* [Basic usage](https://albinodrought.github.io/chartjs-plugin-downsample/samples/data.html)

* [Dynamic datasets](https://albinodrought.github.io/chartjs-plugin-downsample/samples/many-datasets.html)

* [Pan and zoom](https://albinodrought.github.io/chartjs-plugin-downsample/samples/panzoom.html)

* [Selective downsampling](https://albinodrought.github.io/chartjs-plugin-downsample/samples/target-datasets.html)

## Configuration

The configuration for this plugin lives in chartInstance.options.downsample. This looks like the following while setting up your chart:

```js
{
    options: {
        downsample: {
            enabled: true,
            threshold: 500 // max number of points to display per dataset
        }
    }
}
```

### Additional Options

| Option                | Default   | Description                                                                                                                                      |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| auto                  | true      | If true, downsamples data automatically every update. Otherwise, chart will have to be manually downsampled with `.downsample()`                 |
| onInit                | true      | If true, downsamples data when the chart is initialized.                                                                                         |
| restoreOriginalData   | true      | If true, replaces the downsampled data with the original data after each update. This is, mainly, for compatibility with other plugins.          |
| preferOriginalData    | false     | If true, downsamples original data instead of data. This option can clash with dynamically-added data. If false, data cannot be "un-downscaled". |
| targetDatasets        | []        | An array of dataset IDs that you want to downsample. If empty or not set, downsamples all datasets.                                              |

## Methods

| Method                                           | Description                                                                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| chartInstance.downsample(*var threshold = null*) | Manually downsamples the data on the given chart. If a threshold is passed, updates the threshold in the chart config to the given value. |

## Optimal Performance

This plugin was created because of performance issues while loading lots of data in a chart with [pan/zoom capabilites](https://github.com/chartjs/chartjs-plugin-zoom/).

If options are not changed from their defaults, data will be downsampled every time the user pans or zooms - this is probably not what you want. For a more performant configuration, try this:

```js
{
    options: {
        downsample: {
            enabled: true,
            threshold: <YOUR THRESHOLD HERE>, // change this

            auto: false, // don't re-downsample the data every move
            onInit: true, // but do resample it when we init the chart (this is default)

            preferOriginalData: true, // use our original data when downscaling so we can downscale less, if we need to.
            restoreOriginalData: false, // if auto is false and this is true, original data will be restored on pan/zoom - that isn't what we want.
        }
    }
}
```

## License

chartjs-plugin-downsample is released under the terms of [the MIT License](http://www.opensource.org/licenses/MIT).
