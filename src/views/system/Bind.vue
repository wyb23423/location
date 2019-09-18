<template>
    <div style="padding: 5%; height: 100%">
        <el-card style="height: 100%;" :body-style="bodyStyle">
            <el-carousel
                :autoplay="false"
                style="width: 100%"
                indicator-position="outside"
                type="card"
                trigger="click"
                :arrow="bindings.length > 1 ? 'always' : 'never'"
                @change="index = $event"
            >
                <el-carousel-item v-for="(i, v) of bindings" :key="v.id">
                    <el-transfer
                        type="card"
                        v-model="v.tags"
                        :data="data[i]"
                        :titles="['标签数据', '绑定标签']"
                        class="flex-center"
                    >
                        <el-input
                            placeholder="标签名或标签号"
                            type="search"
                            v-model="keyWord[i]"
                            slot="left-footer"
                            style="transform: translateY(-1px)"
                        >
                            <el-button
                                slot="append"
                                icon="el-icon-search"
                                @click="getSource(i)"
                            ></el-button>
                        </el-input>
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

@Component
export default class Bind extends Vue {
    public bodyStyle = {
        height: '100%',
        display: 'flex',
        ['align-items']: 'center'
    };

    public data: TransferData[][] = [];
    public bindings: IBingdings[] = [];
    public index: number = 0;
    public keyWord: string[] = [];

    public created() {
        this.initData();
    }

    public getSource(index: number) {
        return this.$http
            .get('/api/tag/getall', {
                pageSize: 100,
                currentPage: 1,
                tagNo: this.keyWord[index]
            })
            .then((res: ResponseData<ITag>) => {
                const data = res.pagedData.datas.map(v => ({
                    key: v.tagNo,
                    label: v.name,
                    disabled: false
                }));
                this.assignBindings(data, index);

                return true;
            })
            .catch(console.log);
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
