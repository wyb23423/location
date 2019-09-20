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
                <el-input
                    v-model="form.groupId"
                    placeholder="请输入基站组号"
                ></el-input>
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
                <el-col :span="6">
                    <el-form-item prop="coordx" required>
                        <el-input
                            v-model.number="form.coordx"
                            placeholder="x"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :offset="1" :span="6">
                    <el-form-item prop="coordy" required>
                        <el-input
                            v-model.number="form.coordy"
                            placeholder="y"
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :offset="1" :span="6">
                    <el-form-item prop="coordz" required>
                        <el-input
                            v-model.number="form.coordz"
                            placeholder="z"
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
import IpInput from '../../components/IpInput.vue';
import { ElForm } from 'element-ui/types/form';
import Vue from 'vue';
import { hexadecimalRuleFactory } from '@/assets/utils/util';

const ICON_NAME = 'origin';

@Component({
    components: {
        'ip-input': IpInput
    }
})
export default class BaseAdd extends Vue {
    public form: any = {
        main: 0,
        ip: []
    };
    public rules: any = {};

    public created() {
        ['coordx', 'coordy', 'coordz'].forEach(
            (k: string) => (this.rules[k] = { type: 'number' })
        );

        Object.assign(this.rules, {
            groupId: hexadecimalRuleFactory(4, 'groupId'),
            id: hexadecimalRuleFactory(8, 'id'),
            timeCorrectionValue: {
                pattern: /^[\d\.]+$/,
                message: 'timeCorrectionValue is not a number'
            }
        });
    }

    // 添加基站
    // 检测表单并暂存基站数据
    public add() {
        if (this.form.ip.length !== 4) {
            return this.$message.warning('基站ip格式错误');
        }

        const form = <ElForm>this.$refs.form;
        form.validate()
            .then(() =>
                this.$http.post(
                    '/api/base/addBase',
                    {
                        ...this.form,
                        ip: this.form.ip.join('.'),
                        id: this.form.id.padStart(8, '0'),
                        groupId: this.form.id.padStart(4, '0')
                    },
                    {
                        'Content-Type': 'application/json'
                    }
                )
            )
            .then(() => {
                this.$message.success('添加成功');
                location.href = location.href;
            })
            .catch(console.log);
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

