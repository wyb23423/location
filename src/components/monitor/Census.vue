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
            <el-form style="margin: 0 auto 44px; width: 50%">
                <el-form-item label="选择区域">
                    <el-select v-model="value" filterable @change="census">
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

    public value: string = '';
    public info: any = null;

    public census(id: number) {
        const zone = this.zones.find(v => v.id === id);

        if (zone) {
            const list = Object.values(this.tags).filter(v => +v.zone === id);
            this.info = {
                name: zone.name + (zone.name.endsWith('区域') ? '' : '区域'),
                count: list.length
            };
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


