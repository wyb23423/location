<template>
    <div style="padding: 5%; height: 100%">
        <el-card style="height: 100%;" :body-style="bodyStyle">
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
                        :titles="['标签数据', '绑定标签']"
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
                            <template v-if="v.id !== -1">
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
                            <el-tooltip
                                effect="dark"
                                content="添加"
                                placement="right"
                                v-else
                            >
                                <el-button
                                    :disabled="index !== i"
                                    size="mini"
                                    type="success"
                                    icon="el-icon-plus"
                                    circle
                                    @click="doAdd(i)"
                                >
                                </el-button>
                            </el-tooltip>
                        </div>
                    </el-transfer>
                </el-carousel-item>
            </el-carousel>
        </el-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TransferData } from 'element-ui/types/transfer';
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { Async } from '@/assets/utils/util';

@Component
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

    public created() {
        this.initData();
    }

    @Async()
    public async getSource(index: number) {
        const res: ResponseData<ITag> = await this.$http.get(
            '/api/tag/getall',
            {
                pageSize: 100,
                currentPage: 1,
                tagNo: this.keyWord[index]
            }
        );

        const data = res.pagedData.datas.map(v => ({
            key: v.tagNo,
            label: v.name,
            disabled: false
        }));
        this.assignBindings(data, index);

        return true;
    }

    public doAdd(index: number) {
        console.log(index);
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
                tags: ['00000004', '00000005']
            },
            {
                id: 2,
                tags: ['00000001', '00000008']
            },
            {
                id: 3,
                tags: ['00000001', '00000011']
            }
        ];

        this.bindings.unshift({
            id: -1,
            tags: []
        });

        const success = await this.getSource(0);
        if (success) {
            const data = this.data[0];
            for (let i = 1; i < this.bindings.length; i++) {
                this.assignBindings(data, i);
            }
        }
    }

    private assignBindings(data: TransferData[], index: number) {
        const more: TransferData[] = [];
        (<string[]>this.bindings[index].tags).forEach(id => {
            if (!data.some(v => v.key === v)) {
                more.push({
                    key: id,
                    label: '标签' + id,
                    disabled: false
                });
            }
        });

        this.$set(this.data, index, [...data, ...more]);
    }
}
</script>
