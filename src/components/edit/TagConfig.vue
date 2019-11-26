<template>
    <el-form label-width="100px" :model="form" style="padding: 20px 5%">
        <el-form-item prop="heartRate" label="测试心率">
            <el-select v-model="form.heartRate">
                <el-option :value="0x70" label="开始"></el-option>
                <el-option :value="0x80" label="停止"></el-option>
                <el-option :value="0x90" label="1s/次"></el-option>
                <el-option :value="0xa0" label="5s/次"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="submit">立即提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
/**
 * 通过协议配置标签
 */
import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';
import { END, HEAD } from '@/constant';

@Component
export default class TagConfig extends Vue {
    private static readonly COMMAND = 0x49;

    @Prop({ required: true }) public readonly tagNo!: string;

    public form = {
        // heartRate: 0x70
    };

    public submit() {
        const contents = Object.values(this.form).reduce(
            (a: Uint8Array[], b) => {
                if (b) {
                    const content = this.parseContent(
                        TagConfig.COMMAND,
                        Array.isArray(b) ? b : [b]
                    );
                    a.push(content);
                }

                return a;
            },
            []
        );

        console.log(contents);
    }

    private parseContent(command: number, value: number[]) {
        const content = new Uint8Array(
            value.length + this.tagNo.length / 2 + 3
        );

        let offset: number = 0;
        [HEAD, [command], value, this.stringToHex(this.tagNo)].forEach(v => {
            v.forEach((i: number) => (content[offset++] = i));
        });

        return content;
    }

    private stringToHex(str: string) {
        // string转hex
        let len = str.length;
        if (len % 2 !== 0) {
            console.warn(str + '不是一个有效的16进制字符串');
            return [];
        }

        let pos = 0;
        len /= 2;
        const arrBytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            const s = str.substr(pos, 2);
            const v = parseInt(s, 16);
            arrBytes[i] = v;
            pos += 2;
        }

        return arrBytes;
    }
}
</script>