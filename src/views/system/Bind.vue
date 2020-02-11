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
                    <el-card class="bind-item-card" style="height: 100%">
                        <div
                            slot="header"
                            class="flex-center"
                            style="justify-content: space-between;"
                        >
                            <span>{{ v.name }}</span>
                            <div>
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
                                        @click="openDialog(i)"
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
                            </div>
                        </div>
                        <ul :class="$style.info">
                            <li>{{ v.type | mainDesc }}: {{ v.main.name }}</li>
                            <li>绑定类型: {{ v.type | typeDesc }}</li>
                            <li>极限距离: {{ v.radius }}cm</li>
                            <li>
                                <el-tooltip placement="bottom-start">
                                    <div slot="content" :class="$style.tooltip">
                                        {{ v.bundleStr }}
                                    </div>
                                    <div class="ellipsis">
                                        关联标签: {{ v.bundleStr }}
                                    </div>
                                </el-tooltip>
                            </li>
                            <li>
                                <el-tooltip placement="bottom-start">
                                    <div slot="content" :class="$style.tooltip">
                                        {{ v.detail }}
                                    </div>
                                    <div class="ellipsis">
                                        描述: {{ v.detail }}
                                    </div>
                                </el-tooltip>
                            </li>
                        </ul>
                    </el-card>
                </el-carousel-item>
                <el-carousel-item v-if="!bindings.length">
                    <Empty></Empty>
                </el-carousel-item>
            </el-carousel>

            <el-tooltip effect="dark" content="添加" :class="$style['add-btn']">
                <el-button
                    size="mini"
                    type="success"
                    icon="el-icon-plus"
                    circle
                    @click="openDialog()"
                >
                </el-button>
            </el-tooltip>
        </el-card>

        <el-dialog
            :title="form.type | typeDesc"
            :visible.sync="isDialogOpen"
            :modal-append-to-body="false"
            width="550px"
        >
            <el-form :model="form" ref="form" label-width="auto">
                <el-form-item label="组名" prop="name" style="max-width: 500px">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="type" required>
                    <el-radio-group v-model="form.type">
                        <el-radio :label="0">跟随</el-radio>
                        <el-radio :label="1">靠近</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item
                    :label="form.type | mainDesc"
                    prop="main"
                    required
                >
                    <tag-select
                        ref="tagSelectMain"
                        :is-valid="isValidMain"
                        @change="selectMain"
                    ></tag-select>
                </el-form-item>
                <el-form-item label="关联标签" prop="bundle" required>
                    <tag-select
                        style="min-width: 300px"
                        ref="tagSelect"
                        :multiple="true"
                        :multiple-limit="null"
                        :is-valid="isValid"
                        @change="selectTag"
                    ></tag-select>
                </el-form-item>
                <el-form-item label="极限距离(cm)" prop="radius" required>
                    <el-input-number
                        v-model="form.radius"
                        :min="0"
                    ></el-input-number>
                </el-form-item>
                <el-form-item label="描述" prop="detail">
                    <el-input v-model="form.detail"></el-input>
                </el-form-item>
            </el-form>
            <template slot="footer">
                <el-button @click="isDialogOpen = false">取 消</el-button>
                <el-button type="primary" @click="isAdd ? doAdd() : doUpdata()">
                    {{ isAdd ? '添 加' : '更 新' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TransferData } from 'element-ui/types/transfer';
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { Async, none } from '../../assets/utils/util';
import { ElForm } from 'element-ui/types/form';
import { Ref } from 'vue-property-decorator';
import TagSelect from '@/components/form/TagSelect.vue';
import Empty from '@/components/layout/Empty.vue';
import { GET_TAG, GET_BIND, BIND_CONTROLLER } from '@/constant/request';

type IBingdingsData = IBingdings & { bundleStr: string };

@Component({
    components: {
        'tag-select': TagSelect,
        Empty
    },
    filters: {
        mainDesc(type: 0 | 1) {
            return type ? '禁止靠近标签' : '被跟随标签';
        },
        typeDesc: (type?: 0 | 1) => {
            return type ? '靠近' : '跟随';
        }
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
    public bindings: IBingdingsData[] = [];
    public keyWord: string[] = [];
    public index: number = 0;

    public isDialogOpen: boolean = false;
    public isAdd: boolean = false;
    public form: Partial<IBingdings> = { bundle: [], type: 0 };
    public typeDesc = none; // 防止vue报错, filters定义有bug

    @Ref('form') private readonly elForm!: ElForm;
    @Ref('tagSelect') private readonly tagSelect!: TagSelect;
    @Ref('tagSelectMain') private readonly tagSelectMain!: TagSelect;

    public created() {
        this.initData();
    }
    public selectTag(_: string[], tags: ITag[]) {
        const nameArr: string[] = [];
        this.form.bundle = tags.map(tag => {
            nameArr.push(tag.name);
            return { id: tag.id, name: tag.name };
        });
    }
    public selectMain(_: string, tag: ITag) {
        this.form.main = { id: tag.id, name: tag.name };
    }

    public isValid(tag: ITag) {
        return tag.id !== this.form.main!.id;
    }

    public isValidMain(tag: ITag) {
        return this.form.bundle!.every(v => v.id !== tag.id);
    }

    @Async()
    public async doAdd() {
        await this.elForm.validate();
        if (!this.form.bundle!.length) {
            return this.$message.warning('相关标签不能为空');
        }

        await this.$http.request({
            url: BIND_CONTROLLER,
            method: 'PUT',
            data: this.form,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.$message.success('添加成功');
        this.elForm.resetFields();
        this.tagSelect.reset();
        this.tagSelectMain.reset();

        this.initData();
    }

    @Async()
    public async doDelete(index: number) {
        const item = this.bindings[index];
        if (!item) {
            return;
        }

        await this.$confirm(`删除绑定组${item.name}?`);
        await this.$http.request({
            url: BIND_CONTROLLER,
            method: 'DELETE',
            params: { id: item.id }
        });

        this.$message.success('删除成功');
        this.bindings.splice(index, 1);
    }

    @Async()
    public async doUpdata() {
        await this.elForm.validate();
        if (!this.form.bundle!.length) {
            return this.$message.warning('相关标签不能为空');
        }

        const item = <IBingdings>this.form;
        await this.$confirm(`更新绑定组${item.name}?`);
        await this.$http.post({
            url: BIND_CONTROLLER,
            params: item,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.$message.success('更新成功');
        this.bindings[this.index] = {
            ...item,
            bundleStr: item.bundle!.map(v => v.name).join(',')
        };
    }

    public openDialog(index?: number) {
        const isAdd = (this.isAdd = index == null);
        this.isDialogOpen = true;

        this.form = { bundle: [], type: 0 };
        if (!isAdd) {
            this.form = { ...this.bindings[index!] } || { bundle: [] };
        }

        this.$nextTick(() => {
            this.tagSelect &&
                this.tagSelect.setValue(this.form.bundle!.map(v => v.id));

            this.tagSelectMain &&
                this.tagSelectMain.setValue((this.form.main || { id: '' }).id);
        });
    }

    @Async(console.error)
    private async initData() {
        const {
            pagedData: { datas }
        }: ResponseData<IBingdings> = await this.$http.get(GET_BIND);

        this.bindings = datas.map(v => ({
            ...v,
            bundleStr: v.bundle.map(t => t.name).join(',')
        }));
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

.info li {
    padding: 5px 0;
}
.tooltip {
    word-break: break-all;
    max-width: 80vw;
    max-height: 100px;
    overflow: auto;

    &::-webkit-scrollbar {
        display: none;
    }
}
</style>


<style lang="postcss">
.bind-item-card .el-card__header {
    background: #efefef;
}
</style>