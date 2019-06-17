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
                    <el-select v-model="form.tagNo" filterable>
                        <el-option
                            v-for="(item, i) in tags"
                            :key="i"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选择协议：" prop="protocol" required>
                    <el-select v-model="form.protocol" filterable>
                        <el-option
                            v-for="(item, i) in protocols"
                            :key="i"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="端口号：">
                    <el-radio v-model="form.port" :label="50000">
                        50000端口
                    </el-radio>
                    <el-radio v-model="form.port" :label="60000">
                        60000端口
                    </el-radio>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">
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

interface SelOption {
    value?: any;
    label?: string;
    children?: SelOption[];
}

@Component
export default class Submissio extends Vue {
    public form: any = {};

    public base: SelOption[] = [];
    public tags: SelOption[] = [];
    public protocols: SelOption[] = [];

    public created() {
        this.init();
        this.getData();
    }

    public onSubmit() {
        const form = <ElForm>this.$refs.form;
        form.validate((valid: boolean) => {
            if (valid) {
                const now = Date.now();

                const data = {
                    ip: this.form.base[1],
                    port: this.form.port,
                    tagNo: this.form.tagNo,
                    protocol:
                        this.form.protocol + this.form.tagNo.padStart(8, '0')
                };
                // data.createTime = data.updateTime = Date.now();
                // data.createUser = data.updateUser = 'string';

                console.log(data);
            }
        });
    }
    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.init();
    }

    private init() {
        this.form = {
            base: [],
            port: 50000,
            protocol: '',
            tagNo: ''
        };
    }

    private getData() {
        // 基站
        this.$http
            .get('/api/base/getall', {
                pageSize: 10000000,
                currentPage: 1
            })
            .then(this.toTree.bind(this))
            .catch(console.error);

        // 标签
        this.$http
            .get('/api/tag/getall', {
                pageSize: 10000000,
                currentPage: 1
            })
            .then((res: any) =>
                res.pagedData.datas.map((v: any) => ({
                    value: v.tagNo,
                    label: `${v.name}: ${v.tagNo}`
                }))
            )
            .then((tags: SelOption[]) => (this.tags = tags))
            .catch(console.error);

        // 协议
        this.$http
            .get('/api/protocol/getall', {
                pageSize: 10000000,
                currentPage: 1
            })
            .then((res: any) => {
                this.protocols = res.pagedData.datas.map((v: any) => ({
                    value: v.content,
                    label: v.name
                }));
            })
            .catch(console.error);
    }

    private toTree(base: any) {
        this.base.length = 0;

        const group: { [key: string]: SelOption[] } = {};
        base.pagedData.datas.forEach((v: any) => {
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

