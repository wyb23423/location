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
            <el-form style="margin: 0 auto 44px;">
                <el-form-item label="选择区域">
                    <el-select v-model="value" filterable>
                        <el-option label="当前地图" :value="-1"></el-option>
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

            <div
                v-if="!!info"
                style="border-bottom: 1px solid #ccc; text-align: center"
            >
                {{ info.name }}标签数量: {{ info.count }}
            </div>
        </el-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component
export default class Census extends Vue {
    @Prop() public tags!: { [x: string]: ITag };
    @Prop() public zones!: IZone[];
    @Prop() public renderTags!: { [x: string]: number };

    public value: number = -1;

    public get info() {
        if (this.tags && this.zones && this.renderTags) {
            const tagsArr = Object.keys(this.renderTags);
            if (this.value === -1) {
                return {
                    name: '当前地图',
                    count: tagsArr.length
                };
            } else {
                const zone = this.zones.find(v => v.id === this.value);

                if (zone) {
                    const list = tagsArr.filter(
                        k => +this.tags[k].zone === this.value
                    );
                    return {
                        name:
                            zone.name +
                            (zone.name.endsWith('区域') ? '' : '区域'),
                        count: list.length
                    };
                }
            }
        }

        return null;
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


