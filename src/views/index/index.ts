import Vue from 'vue';
import Component from 'vue-class-component';
import echarts from 'echarts';
import { State } from 'vuex-class';

interface CardInfo {
    icon: string;
    title: string;
    num: number;
    to: string;
}

interface RecordItem {
    content: string;
    timestamp: string;
    type: string;
}

@Component
export default class Main extends Vue {
    @State public baseUrl?: string;

    public activeNames: string[] = ['1', '2'];
    public cards: CardInfo[] = [
        { icon: 'qy', title: '监控区域', num: 3, to: '' },
        { icon: 'adminbg', title: '管理人员', num: 3, to: '' },
        { icon: 'ter', title: '监控人员', num: 3, to: '' },
        { icon: 'bj', title: '报警次数', num: 3, to: '' },
        { icon: 'bj', title: '暂停功能', num: 3, to: '' },
        { icon: 'bj', title: '暂停功能', num: 3, to: '' }
    ];
    public records: RecordItem[] = [];

    public created() {
        this.getRecords();
    }
    public mounted() {
        this.createPie();
        this.createBar();
    }

    private getRecords() {
        for (let i = 0; i < 10; i++) {
            this.records.push({
                timestamp: '2018年5月3号 13：00',
                content: '监控区域1设备损坏，需要紧急检查维修',
                type: 'warning'
            });
        }
    }

    private eConsole(param: any, chart: echarts.ECharts, option: any) {
        if (typeof param.seriesIndex !== 'undefined') {
            if (param.type === 'click') {
                const len = option.legend.data.length;

                for (let i = 0; i < len; i++) {
                    if (param.seriesIndex === 0 && param.dataIndex === i) {
                        this.getOption(param.data.name, chart, option);
                    }
                }
            }
        }
    }

    private getOption(name: string, chart: echarts.ECharts, option: any) {
        fetch('/api/getPieInfo')
            .then((res: Response) => res.json())
            .then((res: any) => {
                this.forOption(name, res.data, option, chart);
            });
    }

    private forOption(
        name: string,
        msgData: any,
        option: any,
        chat: echarts.ECharts
    ) {
        msgData.trees.forEach((v: any) => {
            if (v.name === name) {
                option.series[1].data = v.list;
                chat.setOption(option);
            }
        });
    }

    private createPie() {
        const option: any = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['设备管理', '警报', '标签']
            },
            series: [
                {
                    name: '信息',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: { normal: { position: 'inner' } },
                    labelLine: { normal: { show: false } },
                    data: [
                        { value: 335, name: '设备管理', selected: true },
                        { value: 679, name: '警报' },
                        { value: 1548, name: '标签' }
                    ]
                },
                {
                    name: '信息来源',
                    type: 'pie',
                    radius: ['40%', '55%'],
                    label: {
                        normal: {
                            formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                            backgroundColor: '#eee',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            borderRadius: 4,
                            rich: {
                                a: { color: '#999', lineHeight: 22, align: 'center' },
                                hr: { borderColor: '#aaa', width: '100%', borderWidth: 0.5, height: 0 },
                                b: { fontSize: 16, lineHeight: 33 },
                                per: { color: '#eee', backgroundColor: '#334455', padding: [2, 4], borderRadius: 2 }
                            }
                        }
                    },
                    data: [
                        { value: 335, id: 1, name: '标签数量' },
                        { value: 310, id: 2, name: '标签' },
                        { value: 234, id: 3, name: '电子围栏' }
                    ]
                }
            ]
        };
        this.createChart(<HTMLDivElement>this.$refs.main).then(chart => {
            chart.setOption(option);
            chart.on('click', (e: any) => this.eConsole(e, chart, option));
        });
    }

    private createBar() {
        const weatherIcons: any = {
            Sunny: this.baseUrl + '/public/image/qy.png',
            Cloudy: this.baseUrl + '/public/image/ter.png',
            Showers: this.baseUrl + '/public/image/dzwl.png'
        };

        const seriesLabel: any = {
            normal: {
                show: true,
                textBorderColor: '#333',
                textBorderWidth: 2
            }
        };

        const option2: any = {
            title: { text: '区域信息' },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: { data: ['报警信息', '标签数量', '负责人数'] },
            grid: { left: 100 },
            toolbox: {
                show: true,
                feature: { saveAsImage: {} }
            },
            xAxis: {
                type: 'value', name: 'Days',
                axisLabel: { formatter: '{value}' }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: ['监控区域1', '监控区域2', '监控区域3'],
                axisLabel: {
                    formatter(value: any) {
                        return '{' + value + '| }\n{value|' + value + '}';
                    },
                    margin: 20,
                    rich: {
                        value: { lineHeight: 30, align: 'center' },
                        Sunny: {
                            height: 40, align: 'center',
                            backgroundColor: { image: weatherIcons.Sunny }
                        },
                        Cloudy: {
                            height: 40, align: 'center',
                            backgroundColor: { image: weatherIcons.Cloudy }
                        },
                        Showers: {
                            height: 40, align: 'center',
                            backgroundColor: { image: weatherIcons.Showers }
                        }
                    }
                }
            },
            series: [
                {
                    name: '报警信息',
                    type: 'bar',
                    data: [165, 170, 30],
                    label: seriesLabel,
                    markPoint: {
                        symbolSize: 1,
                        symbolOffset: [0, '50%'],
                        label: {
                            normal: {
                                formatter: '{a|{a}\n}{b|{b} }{c|{c}}',
                                backgroundColor: 'rgb(242,242,242)',
                                borderColor: '#aaa',
                                borderWidth: 1,
                                borderRadius: 4,
                                padding: [4, 10],
                                lineHeight: 26,
                                position: 'right',
                                distance: 20,
                                rich: {
                                    a: {
                                        align: 'center',
                                        color: '#fff',
                                        fontSize: 18,
                                        textShadowBlur: 2,
                                        textShadowColor: '#000',
                                        textShadowOffsetX: 0,
                                        textShadowOffsetY: 1,
                                        textBorderColor: '#333',
                                        textBorderWidth: 2
                                    },
                                    b: { color: '#333' },
                                    c: {
                                        color: '#ff8811',
                                        textBorderColor: '#000',
                                        textBorderWidth: 1,
                                        fontSize: 22
                                    }
                                }
                            }
                        }
                    }
                },
                { name: '标签数量', type: 'bar', label: seriesLabel, data: [150, 105, 110] },
                { name: '负责人数', type: 'bar', label: seriesLabel, data: [220, 82, 63] }
            ]
        };

        this.createChart(<HTMLDivElement>this.$refs.myChart2)
            .then(chart => chart.setOption(option2));
    }

    private createChart(dom: HTMLDivElement): Promise<echarts.ECharts> {
        const creator = (resolve: (value?: echarts.ECharts) => void) => {
            if (dom.offsetWidth && dom.offsetHeight) {
                resolve(echarts.init(dom));
            } else {
                requestAnimationFrame(() => creator(resolve));
            }
        };

        return new Promise(creator);
    }
}
