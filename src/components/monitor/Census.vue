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
                            :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <div style="text-align: center">
                <div style="border-bottom: 1px solid #ccc; margin-bottom: 5px">
                    当前地图标签数量: {{ allCount }}
                </div>
                <div v-show="!!info" style="border-bottom: 1px solid #ccc;">
                    <span>{{ (info || {}).name }}标签数量: </span>
                    <span>
                        {{ (info || {}).true }}/{{ (info || {}).should }}
                    </span>
                </div>
                <div v-show="!info && this.value !== ''">
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
    @Prop() public readonly renderTags!: { [x: string]: number };

    public value: number | string = '';
    public allCount: number = 0; // 当前地图拥有的标签数
    public info: any = null;

    public created() {
        const tags = this.zones.map(v =>
            this.$http.get('/api/tag/getall', {
                currentPage: 1,
                pageSize: 1_0000_0000,
                zone: this.value
            })
        );

        this.allCount = Object.values(this.renderTags).filter(
            v => v >= 0
        ).length;
    }

    @Watch('renderTags', { deep: true })
    @Watch('value')
    public getInfo() {
        if (this.zones && this.renderTags) {
            this.allCount = Object.values(this.renderTags).filter(
                v => v >= 0
            ).length;

            const zone = this.zones.find(v => v.id === this.value);
            if (zone) {
                this.$http
                    .get('/api/tag/getall', {
                        currentPage: 1,
                        pageSize: 1_0000_0000,
                        zone: this.value
                    })
                    .then(res => {
                        const list = res.pagedData.datas.filter(
                            v =>
                                Reflect.has(this.renderTags, v.tagNo) &&
                                this.renderTags[v.tagNo] >= 0
                        );

                        this.info = {
                            name:
                                zone.name +
                                (zone.name.endsWith('区域') ? '' : '区域'),
                            true: list.length,
                            should: res.pagedData.datas.length
                        };
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


