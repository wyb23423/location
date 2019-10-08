<template>
    <el-dialog
        title="配置校准值"
        :visible="!!visible"
        :modal-append-to-body="false"
        width="80%"
        top="5vh"
        @close="$emit('close')"
    >
        <app-table
            :max-height="300"
            :table-data="tableData"
            :col-cfg="colCfg"
            :total-count="totalCount"
            :noPrint="true"
            :isSmall="true"
            @updateData="getData"
        ></app-table>

        <div :class="$style.alert">
            校准者误差配置需要参数：基站坐标，标签实际坐标，标签距离基站距离(自动计算)，平均时间戳
        </div>

        <el-divider content-position="left">输入标签参数</el-divider>
        <el-form
            :model="form"
            :inline="true"
            :class="$style['tag-form']"
            ref="tag"
            label-width="auto"
        >
            <el-form-item label="标签编号" style="margin-right: 10%">
                <el-input v-model="form.tagNo"></el-input>
            </el-form-item>
            <el-form-item label="标签实际坐标" required>
                <el-row style="width: 388px">
                    <el-col :span="6">
                        <el-form-item
                            prop="x"
                            required
                            :rules="{ type: 'number' }"
                        >
                            <el-input
                                v-model.number="form.x"
                                placeholder="x"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-form-item
                            prop="y"
                            required
                            :rules="{ type: 'number' }"
                        >
                            <el-input
                                v-model.number="form.y"
                                placeholder="y"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-form-item
                            prop="z"
                            required
                            :rules="{ type: 'number' }"
                        >
                            <el-input
                                v-model.number="form.z"
                                placeholder="z"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>

        <el-divider content-position="left">平均时间戳</el-divider>
        <el-form :model="form" :class="$style['base-form']" inline ref="base">
            <el-form-item
                v-for="v of tableData"
                :key="v.id"
                :prop="v.id"
                required
                :label="`${v.id}基站平均时间戳`"
                :rules="{ type: 'number' }"
            >
                <el-input
                    v-model.number="form[v.id]"
                    prefix-icon="el-icon-timer"
                ></el-input>
            </el-form-item>
        </el-form>

        <template slot="footer">
            <el-button @click="submit" type="primary">计 算</el-button>
            <el-button @click="reset">重 置</el-button>
            <el-button @click="$emit('close')">取 消</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import TableMixin from '../../mixins/table';
import { Prop } from 'vue-property-decorator';
import { ElForm } from 'element-ui/types/form';
import { major, subordinate } from '../../assets/utils/compensation';

@Component
export default class CalibrationSetting extends mixins(TableMixin) {
    @Prop() public visible!: boolean;
    @Prop() public bases!: any[];

    public form: any = {
        tagNo: '00000004'
    };

    public colCfg: any[] = [
        { prop: 'id', label: '基站编号' },
        { prop: 'name', label: '基站名称' },
        { prop: 'main', label: '主基站' },
        { prop: 'ip', label: '基站IP' }
    ];

    public async submit() {
        try {
            await Promise.all([
                (<ElForm>this.$refs.tag).validate(),
                (<ElForm>this.$refs.base).validate()
            ]);

            const main: any = this.tableData.find(v => !!v.main);
            if (main) {
                const mainVec: Vector3 = {
                    x: main.coordx,
                    y: main.coordy,
                    z: main.coordz
                };
                const arr = this.tableData.map(v => {
                    const timeCorrectionValue: number = v.main
                        ? major(mainVec, this.form, this.form[main.id])
                        : subordinate(
                              {
                                  x: v.coordx,
                                  y: v.coordy,
                                  z: v.coordz
                              },
                              this.form,
                              mainVec,
                              this.form[main.id],
                              this.form[v.id]
                          );

                    v.timeCorrectionValue = timeCorrectionValue + '';

                    return this.$http.post('/api/base/updateBase', v);
                });

                Promise.all(arr)
                    .then(() => this.$message.success('修改成功'))
                    .catch(console.log);

                this.reset();
            }
        } catch (e) {
            console.log(e);
        }
    }

    public reset() {
        (<ElForm>this.$refs.base).resetFields();
        (<ElForm>this.$refs.tag).resetFields();
    }

    protected fetch(page: number, pageSize: number) {
        return Promise.resolve({
            count: this.bases.length,
            data: this.bases.slice((page - 1) * pageSize, page * pageSize)
        });
    }
}
</script>

<style lang="postcss" module>
.alert {
    margin: 40px 0 20px;
    padding: 15px;
    line-height: 22px;
    border-left: 5px solid #67c23a;
    border-radius: 0 2px 2px 0;
    background-color: #f2f2f2;
}

.tag-form {
    padding-left: 10%;
}

.base-form {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;

    & > * {
        width: 40%;

        @media screen and (width <= 768px) {
            width: 100%;
            padding-left: 10%;
        }
    }
}
</style>

