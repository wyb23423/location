<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">添加标签</h3>
        <el-form ref="form" :model="form" label-width="auto" style="width: 80%">
            <el-form-item label="头像：">
                <app-avator v-model="form.avatar" ref="avator"></app-avator>
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
            <el-form-item label="标签名称：" prop="name" required>
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item
                label="标签高度："
                prop="height"
                required
                :rules="{ type: 'number' }"
            >
                <el-input v-model.number="form.height">
                    <template slot="append">
                        cm
                    </template>
                </el-input>
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
                <el-button
                    type="primary"
                    @click="update ? onUpdate() : onPut()"
                >
                    立即提交
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Ref, Component, Prop } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import Select from '../../components/form/Select.vue';
import Avator from '../../components/Avator.vue';
import { Async } from '@/assets/utils/util';

@Component({
    components: {
        'app-select': Select,
        'app-avator': Avator
    }
})
export default class PeopleAdd extends Vue {
    @Prop({
        default: () => ({
            type: 1,
            avatar: '',
            properties: ''
        })
    })
    public form!: ITag;

    @Ref('avator') public readonly avator!: Avator;
    @Ref('form') private readonly elForm!: ElForm;

    // 添加
    @Async()
    public async onPut() {
        await this.elForm.validate();

        const [res1, res2] = await this.avator.getImgUrl(this.form.name);
        await this.$http.post({
            url: '/api/tag/addTag',
            body: {
                ...this.form,
                avatar: res2.resultMap.avatarUrl,
                photo: res1.resultMap.photoUrl,
                locked: true
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.reset().$message.success('添加成功');
    }

    // 更新
    @Async()
    public async onUpdate() {
        await this.elForm.validate();
        this.$emit('submit', this.form);
    }

    public reset() {
        (<ElForm>this.$refs.form).resetFields();
        this.form.avatar = this.form.properties = '';
        return this;
    }
}
</script>

