<template>
    <v-app>
        <v-btn
            fixed
            bottom
            right
            fab
            x-small
            color="error"
            @click="drawerVisible = true"
        >
            <i class="el-icon-ali-icon26801" style="font-size: 12px"></i>
        </v-btn>
        <v-form
            v-model="valid"
            ref="form"
            style="padding: 20px 40px; max-width: 800px"
        >
            <v-text-field
                v-model="baseNo"
                label="基站编号"
                counter="8"
                :rules="baseNoRules"
                append-icon="el-icon-ali-icon-scanCode"
                @click:append="open"
            >
            </v-text-field>
            <v-text-field
                v-for="v of ['x', 'y', 'z']"
                v-model.number="position[v]"
                :key="v"
                :label="v"
                :rules="positionRules"
                type="number"
            ></v-text-field>
            <v-select
                v-model="mapId"
                label="所属地图"
                :items="mapOptions"
                item-text="name"
                item-value="id"
            ></v-select>
            <el-button
                type="primary"
                style="width: 100%; margin-top: 20px"
                :disabled="!valid"
                icon="el-icon-plus"
                @click="add"
            >
                添加
            </el-button>
            <div style="margin-top: 20px" v-show="onLine">
                <v-badge
                    :content="dataCount > 99 ? 99 : dataCount"
                    :value="dataCount > 0"
                    overlap
                    style="width: 100%;"
                >
                    <el-button
                        type="success"
                        style="width: 100%;"
                        :disabled="dataCount <= 0 || submitCount > 0"
                        :loading="submitCount > 0"
                        icon="el-icon-upload2"
                        @click="onSubmit"
                    >
                        提交
                    </el-button>
                </v-badge>
            </div>
        </v-form>

        <QRcode @close="getBaseNo" ref="qrcode"></QRcode>

        <el-drawer
            :visible.sync="drawerVisible"
            :size="rootWidth < sx ? '100%' : '30%'"
        >
            <span slot="title" style="outline: 0;">生成二维码</span>
            <QRcodeCreate></QRcodeCreate>
        </el-drawer>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { hexadecimalRuleFactory, Async } from '@/assets/utils/util';
import { GET_MAP, INSTALL_BASE } from '@/constant/request';
import QRcode from '@/components/QRcode.vue';
import QRcodeCreate from './QRcodeCreate.vue';
import { Ref, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { SX_WIDTH } from '@/constant';
import { VForm } from 'vuetify/lib';
import { getAndCreateStore } from '@/assets/lib/localstore';

const store = getAndCreateStore('INSTALL');

interface InstallData {
    baseId: string;
    coordinate: Vector3;
    mapId: number;
}

@Component({
    components: { QRcode, QRcodeCreate }
})
export default class Install extends Vue {
    @State public rootWidth!: number;
    @Prop({ default: () => '' }) public base!: string;

    public sx = SX_WIDTH; // 小屏宽度
    public valid = false; // 表单是否有效
    public drawerVisible = false; // 是否显示生成二维码的表单

    // 表单字段
    public baseNo: string = this.base;
    public position = <Vector3>{};
    public mapId = 0;

    public dataCount = 0; // 缓存中数据的数量
    public submitCount = 0; // 提交中的数据数量

    public positionRules = [
        (v: number) => typeof v === 'number' || '必须为有效数字',
        (v: number) => v >= 0 || '不能为负值'
    ];
    public baseNoRules = [
        (v: string) => !!v || '不能为空',
        (v: string) =>
            hexadecimalRuleFactory(8, 'id').pattern.test(v) ||
            '必须是一个长度不大于8的16进制字符串'
    ];
    public mapOptions: IMap[] = [];

    @Ref('qrcode') public qrcode!: QRcode;

    public get onLine() {
        return navigator.onLine;
    }

    public created() {
        store.length().then(c => (this.dataCount = c));
        this.initMapOptions();
    }

    // 将数据添加到缓存
    public async add() {
        const data = {
            baseId: this.baseNo.padStart(8, '0'),
            coordinate: this.position,
            mapId: this.mapId
        };

        // 重置表单
        (<any>this.$refs.form).resetValidation();
        this.baseNo = '';
        this.position = <Vector3>{};

        // 判断是否新增
        const key = 'map_' + data.baseId;
        const res = await this.$async(store.getItem(key));
        if (!(res.value || res.err)) {
            this.dataCount++;
        }

        // 设置缓存
        await store.setItem(key, data);

        // 正在提交, 立即提交数据
        if (this.submitCount > 0) {
            this.submitCount++;
            this._submit(key, data);
        }
    }

    // 提交缓存中的数据
    public onSubmit() {
        store.keys((err, keys) => {
            this.submitCount = keys.length;
            keys.forEach(k => this._submit(k));
        });
    }

    // 开启二维码扫描器
    public open() {
        this.qrcode?.open();
    }

    // 扫码后获取基站编号
    public getBaseNo(data?: string) {
        if (!data) {
            return;
        }

        this.baseNo = new URL(data).searchParams.get('base') || this.baseNo;
    }

    // 提交一条数据
    private async _submit(k: string, data?: InstallData) {
        try {
            data = data || (await store.getItem<InstallData>(k));

            await this.$http.post(INSTALL_BASE, data, {
                'Content-Type': 'application/json'
            });
            await store.removeItem(k);
            this.dataCount--;
        } catch (e) {
            console.error(e);
        }

        this.submitCount--;
    }

    @Async()
    private async initMapOptions() {
        this.mapOptions = JSON.parse(
            localStorage.getItem('MAPS') || JSON.stringify([])
        );

        if (navigator.onLine) {
            this.mapOptions = (
                await this.$http.get(GET_MAP, {
                    currentPage: 1,
                    pageSize: 100000
                })
            ).pagedData.datas;
            localStorage.setItem('MAPS', JSON.stringify(this.mapOptions));
        }

        this.mapId = this.mapOptions[0]?.id;
    }
}
</script>

<style>
.v-application--wrap {
    min-height: calc(100vh - 60px) !important;
}
</style>