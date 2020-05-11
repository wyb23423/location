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
        <v-form v-model="valid" style="padding: 20px 40px; max-width: 800px">
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
            >
                提交
            </el-button>
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
import { hexadecimalRuleFactory } from '@/assets/utils/util';
import { GET_MAP } from '@/constant/request';
import QRcode from '@/components/QRcode.vue';
import QRcodeCreate from './QRcodeCreate.vue';
import { Ref, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { SX_WIDTH } from '@/constant';

@Component({
    components: { QRcode, QRcodeCreate }
})
export default class Install extends Vue {
    @State public rootWidth!: number;
    @Prop({ default: () => '' }) public base!: string;

    public sx = SX_WIDTH;
    public valid = false;
    public drawerVisible = false;

    public baseNo: string = this.base;
    public position = <Vector3>{};
    public mapId = 0;

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

    public created() {
        this.$http
            .get(GET_MAP, {
                currentPage: 1,
                pageSize: 100000
            })
            .then(res => (this.mapOptions = res.pagedData.datas))
            .then(() => (this.mapId = this.mapOptions[0]?.id))
            .catch(console.error);
    }

    public open() {
        this.qrcode?.open();
    }

    public getBaseNo(data?: string) {
        if (!data) {
            return;
        }

        this.baseNo = new URL(data).searchParams.get('base') || this.baseNo;
    }
}
</script>

<style>
.v-application--wrap {
    min-height: calc(100vh - 60px) !important;
}
</style>