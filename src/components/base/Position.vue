<template>
    <el-form
        ref="form"
        :model="form"
        label-width="100px"
        style="padding-right: 20%"
    >
        <el-form-item label="区域：">
            <el-select v-model="form.zone" filterable>
                <el-option
                    v-for="(item, i) in zones"
                    :key="i"
                    :label="item[1]"
                    :value="item[0]"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="坐标X：" prop="coordx" required>
            <el-input
                v-model.number="form.coordx"
                style="max-width: 300px;"
            ></el-input>
        </el-form-item>
        <el-form-item label="坐标Y：" prop="coordy" required>
            <el-input
                v-model.number="form.coordy"
                style="max-width: 300px;"
            ></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="onSubmit">设置</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { GET_ZONE, UPDATE_BASE } from '@/constant/request';
import { Async } from '@/assets/utils/util';

@Component
export default class Position extends Vue {
    @Prop() public data!: any;

    public form: any = {
        coordx: 0,
        coordy: 0,
        zone: '0'
    };

    public zones: string[][] = [];

    public created() {
        this.form.coordx = this.data.coordx;
        this.form.coordy = this.data.coordy;
        this.form.zone = this.data.zone;

        this.$http
            .get(GET_ZONE, {
                currentPage: 1,
                pageSize: 10000
            })
            .then((res: ResponseData) => {
                this.zones = res.pagedData.datas.map((v: any) => [
                    v.id + '',
                    v.name + (v.name.endsWith('区域') ? '' : '区域')
                ]);
                if (this.zones.every(v => v[0] !== this.form.zone)) {
                    this.form.zone = this.zones[0][0];
                }
            })
            .catch(console.error);
    }

    @Async()
    public async onSubmit() {
        await (<ElForm>this.$refs.form).validate();
        await this.$confirm('确认修改');

        const data = Object.assign({}, this.form, {
            updateUser: '....',
            updateTime: Date.now(),
            id: this.data.id
        });
        await this.$http.post(UPDATE_BASE, data, {
            'Content-Type': 'application/json'
        });
        this.$message.success('修改成功');
    }
}
</script>

