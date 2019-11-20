<template>
    <div style="padding: 5%; padding-top: 80px;">
        <p style="color: #e00; font-size: 24px">
            添加基站
        </p>
        <el-form
            style="max-width: 800px"
            :model="form"
            :rules="rules"
            label-width="auto"
            ref="form"
        >
            <el-form-item label="基站名称" required prop="name">
                <el-input
                    v-model="form.name"
                    placeholder="请输入基站名称"
                ></el-input>
            </el-form-item>
            <el-form-item label="基站编号" required prop="id">
                <el-input
                    v-model="form.id"
                    placeholder="请输入基站编号"
                ></el-input>
            </el-form-item>
            <el-form-item label="基站组号" required prop="groupId">
                <app-select
                    url="/api/group/getall"
                    v-model="form.groupId"
                    :keys="{ id: 'id', name: 'id' }"
                ></app-select>
            </el-form-item>
            <el-form-item label="基站ip" required>
                <ip-input v-model="form.ip"></ip-input>
            </el-form-item>
            <el-form-item label="基站类型" required>
                <el-radio-group v-model="form.main">
                    <el-radio :label="0">从基站</el-radio>
                    <el-radio :label="1">主基站</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="基站位置" required>
                <el-col
                    v-for="(v, i) of ['coordx', 'coordy', 'coordz']"
                    :span="6"
                    :key="v"
                    :offset="i ? 1 : 0"
                >
                    <el-form-item :prop="v" required>
                        <el-input
                            v-model.number="form[v]"
                            :placeholder="v.substr(-1)"
                        ></el-input>
                    </el-form-item>
                </el-col>
            </el-form-item>
            <el-form-item label="安装地址" required prop="location">
                <el-input
                    v-model="form.location"
                    placeholder="请输入基站安装地址"
                ></el-input>
            </el-form-item>
            <el-form-item label="补偿值" required prop="timeCorrectionValue">
                <el-input
                    v-model="form.timeCorrectionValue"
                    placeholder="请输入补偿值"
                ></el-input>
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <el-input v-model="form.description"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="add">
                    添加
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import IpInput from '../../components/form/IpInput.vue';
import { ElForm } from 'element-ui/types/form';
import Vue from 'vue';
import { hexadecimalRuleFactory, Async } from '@/assets/utils/util';
import Select from '@/components/form/Select.vue';

@Component({
    components: {
        'ip-input': IpInput,
        'app-select': Select
    }
})
export default class BaseAdd extends Vue {
    public form = {
        main: 0,
        ip: [] as number[],
        id: ''
    };
    public rules: any = {};

    public created() {
        ['coordx', 'coordy', 'coordz'].forEach(
            (k: string) => (this.rules[k] = { type: 'number' })
        );

        Object.assign(this.rules, {
            id: hexadecimalRuleFactory(8, 'id'),
            timeCorrectionValue: {
                pattern: /^[\d\.]+$/,
                message: 'timeCorrectionValue is not a number'
            }
        });
    }

    // 添加基站
    @Async()
    public async add() {
        const { ip, id } = this.form;
        if (ip.filter(v => !!v).length !== 4) {
            return this.$message.warning('基站ip格式错误');
        }

        const form = <ElForm>this.$refs.form;
        await form.validate();
        await this.$http.post({
            url: '/api/base/addBase',
            body: {
                ...this.form,
                ip: ip.join('.'),
                id: id.padStart(8, '0')
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.$message.success('添加成功');
        form.resetFields();
    }
}
</script>


<style lang="postcss" module>
.tool-bar {
    padding-left: 20%;
    padding-right: 20%;
}
.sel {
    position: absolute;
    top: 60px;
    left: 0;
}
.tool {
    position: absolute;
    top: 65px;
    right: 0;
}

.btn {
    text-align: center;

    & button {
        width: 50%;
    }
}

.back {
    margin-bottom: 30px;

    &:hover {
        color: #6cf;
    }
}
</style>

