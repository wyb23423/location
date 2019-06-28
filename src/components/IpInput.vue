<template>
    <div @paste="paste($event)">
        <el-input
            v-for="(v, i) of new Array(length).fill(1)"
            :key="i"
            v-model="value[i]"
            @input="next(i)"
            :class="$style.ip"
            ref="ip"
        >
            <span slot="append" v-if="i < length - 1">.</span>
        </el-input>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Emit } from 'vue-property-decorator';
import { ElInput } from 'element-ui/types/input';

@Component
export default class IpInput extends Vue {
    @Prop({ default: () => [] }) public value!: string[];

    @Prop({ default: () => 0 }) public min!: number;
    @Prop({ default: () => 255 }) public max!: number;
    @Prop({ default: () => 4 }) public length!: number;

    @Emit('input')
    public next(i: number) {
        const currValue = this.value[i];
        const value = this.parseIp(currValue);
        this.$set(this.value, i, value);

        if (value.length >= (this.max + '').length && i < this.length - 1) {
            (<ElInput[]>this.$refs.ip)[i + 1].focus();
        }

        if (currValue.length <= 0 && i > 0) {
            (<ElInput[]>this.$refs.ip)[i - 1].focus();
        }

        return this.value;
    }

    @Emit('input')
    public paste(e: ClipboardEvent) {
        const index: number = (<ElInput[]>this.$refs.ip).findIndex(
            v => v.$refs.input === e.target
        );
        if (index > -1) {
            for (const v of Array.from(e.clipboardData!.items)) {
                if (v.type === 'text/plain') {
                    v.getAsString((str: string) =>
                        this.pasteHandler(str, index)
                    );
                }
            }
        }

        return this.value;
    }

    private pasteHandler(str: string, i: number) {
        const ips = <ElInput[]>this.$refs.ip;

        for (const v of str.split('.')) {
            if (i > this.length - 1) {
                break;
            }

            if (v) {
                this.$set(this.value, i++, this.parseIp(v).substr(0, 3));
            }
        }
    }

    private parseIp(value: string) {
        let num = parseInt(value, 10);
        if (Number.isFinite(num)) {
            num = Math.max(this.min, Math.min(num, this.max));

            return num + '';
        }

        return '';
    }
}
</script>

<style lang="postcss" module>
.ip {
    width: auto !important;

    & input {
        width: 50px;
        padding: 10px;
        border-radius: 0.25rem !important;
    }

    & > div {
        padding: 0 5px !important;
        vertical-align: bottom;
        background: none;
        border: none;
    }
}
</style>
