define([
    "i18n",
    "text!templates/admin/statistics.html",
    "jqplot"
], function(i18n, template, jqplot) {
    console.log('views/admin/statistics.js');
    var View = Backbone.View.extend({
        dataStats: {},
        initialize: function(options) {
            // Templates
            this.templates = _.parseTemplate(template);
        },
        destroy: function() {
            for (var v in this.view) {
                if (this.view[v]) this.view[v].destroy();
            }
            this.remove();
        },
        render: function() {
            var self = this;
            var tpl = _.template(this.templates['main-tpl']);
            var data = {
                i18n: i18n
            };
            this.$el.html(tpl(data));
            $.parser.parse(this.$el);

            // Menu events
            // this.$Menu = $('#statistics-menu');
            // this.$Menu.menu({
            //     onClick: function(item) {
            //         switch (item.name) {
            //             case "graph":
            //                 self.getGraph();
            //                 break;
            //         }
            //     }
            // });

            // Event handlers
            this.$FromDate = this.$(".date-from");
            this.$FromDate.datebox({
                value: app.now().format("DD.MM.YYYY"),
                delay: 0,
                onChange: function(date) {
                    var valid = moment(date, "DD.MM.YYYY", true).isValid();
                    if (!date || valid) self.doSearch();
                }
            });
            this.$ToDate = this.$(".date-to");
            this.$ToDate.datebox({
                value: app.now().add(1, 'days').format("DD.MM.YYYY"),
                delay: 0,
                onChange: function(date) {
                    var valid = moment(date, "DD.MM.YYYY", true).isValid();
                    if (!date || valid) self.doSearch();
                }
            });
            
            this.$Grid = this.$("#container");
            this.$Grid.datagrid({
                columns: [
                    [{
                        field: 'date',
                        title: i18n.t('admin.statistics.date'),
                        width: 100,
                        formatter: this.formatDate.bind(this),
                    },
                    {
                        field: 'planned',
                        title: i18n.t('admin.statistics.status.1'),
                        width: 100
                    },
                    {
                        field: 'accepted',
                        title: i18n.t('admin.statistics.status.2'),
                        width: 100
                    },
                    {
                        field: 'interrupted',
                        title: i18n.t('admin.statistics.status.3'),
                        width: 100
                    },
                    {
                        field: 'skipped',
                        title: i18n.t('admin.statistics.status.4'),
                        width: 100
                    },
                    {
                        field: 'total',
                        title: i18n.t('admin.statistics.total'),
                        width: 100
                    }
                    ]
                ],
                remoteSort: false,
                pagination: true,
                pageNumber: 1,
                pageSize: 50,
                pageList: [10, 50, 100, 250, 500, 1000, 10000],
                rownumbers: true,
                ctrlSelect: true,
                url: 'admin/statistics',
                method: 'get',
                queryParams: {
                    from: app.now().startOf('day').toJSON(),
                    to: app.now().startOf('day').add(1, 'days').toJSON()
                },
                loadFilter: function(data) {
                    data = data || [];
                    self.dataStats = data;
                    self.getGraph();
                    return data;
                }
            });
            
            this.$Graph = this.$('#container');
            this.$Graph.panel({
                noheader: true
            });
        },
        renderGraph: function() {
            var stats = this.getExamsStats();
            var plannedSeries = stats.planned;
            var acceptedSeries = stats.accepted;
            var interruptedSeries = stats.interrupted;
            var skippedSeries = stats.skipped;
            var axisDates = stats.date;
            var grid = {
                gridLineWidth: 1.5,
                gridLineColor: 'rgb(235,235,235)',
                drawGridlines: true
            };
            var plot = $.jqplot('chart', [plannedSeries, acceptedSeries, interruptedSeries, skippedSeries], {
                seriesColors:['#CBFFFF', '#AEFFAE', '#DFA1DF', '#CFCFCF'],
                stackSeries: true,
                seriesDefaults:{
                    renderer: $.jqplot.BarRenderer,
                    rendererOptions: {
                        varyBarColor: true,
                        barMargin: 0,
                        barPadding: 0
                    },
                    pointLabels: {
                        show: true,
                        // labels: ['Запланировано', 'Принято', 'Прервано', 'Пропущено'],
                        hideZeros: true,
                        formatString: "%d"
                    }
                },
                axes: {
                  xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                    ticks: axisDates,
                    tickOptions: {
                        angle: -30
                    }
                  },
                  yaxis: {
                    tickOptions: {
                        formatString: '%d' 
                    },
                    min: 0,  
                    tickInterval: 1
                  }
                },
                legend: {
                    show: false,
                    location: 'e',
                    placement: 'outside'
                },
                grid:grid,
                canvasOverlay: {
                    show: true,
                    objects: [
                        {horizontalLine: {
                            name: 'avergae',
                            y: 10,
                            lineWidth: 2,
                            color: 'black',
                            shadow: false
                        }}
                    ]
                }
            });
            return plot;
        },
        getDates: function() {
            var fromVal = this.$FromDate.datebox('getValue');
            var toVal = this.$ToDate.datebox('getValue');
            var fromDate = fromVal ? moment(fromVal, 'DD.MM.YYYY').toJSON() : null;
            var toDate = toVal ? moment(toVal, 'DD.MM.YYYY').toJSON() : null;
            return {
                from: fromDate,
                to: toDate
            };
        },
        formatDate: function(val, row) {
            if (!val) return;
            var dates = this.getDates();
            return moment(dates.from).add(val-1, 'days').format('DD.MM.YYYY');
        },
        getExamsStats: function() {
            var dataRows = this.dataStats.rows;
            var dates = this.getDates();
            var examsDate = [];
            var examsPlanned = [];
            var examsAccepted = [];
            var examsInterrupted = [];
            var examsSkipped =[];
            for (var i = 0; i < dataRows.length; i++) {
                examsDate[i] =  moment(dates.from).add(dataRows[i].date-1, 'days').format('DD.MM.YYYY');
                examsPlanned[i] = dataRows[i].planned;
                examsAccepted[i] = dataRows[i].accepted;
                examsInterrupted[i] = dataRows[i].interrupted;
                examsSkipped[i] = dataRows[i].skipped;
            }
            return {
                date: examsDate,
                planned: examsPlanned,
                accepted: examsAccepted,
                interrupted: examsInterrupted,
                skipped: examsSkipped
            };
        },
        doSearch: function() {
            var dates = this.getDates();
            this.$Grid.datagrid('load', {
                from: dates.from,
                to: dates.to
            });
        },
        getGraph: function() {
            var plot = this.renderGraph(); 
            if (plot) {
                plot.destroy();
            }
            //this.renderGraph().destroy();
            return this.renderGraph();
        }
    });
    return View;
});