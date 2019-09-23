<template>
    <el-form :model="form">
        <el-form-item label="相关标签">
            <el-select
                v-model="form.tagNo"
                :disabled="isPlaying"
                :loading="loading"
                :remote-method="remoteMethod"
                placeholder="请输入标签名"
                @change="change"
                style="min-width: 200px"
                remote
                filterable
            >
                <el-option
                    v-for="item in tagOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="进入区域">
            <app-select
                multiple
                v-model="form.in"
                :filters="{ mode: zoneMode.in }"
                url="/api/zone/getall"
            ></app-select>
        </el-form-item>
        <el-form-item label="离开区域">
            <app-select
                multiple
                v-model="form.out"
                :filters="{ mode: zoneMode.out }"
                url="/api/zone/getall"
            ></app-select>
        </el-form-item>
        <el-form-item label="离开区域"> </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';
import { ElSelect } from 'element-ui/types/select';
import { ElOption } from 'element-ui/types/option';
import Select from '@/components/Select.vue';

@Component({
    components: {
        'app-select': Select
    }
})
export default class TagZone extends Vue {
    @State public zoneMode!: ZoneMode;

    public form = {
        tagNo: '',
        in: [],
        out: []
    };
    public tagOptions: Array<Pick<ElOption, 'value' | 'label'>> = [];

    private timer?: number;
    private isUpdata: boolean = false;

    public remoteMethod(key: string) {
        this.timer && clearTimeout(this.timer);
        if (!key) {
            return (this.tagOptions.length = 0);
        }

        this.timer = setTimeout(() => {
            this.$http
                .get('/api/tag/getall', {
                    pageSize: 100,
                    currentPage: 1,
                    name: key
                })
                .then(res => {
                    this.tagOptions = res.pagedData.datas.map(v => ({
                        label: v.name,
                        value: v.tagNo
                    }));
                })
                .catch(console.log);
        }, 500);
    }

    public change() {
        //
    }
}
</script>