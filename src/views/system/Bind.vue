<template>
    <div style="padding: 5%; height: 100%">
        <el-card :class="$style.main" :body-style="bodyStyle">
            <el-carousel
                :autoplay="false"
                style="width: 100%"
                indicator-position="outside"
                :type="rootWidth >= 1300 ? 'card' : ''"
                trigger="click"
                :arrow="bindings.length > 1 ? 'hover' : 'never'"
                @change="index = $event"
            >
                <el-carousel-item v-for="(v, i) of bindings" :key="v.id">
                    <el-transfer
                        type="card"
                        v-model="v.tags"
                        :data="data[i]"
                        :titles="['标签数据', v.name || '绑定标签']"
                        class="flex-center"
                    >
                        <el-input
                            placeholder="标签名/编号"
                            type="search"
                            v-model="keyWord[i]"
                            slot="left-footer"
                            style="transform: translateY(-1px)"
                            @keyup.enter.native="getSource(i)"
                        >
                        </el-input>
                        <div
                            slot="right-footer"
                            class="flex-center"
                            style="height:100%"
                        >
                            <template>
                                <el-tooltip
                                    effect="dark"
                                    content="更新"
                                    placement="left"
                                >
                                    <el-button
                                        :disabled="index !== i"
                                        size="mini"
                                        type="primary"
                                        circle
                                        icon="el-icon-refresh"
                                        @click="doUpdata(i)"
                                    ></el-button>
                                </el-tooltip>
                                <el-tooltip
                                    effect="dark"
                                    content="删除"
                                    placement="right"
                                >
                                    <el-button
                                        :disabled="index !== i"
                                        size="mini"
                                        type="danger"
                                        circle
                                        icon="el-icon-delete"
                                        @click="doDelete(i)"
                                    ></el-button>
                                </el-tooltip>
                            </template>
                        </div>
                    </el-transfer>
                </el-carousel-item>
            </el-carousel>

            <el-tooltip effect="dark" content="添加" :class="$style['add-btn']">
                <el-button
                    size="mini"
                    type="success"
                    icon="el-icon-plus"
                    circle
                    @click="isAdd = true"
                >
                </el-button>
            </el-tooltip>
        </el-card>

        <el-dialog
            title="添加标签绑定分组"
            :visible.sync="isAdd"
            :modal-append-to-body="false"
            width="550px"
        >
            <el-form :model="form" ref="form" label-width="auto">
                <el-form-item
                    label="绑定组名"
                    prop="name"
                    style="max-width: 500px"
                >
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="绑定标签" prop="tags" required>
                    <tag-select
                        ref="tagSelect"
                        :multiple="true"
                        @change="form.tags = $event"
                    ></tag-select>
                </el-form-item>
            </el-form>
            <template slot="footer">
                <el-button @click="isAdd = false">取 消</el-button>
                <el-button @click="doAdd" type="primary">添 加</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TransferData } from 'element-ui/types/transfer';
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { Async } from '../../assets/utils/util';
import { ElForm } from 'element-ui/types/form';
import { Ref } from 'vue-property-decorator';
import TagSelect from '@/components/form/TagSelect.vue';
import { GET_TAG } from '@/constant/request';

@Component({
    components: {
        'tag-select': TagSelect
    }
})
export default class Bind extends Vue {
    @State public readonly rootWidth!: number;

    public bodyStyle = {
        height: '100%',
        display: 'flex',
        ['align-items']: 'center'
    };

    public data: TransferData[][] = [];
    public bindings: IBingdings[] = [];
    public keyWord: string[] = [];
    public index: number = 0;

    public isAdd: boolean = false;
    public form: Omit<IBingdings, 'id'> = { name: '', tags: [] };

    @Ref('form') private readonly elForm!: ElForm;
    @Ref('tagSelect') private readonly tagSelect!: TagSelect;

    public created() {
        this.initData();
    }

    @Async()
    public async getSource(index: number) {
        const res: ResponseData<ITag> = await this.$http.get(GET_TAG, {
            pageSize: 100,
            currentPage: 1
        });

        const keyWord = this.keyWord[index];
        const data: TransferData[] = [];
        res.pagedData.datas.forEach(v => {
            if (v.id.includes(keyWord) || v.name.includes(keyWord)) {
                data.push({
                    key: v.id,
                    label: v.name,
                    disabled: false
                });
            }
        });
        this.assignBindings(data, index);

        return true;
    }

    @Async()
    public async doAdd() {
        await this.elForm.validate();

        console.log({ ...this.form });
        this.$message.success('添加成功');
        this.elForm.resetFields();
        this.form.tags = [];

        this.tagSelect.reset();
    }

    public doDelete(index: number) {
        console.log(index);
    }

    public doUpdata(index: number) {
        console.log(index);
    }

    private async initData() {
        // TODO
        this.bindings = [
            {
                id: 1,
                name: '绑定分组1',
                tags: ['00000004', '00000005']
            },
            {
                id: 2,
                name: '绑定分组2',
                tags: ['00000001', '00000008']
            },
            {
                id: 3,
                name: '绑定分组3',
                tags: ['00000001', '00000011']
            }
        ];

        const success = await this.getSource(0);
        if (success) {
            const data = this.data[0];
            this.bindings.forEach((_, i) => this.assignBindings(data, i));
        }
    }

    private assignBindings(data: TransferData[], index: number) {
        const more: TransferData[] = [];
        (<string[]>this.bindings[index].tags).forEach(id => {
            for (const v of data) {
                if (v.key === id) {
                    more.push({ ...v });
                    break;
                }
            }
        });

        this.$set(this.data, index, data.concat(more));
    }
}
</script>

<style lang="postcss" module>
.main {
    height: 100%;
    position: relative;
}

.add-btn {
    position: absolute;
    right: 20px;
    top: 20px;
}
</style>
