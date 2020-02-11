<template>
    <div @click.stop>
        <el-card :class="$style.box">
            <div slot="header">
                <span>标签统计</span>
                <el-button
                    style="float: right; padding: 3px 0"
                    type="text"
                    icon="el-icon-close"
                    @click="$emit('close')"
                ></el-button>
            </div>
            <el-form style="margin: 0 auto 30px;">
                <el-form-item label="选择区域">
                    <el-select v-model="value" filterable>
                        <el-option
                            v-for="item in zones"
                            :key="item.id"
                            :label="item.name"
                            :value="item.groupId1"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <div style="text-align: center">
                <div style="border-bottom: 1px solid #ccc; margin-bottom: 5px">
                    当前地图标签数量: {{ allCount }}
                </div>
                <div v-show="!!info" style="margin-top: 10px">
                    <span>{{ (info || {}).name }}标签数量: </span>
                    <span>
                        {{ (info || {}).true }}
                        <!-- /{{ (info || {}).should }} -->
                    </span>
                </div>
                <div v-show="!info && value !== ''">
                    {{ JSON.stringify(info || { a: 1 }) }} {{ value }}
                    <i class="el-icon-loading" style="font-size: 24px"></i>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

@Component
export default class Census extends Vue {
    @Prop() public readonly zones!: IZone[];
    @Prop() public readonly censusTags!: Map<string, Set<string>>;
    @Prop() public readonly censusChange!: number;

    public value: string = '';
    public info: any = null;

    // 当前地图拥有的标签数
    public get allCount() {
        if (!this.censusTags) {
            return 0;
        }

        return Array.from(this.censusTags.values()).flatMap(v => Array.from(v))
            .length;
    }

    @Watch('censusChange')
    @Watch('value')
    public getInfo() {
        if (this.zones && this.censusTags) {
            const zone = this.zones.find(v => v.groupId1 === this.value);
            if (zone) {
                // this.$http
                //     .get('/api/tag/getall', {
                //         currentPage: 1,
                //         pageSize: 1_0000_0000,
                //         zone: zone.id
                //     })
                //     .then(res => {
                //         const list = (<ITag[]>res.pagedData.datas).filter(v =>
                //             (this.censusTags.get(this.value) || new Set()).has(
                //                 v.id
                //             )
                //         );

                //         this.info = {
                //             name:
                //                 zone.name +
                //                 (zone.name.endsWith('区域') ? '' : '区域'),
                //             true: list.length,
                //             should: res.pagedData.datas.length
                //         };
                //     });

                return (this.info = {
                    name: `${zone.name}${
                        zone.name.endsWith('区域') ? '' : '区域'
                    }`,
                    true: (this.censusTags.get(this.value) || new Set()).size
                });
            }

            this.info = null;
        }
    }
}
</script>

<style lang="postcss" module>
.box {
    width: 50%;
    min-height: 255px;
    position: absolute;
    right: 0;
    bottom: 0;
}
</style>


