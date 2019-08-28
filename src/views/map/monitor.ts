import Component, { mixins } from 'vue-class-component';
import TableMixin from '@/mixins/table';

import Zone from '@/components/monitor/Zone.vue';
import Group from '@/components/monitor/Group.vue';
import Census from '@/components/monitor/Census.vue';
import MonitorMixin from '@/mixins/monitor';

@Component({
    components: {
        Zone,
        Group,
        Census
    }
})
export default class Monitor extends mixins(MonitorMixin, TableMixin) {
    public groupData: { [x: string]: IBaseStation[] } = {}; // 基站分组
    public zones: IZone[] = []; // 区域列表

    // 右下工具栏列表
    public tools: ToolItem[] = [
        { name: '2D', active: true, display: true },
        { name: '3D', active: false, display: false },
        { name: '区域列表', active: false, display: true },
        { name: '分组列表', active: false, display: true },
        { name: '统计', active: false, display: true }
    ];
    public findTarget: string = ''; // 查询标签的标签号
    public isName: number = 0; // 是否通过标签名查询标签

    // ==================================dom事件
    // 切换弹窗的显示
    public swithDisplay(i: number) {
        const toolItem = this.tools[i];
        if (i < 2) {
            if (toolItem.active) {
                return;
            }

            const otherMode = this.tools[i ? 0 : 1];
            otherMode.active = !otherMode.active;

            if (this.mgr) {
                this.mgr.switchViewMode(i ? fengmap.FMViewMode.MODE_3D : fengmap.FMViewMode.MODE_2D);
            }
        }

        toolItem.active = !toolItem.active;
        if (i === 2 || i === 3) {
            const other = this.tools[i === 2 ? 3 : 2];
            if (toolItem.active) {
                other.active = false;
            }
        }
    }

    // 隐藏所有弹窗
    public hiddenCover() {
        for (let i = 2; i < this.tools.length; i++) {
            this.tools[i].active = false;
        }
    }

    // 查询标签
    public find() {
        const key = this.isName ? '标签名' : '标签号';
        if (!this.findTarget) {
            return this.$message.warning('请输入' + key);
        }
        this.showInfo(this.findTarget, this.isName);
        this.findTarget = '';
    }

    // ==================================
    protected initData() {
        this.tools[0].active = true;
        this.tools[1].active = false;

        this.findTarget = '';
        for (let i = 2; i < this.tools.length; i++) {
            this.tools[i].active = false;
        }
    }

    protected mapCreated() {
        this.tools[1].display = !!this.mgr && this.mgr.has3D;
    }

    protected setData(key: string, data: any) {
        Reflect.set(this, key, data);
    }
}

// ===========================================

interface ToolItem {
    name: string; // 显示文字
    active: boolean; // 是否激活
    display: boolean; // 是否显示
}
