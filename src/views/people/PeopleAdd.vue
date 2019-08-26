<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">添加标签</h3>
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="头像：">
                <app-avator v-model="form.avatar" ref="avator"></app-avator>
            </el-form-item>
            <el-form-item label="标签名称：" prop="name" required>
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item
                label="标签号："
                prop="tagNo"
                required
                :rules="{
                    pattern: /^[0-9A-Fa-f]{8}$/,
                    message: 'tagNo is not a hexadecimal string of length 8'
                }"
            >
                <el-input v-model="form.tagNo"></el-input>
            </el-form-item>
            <el-form-item label="区域: ">
                <app-select
                    url="/api/zone/getall"
                    v-model="form.zone"
                    :canEmpty="true"
                ></app-select>
            </el-form-item>
            <el-form-item label="其他属性：">
                <el-input
                    v-model="form.properties"
                    placeholder="性别: 女, 部门: 研发"
                ></el-input>
            </el-form-item>
            <el-form-item label="标签类型：" prop="type">
                <el-radio-group v-model="form.type">
                    <el-radio :label="1">常驻</el-radio>
                    <el-radio :label="2">临时</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="添加原因：" v-if="form.type === 2">
                <el-input v-model="form.reason"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">立即创建</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Ref, Component } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import Select from '../../components/Select.vue';
import Avator from '../../components/Avator.vue';

@Component({
    components: {
        'app-select': Select,
        'app-avator': Avator
    }
})
export default class PeopleAdd extends Vue {
    public form: any = {
        type: 1,
        reason: '',
        avatar: '',
        properties: ''
    };

    @Ref('form') private readonly elForm!: ElForm;
    @Ref('avator') private readonly avator!: Avator;

    public onSubmit() {
        this.elForm
            .validate()
            .then(() => this.avator.getImgUrl(this.form.name))
            .then(([res1, res2]) => {
                const now = Date.now();
                const data = Object.assign(
                    {
                        createTime: now,
                        updateTime: now,
                        locked: true,
                        photo: res1.resultMap.photoUrl
                    },
                    this.form
                );
                data.avatar = res2.resultMap.avatarUrl;

                return this.$http.post('/api/tag/addTag', data, {
                    'Content-Type': 'application/json'
                });
            })
            .then(() => {
                this.$message.success('添加成功');
                this.reset();
            })
            .catch(console.log);
    }

    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.form.avatar = this.form.properties = '';
    }
}
</script>

