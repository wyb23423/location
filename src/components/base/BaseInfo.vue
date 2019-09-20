<template>
    <el-row>
        <el-col :span="18">
            <ul :class="$style.info">
                <li :class="$style.name">
                    <span>设备名称：{{ data.name }}</span>
                    <span>{{ '&nbsp;'.repeat(30) }}</span>
                    <span>设备分组：{{ data.groupCode }}</span>
                </li>
                <li style="min-height: 100px">
                    设备简介：{{ data.description || '暂无简介' }}
                </li>
                <li>
                    <div>
                        <span :class="$style.title">设备坐标：</span>
                        <span>
                            {{ `{ x: ${data.coordx}, y: ${data.coordy} }` }}
                        </span>
                    </div>
                    <div>
                        <span :class="$style.title">设备地址：</span>
                        <span>{{ data.location }}</span>
                    </div>
                </li>
                <li>
                    <div>
                        <span :class="$style.title">IP地址：</span>
                        <span>{{ data.ip }}</span>
                    </div>
                    <div>
                        <span :class="$style.title">安装负责人：</span>
                        <span>{{ data.owner || '保密' }}</span>
                    </div>
                </li>
                <li>
                    <div>
                        <span :class="$style.title">是否工作：</span>
                        <span>{{ !!data.status }}</span>
                    </div>
                    <div>
                        <span :class="$style.title">安装时间：</span>
                        <span>{{ data.installTime || '保密' }}</span>
                    </div>
                </li>
            </ul>
        </el-col>
        <el-col :offset="1" :span="5" style="text-align: right">
            <el-image
                src="/images/80530151701.png"
                fit="contain"
                style="width: 100%"
            >
                <div slot="error" :class="$style['image-slot']">
                    <i class="el-icon-picture-outline"></i>
                </div>
            </el-image>
        </el-col>
    </el-row>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';

@Component
export default class BaseInfo extends Vue {
    @Prop() public readonly data!: IBaseStation;
}
</script>

<style lang="postcss" module>
.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 300px;
    background: #f5f7fa;
    color: #909399;
    font-size: 36px;
}

.info {
    & li {
        list-style: none;
        border: 1px solid #ccc;
        border-bottom-style: none;
        padding: 15px;
        padding-left: 40px;

        & div {
            display: inline-block;
            width: 50%;
            vertical-align: middle;
        }

        & div:first-child {
            border-right: 1px solid #000;
        }

        & div:last-child {
            padding-left: 40px;
        }
    }

    & li:last-child {
        border-bottom-style: solid;
    }
}

.name {
    background: #ddd;
    font-weight: 700;
    padding-left: 20px !important;
}

.title {
    display: inline-block;
    vertical-align: middle;
    width: 200px;
}
</style>



