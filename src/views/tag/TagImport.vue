<template>
    <main style="padding: 0 5% 20px">
        <h3 style="color: #009688;">批量导入标签</h3>
        <el-upload
            drag
            :action="target"
            accept=".txt, .xls, .xlsx"
            :class="$style.upload"
            :disabled="isLoading"
        >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip">
                只能上传<strong> xls/xlsx/txt </strong>文件
            </div>
        </el-upload>
        <el-card class="bind-item-card">
            <summary slot="header">
                <span>属性描述</span>
                <el-button
                    style="float: right; padding: 3px 0"
                    type="text"
                    @click="downloadTemplate"
                >
                    模板文件
                </el-button>
            </summary>
            <ul :class="$style['info-box']">
                <li v-for="(v, i) of tips" :key="i">
                    <el-alert :title="v.title" :closable="false" show-icon>
                        {{ v.description }}
                    </el-alert>
                </li>
            </ul>
        </el-card>
    </main>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { table2Excel } from '../../assets/utils/download';
import { Loading } from '../../mixins/loading';

@Component
export default class TagImport extends Loading {
    public readonly target = '/tag/import';
    public tips = [
        {
            title: '标签号',
            description: '标签的内部编号。长度为8的16进制数, 不能有重复'
        },
        { title: '标签名', description: '标签的识别名。可以是任意字符串' },
        {
            title: '标签图标',
            description: '标签在地图上显示的图标。值为0(人员)或1(物品)'
        },
        { title: '标签高度', description: '单位: cm' },
        {
            title: '标签属性',
            description: '可选, 标签的其他属性。例如: "性别: 女; 职位: 测试"'
        },
        {
            title: '标签类型',
            description: '1 —— 常驻标签, 2 —— 临时标签'
        }
    ];

    public downloadTemplate() {
        const body = [
            ['id', 'name', 'icon', 'height', 'content', 'type'],
            ['从这行开始填写数据', ...new Array(5).fill(' ')],
            [
                '00000003',
                'ときさき くるみ',
                0,
                140,
                'Nightmare; B85 / W59 / H87; 157',
                1
            ]
        ];
        const bodyArr = body.map(tr => {
            const trArr = tr.map(
                (td, i) =>
                    `<td ${
                        i ? '' : `style="mso-number-format:'\@'"`
                    }>${td}</td>`
            );

            return `<tr style="text-align: center">${trArr.join('')}</tr>`;
        });

        table2Excel(`
            <thead style="font-weight: 700;>
                <tr style="text-align: center">
                    ${this.tips.map(v => `<td>${v.title}</td>`).join('')}
                </tr>
            </thead>
            <tbody>${bodyArr.join('')}</tbody>
        `);
    }
}
</script>

<style lang="postcss" module>
.info-box {
    list-style: none;
    padding: 0;
    margin: 0;

    & li {
        margin-bottom: 10px;

        &:last-child {
            margin-bottom: 0;
        }
    }
}
.upload {
    margin-bottom: 20px;
}
</style>

<style lang="postcss">
.bind-item-card .el-card__header {
    background: #efefef;
}
</style>
