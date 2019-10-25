<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card">
            <div :class="$style.alert">协议下发 请选择</div>
            <el-form
                :model="form"
                label-width="auto"
                style="width: 80%"
                ref="form"
            >
                <el-form-item label="选择基站：" prop="base" required>
                    <el-cascader
                        v-model="form.base"
                        :options="base"
                        :props="{ expandTrigger: 'hover' }"
                        filterable
                        :show-all-levels="false"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="选择标签：" prop="tagNo" required>
                    <tag-select @change="form.tagNo = $event"></tag-select>
                </el-form-item>
                <el-form-item label="选择协议：" prop="protocol" required>
                    <el-select v-model="form.protocol" filterable>
                        <el-option
                            v-for="item of protocols"
                            :key="item.id"
                            :label="item.name"
                            :value="item.content"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="onSubmit">
                        立即提交
                    </el-button>
                    <el-button @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { ElForm } from 'element-ui/types/form';
import TagSelect from '@/components/form/TagSelect.vue';
import { Async } from '@/assets/utils/util';
import { Ref } from 'vue-property-decorator';

interface SelOption {
    value?: any;
    label?: string;
    children?: SelOption[];
}

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class Submissio extends Vue {
    public form: any = {
        base: [],
        port: 60000,
        protocol: '',
        tagNo: ''
    };

    public base: SelOption[] = [];
    public protocols: IProtocol[] = [];

    @Ref('form') private readonly elForm!: ElForm;

    public created() {
        this.getBase();
        this.getProtocol();
    }

    @Async()
    public async onSubmit() {
        const { err, value } = await this.$async(this.elForm.validate());
        if (err) {
            return;
        }

        const res = await this.$http.post('/api/protocol/sendProtocol', {
            ...this.form,
            ip: this.form.base[1]
        });

        this.reset().$message.success(res.message);
    }
    public reset() {
        this.elForm.resetFields();
        return this;
    }

    @Async()
    private async getBase() {
        const res = await this.$http.get('/api/base/getall', {
            pageSize: 10000000,
            currentPage: 1
        });

        this.base.length = 0;
        const group: { [key: string]: SelOption[] } = {};
        res.pagedData.datas.forEach((v: any) => {
            (group[v.groupCode] || (group[v.groupCode] = [])).push({
                value: v.ip,
                label: `${v.name}: ${v.baseNo}; ${v.main ? '主' : '从'}基站`
            });
        });

        for (const [k, v] of Object.entries(group)) {
            this.base.push({
                label: `分组${k}`,
                children: v
            });
        }
    }

    @Async()
    private async getProtocol() {
        this.protocols = (await this.$http.get('/api/protocol/getall', {
            pageSize: 10000000,
            currentPage: 1
        })).pagedData.datas;
    }
}
</script>

<style lang="postcss" module>
.alert {
    margin: 16px 0;
    padding: 15px;
    line-height: 22px;
    border-left: 5px solid #67c23a;
    border-radius: 0 2px 2px 0;
    background-color: #f2f2f2;
}
</style>

