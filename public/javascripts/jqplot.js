define([
      '../bower_components/jqplot/jquery.jqplot'
    ],
    function () {
        var plot;
        require([
            '../bower_components/jqplot/plugins/jqplot.barRenderer',
            '../bower_components/jqplot/plugins/jqplot.logAxisRenderer',
            '../bower_components/jqplot/plugins/jqplot.canvasAxisLabelRenderer',
            '../bower_components/jqplot/plugins/jqplot.categoryAxisRenderer',
            '../bower_components/jqplot/plugins/jqplot.dateAxisRenderer',
            '../bower_components/jqplot/plugins/jqplot.canvasAxisTickRenderer',
            '../bower_components/jqplot/plugins/jqplot.canvasTextRenderer',
            '../bower_components/jqplot/plugins/jqplot.pointLabels',
            '../bower_components/jqplot/plugins/jqplot.enhancedLegendRenderer'
            ],
        function () {
            plot = $.jqplot;
        });
        return plot;
    });