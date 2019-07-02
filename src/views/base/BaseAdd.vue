<template src="./add.html"></template>

<script lang="ts">
/// <reference path="../../types/fengmap.d.ts" />

import Component, { mixins } from 'vue-class-component';
import MapMixin from '../../mixins/map';
import Select from '../../components/Select.vue';
import IpInput from '../../components/IpInput.vue';
import { ElForm } from 'element-ui/types/form';
import TableMixin from '../../mixins/table';
import { incrementalFactory } from '../../assets/utils/util';

const ICON_NAME = 'origin';

@Component({
    components: {
        'app-select': Select,
        'ip-input': IpInput
    }
})
export default class BaseAdd extends mixins(MapMixin, TableMixin) {
    public progress: number = 1;

    public coord: Vector3 | null = null;
    public bases: any[] = [];

    public form: any = {
        main: 0,
        zone: null,
        ip: []
    };
    public rules: any = {};

    public colCfg: any[] = [
        { prop: 'name', label: '基站名称', width: 140 },
        { prop: 'coordx', label: '相对原点x坐标', width: 160 },
        { prop: 'coordy', label: '相对原点y坐标', width: 160 }
    ];

    private getNum = incrementalFactory();

    public created() {
        [
            'coordx',
            'coordy',
            'coordz',
            'algorithmType',
            'groupBaseSize',
            'minBaseSize',
            'groupCode'
        ].forEach((k: string) => {
            this.rules[k] = { type: 'number', tigger: 'change' };
        });
    }

    // 下一步
    public async next() {
        if (this.progress === 0 && !this.coord) {
            try {
                await this.$confirm('未选择原点, 是否使用默认的地图原点?');
            } catch (e) {
                return;
            }
        }

        this.dispose();
        this.progress++;

        if (this.progress >= 2) {
            this.getData(1, 10);
        }
    }

    // 添加基站
    // 检测表单并暂存基站数据
    public add() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (this.form.ip.length !== 4) {
                return this.$message.warning('基站ip格式错误');
            }

            if (valid) {
                this.bases.push({ ...this.form, flag: this.getNum() });
                this.form = {
                    main: 0,
                    zone: null,
                    ip: []
                };
                this.$notify.success('添加成功');

                form.resetFields();
            }
        });
    }

    public del(row: any) {
        const index = this.bases.findIndex(v => v.flag === row.flag);

        if (index > -1) {
            this.$confirm('确认删除该条数据?', '确认')
                .then(() => {
                    this.bases.splice(index, 1);
                    this.getData(1, this.pageSize);
                })
                .catch(console.error);
        } else {
            this.$message.error('数据不存在!');
        }
    }

    public submit() {
        this.$confirm('提交分组?')
            .then(() => {
                const orign = this.coord || { x: 0, y: 0, z: 0 };

                const arr = this.bases.map(v => {
                    const data: IBaseStation = {
                        ...v,
                        ip: v.ip.join('.'),
                        alarm: 0,
                        work: true,
                        coordx: orign.x + v.coordx,
                        coordy: orign.y + v.coordy,
                        createTime: null,
                        createUser: null,
                        description: null,
                        installTime: null,
                        location: null,
                        loseRate: '0',
                        owner: null,
                        updateTime: null,
                        updateUser: 'string',
                        uploadType: '1',
                        groupCode: v.groupCode + ''
                    };

                    delete data.flag;

                    return this.$http.post('/api/base/addBase', data, {
                        'Content-Type': 'application/json'
                    });
                });

                return Promise.all(arr);
            })
            .then(() => {
                this.$message.success('添加成功');
                location.href = location.href;
            })
            .catch(console.log);
    }

    // 绑定地图点击事件
    protected bindEvents() {
        this.mgr!.on('mapClickNode', (event: FMMapClickEvent) => {
            if (event.nodeType === fengmap.FMNodeType.IMAGE_MARKER) {
                return;
            }

            this.$confirm('你是否在进行原点选取?')
                .then(() => {
                    if (this.coord) {
                        return this.$confirm(
                            '你已经选取点，是否更换原点?',
                            '确认'
                        );
                    }

                    return 'confirm';
                })
                .then(() => {
                    const eventInfo = event.eventInfo.coord;
                    this.addOrigin(eventInfo.x, eventInfo.y);
                })
                .catch(console.log);
        });
    }

    // 获取表格数据
    protected fetch(page: number, pageSize: number) {
        return Promise.resolve({
            count: this.bases.length,
            data: this.bases.slice((page - 1) * pageSize, page * pageSize)
        });
    }

    private addOrigin(x: number, y: number) {
        if (this.mgr) {
            this.mgr.remove(ICON_NAME);
            this.coord = this.mgr.getCoordinate(
                this.mgr.addImage(
                    {
                        x,
                        y,
                        url: '/images/query_function_location.png',
                        size: 32,
                        height: 2
                    },
                    ICON_NAME
                )
            );
        }
    }
}
</script>


<style lang="postcss" module>
.tool-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 60px;
    width: 100%;
    padding-left: 20%;
    padding-right: 20%;
}
.sel {
    position: absolute;
    top: 60px;
    left: 0;
}
.tool {
    position: absolute;
    top: 65px;
    right: 0;
}

.btn {
    text-align: center;

    & button {
        width: 50%;
    }
}

.back {
    margin-bottom: 30px;

    &:hover {
        color: #6cf;
    }
}
</style>

