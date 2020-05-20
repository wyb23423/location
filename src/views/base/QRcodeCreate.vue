<template>
    <v-app style="padding: 40px;">
        <h4 style="margin-bottom: 10px">生成二维码</h4>
        <v-form v-model="valid">
            <v-text-field
                v-model="min"
                label="编号1"
                counter="8"
                :rules="baseNoRules"
            ></v-text-field>
            <v-text-field
                v-model="max"
                label="编号2"
                counter="8"
                :rules="baseNoRules"
            >
            </v-text-field>
            <el-button
                type="primary"
                style="width: 100%; margin-top: 20px"
                :disabled="!valid"
                @click="createQRcode"
            >
                生成
            </el-button>
        </v-form>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { hexadecimalRuleFactory, Async } from '@/assets/utils/util';
import QRCode from 'qrcode';
import { download } from '@/assets/utils/download';

@Component
export default class QRcodeCreate extends Vue {
    public valid = false;

    public max: string = '';
    public min: string = '';
    public baseNoRules = [
        (v: string) => !!v || '不能为空',
        (v: string) =>
            hexadecimalRuleFactory(8, 'id').pattern.test(v) ||
            '必须是一个长度不大于8的16进制字符串'
    ];

    private log = true;

    public createQRcode() {
        const url = new URL(location.href);
        url.searchParams.set('laienwei_base_no', '1');

        let min = +`0x${this.min}`;
        let max = +`0x${this.max}`;
        min > max && ([min, max] = [max, min]);

        for (let i = min; i <= max; i++) {
            const no = i
                .toString(16)
                .padStart(8, '0')
                .toUpperCase();
            url.searchParams.set('base', no);
            this._createQRcode(url.toJSON(), no);
        }
    }

    @Async()
    private async _createQRcode(url: string, no: string) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            this.log && this.$message.info('您的浏览器不支持canvas');
            this.log = false;
            return;
        }

        await QRCode.toCanvas(canvas, url, { width: 300 });
        this.addNo(ctx, no);
        canvas.toBlob(blob => blob && download(blob, no + '.png'));
    }

    private addNo(ctx: CanvasRenderingContext2D, no: string) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(90, 130, 120, 30);

        ctx.fillStyle = '#409EFF';
        ctx.font = '24px bold serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(no, 150, 150);
    }
}
</script>