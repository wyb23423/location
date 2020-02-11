<template>
    <div style="padding: 5%; height: 100%">
        <el-card class="card" ref="table">
            <app-table
                :max-height="maxHeight"
                :table-data="tableData"
                :col-cfg="colCfg"
                :total-count="totalCount"
                :op="[{ type: 'primary', name: 'setting', desc: '配置校准值' }]"
                :noPrint="true"
                @setting="bases = $event.children"
                @updateData="getData"
            ></app-table>
        </el-card>

        <template v-if="!!bases">
            <setting
                :visible="!!bases"
                :bases="bases"
                @refresh="refresh(false)"
                @close="bases = null"
            ></setting>
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import TableMixin from '../../mixins/table';
import CalibrationSetting from '../../components/base/CalibrationSetting.vue';
import { GET_BASE } from '../../constant/request';
import { Async } from '@/assets/utils/util';

interface GroupsWithBase {
    code: string;
    children: IBaseStation[];
    includes: string;
}

@Component({
    components: {
        setting: CalibrationSetting
    }
})
export default class Calibration extends TableMixin {
    public colCfg: any[] = [
        { prop: 'code', label: '分组编号', sortable: true },
        { prop: 'includes', label: '组内基站', width: 200 }
    ];
    public bases: IBaseStation | null = null;

    private groupsWithBase?: GroupsWithBase[];

    @Async(() => ({ count: 0, data: [] }))
    protected async fetch(page: number, pageSize: number) {
        let arr = this.groupsWithBase;
        if (!arr) {
            const res = await this.$http.get(GET_BASE, {
                pageSize: 10000000,
                currentPage: 1
            });

            this.groupsWithBase = arr = this.toTree(res.pagedData.datas);
        }

        return {
            count: arr.length,
            data: arr.slice((page - 1) * pageSize, page * pageSize)
        };
    }

    private toTree(bases: IBaseStation[]) {
        const groups = new Map<string, GroupsWithBase>();
        bases.forEach(v => {
            const group = groups.get(v.groupId);
            if (!group) {
                groups.set(v.groupId, {
                    code: v.groupId,
                    includes: v.id,
                    children: [v]
                });
            } else {
                group.includes += ',' + v.id;
                group.children.push(v);
            }
        });

        return Array.from(groups.values());
    }
}
</script>

