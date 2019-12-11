<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card">
            <div :class="$style.alert">参数设置 请选择</div>
            <el-form
                :model="form"
                label-width="auto"
                style="width: 80%"
                ref="form"
            >
                <el-form-item label="基站：" prop="base" required>
                    <el-cascader
                        v-model="form.base"
                        :options="base"
                        :props="{ expandTrigger: 'hover' }"
                        filterable
                        :show-all-levels="false"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="标签：" prop="tagNo">
                    <tag-select @change="form.tagNo = $event"></tag-select>
                </el-form-item>
                <el-form-item label="设置内容：" prop="protocol" required>
                    <el-select
                        v-model="form.protocol"
                        @change="selProtocol"
                        filterable
                    >
                        <el-option
                            v-for="item of protocols"
                            :key="item.content"
                            :label="item.name"
                            :value="item.content"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <p v-show="!!effect">{{ effect }}</p>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="onSubmit">
                        立即提交
                    </el-button>
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
import {
    SEND_PROTOCOL,
    GET_BASE,
    GET_PROTOCOL
} from '../../../constant/request';

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
    public effect: string = '';

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

        const res = await this.$http.post(SEND_PROTOCOL, {
            ...this.form,
            ip: this.form.base[1]
        });

        this.$message.success(res.message);
    }
    public selProtocol(content: string) {
        const protocol = this.protocols.find(v => v.content === content);
        this.effect = protocol ? protocol.effect : '';
    }

    @Async()
    private async getBase() {
        const res = await this.$http.get(GET_BASE, {
            pageSize: 10000000,
            currentPage: 1
        });

        this.base.length = 0;
        const group: { [key: string]: SelOption[] } = {};
        res.pagedData.datas.forEach((v: IBaseStation) => {
            (group[v.groupId] || (group[v.groupId] = [])).push({
                value: v.ip,
                label: `${v.name}: ${v.id}; ${v.main ? '主' : '从'}基站`
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
        this.protocols = (await this.$http.get(GET_PROTOCOL, {
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

