<template>
    <div class="map-box">
        <div ref="map" class="fill-box"></div>
        <div
            class="map-tool-bar flex-center"
            style="justify-content: flex-start"
        >
            <map-select
                style="margin-left: 50px"
                @selectmap="selectMap"
            ></map-select>
        </div>

        <el-collapse v-model="activeNames" :class="$style.op">
            <el-collapse-item name="config" title="基站配置">
                <config-primary
                    style="padding-right: 0"
                    label-width="auto"
                    @submit="onSubmit"
                >
                    <el-form-item label="所属分组">
                        <el-select v-model="group">
                            <el-option
                                v-for="v of groups"
                                :key="v"
                                :value="v"
                                :label="v"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="主基站ID">
                        <el-select v-model="main">
                            <el-option
                                v-for="v of selectedBases"
                                :key="v"
                                :value="v"
                                :label="v"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                </config-primary>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script lang="ts">
import MapMixin from '@/mixins/map';
import Component from 'vue-class-component';
import { getCustomInfo } from '@/assets/map/common';
import { BASE_ERROR_IMG } from '@/constant';
import Primary, { PrimaryConfig } from '@/components/base/Primary.vue';
import { Async } from '@/assets/utils/await';
import { SET_BASE_PROP } from '@/constant/request';

@Component({
    components: {
        'config-primary': Primary
    }
})
export default class Batch extends MapMixin {
    public activeNames = ['config'];
    public selectedBases: string[] = []; // 选中的基站
    public main = '';
    public group = '';

    private ipMap = new Map<string, string>();

    @Async()
    public async onSubmit(data: PrimaryConfig, protocol: string) {
        if (!this.group) {
            return this.$message.error('分组不能为空');
        }

        if (!this.main) {
            return this.$message.error('主基站不能为空');
        }

        const item = '[\\da-fA-F]';
        const pattern = new RegExp(`^(${item}{4})${item}{6}`);
        const arr = this.selectedBases.map(v =>
            this.$http.post(SET_BASE_PROP, {
                ip: this.ipMap.get(v),
                protocol: protocol.replace(
                    pattern,
                    (_, $1) => $1 + this.group + (v !== this.main ? '55' : 'AA')
                )
            })
        );

        await Promise.all(arr);
        this.$message.success('设置成功');
    }

    protected dispose() {
        this.selectedBases.length = 0;
        this.main = this.group = '';
    }

    protected bindEvents() {
        this.mgr!.on('loadComplete', () =>
            this.tagAnchor().then(data =>
                data.forEach(v => this.ipMap.set(v.id, v.ip))
            )
        );

        this.mgr!.on(
            'mapClickNode',
            ({ nodeType, target }: FMMapClickEvent) => {
                const type = getCustomInfo<number>(target, 'type');
                const id = getCustomInfo<{ name: string }>(target, 'info').name;
                if (
                    nodeType === fengmap.FMNodeType.IMAGE_MARKER &&
                    type === this.ICON_TYPE.STATION &&
                    id
                ) {
                    const index = this.selectedBases.indexOf(id);
                    if (index > -1) {
                        this.selectedBases.splice(index, 1);
                        this.mgr?.modifyImg(id);
                        this.main === id && (this.main = '');
                    } else {
                        this.selectedBases.push(id);
                        this.mgr?.modifyImg(id, BASE_ERROR_IMG);
                    }
                }
            }
        );
    }
}
</script>

<style lang="postcss" module>
.op {
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    max-width: 100%;

    & div[role='button'] {
        background: #f2f2f2;
        padding-left: 10px;
        border-bottom: 1px solid #ccc;
    }

    & div[role='tabpanel'] {
        padding: 10px;
    }
}
</style>