import Vue from 'vue';
import Component from 'vue-class-component';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import { ZONE_SEPARATOR } from '@/constant';

@Component
export default class DisplayMixin extends Vue {
    public mgr?: FengMapMgr | PIXIMgr;
    public operation: any[] = [
        {
            type: { default: 'primary' },
            name: 'display',
            desc: { default: '显示' }
        }
    ];

    // 切换显示的按钮配置name
    // 用于获取按钮配置对象
    protected displayName = 'display';
    protected switchDesc = '隐藏'; // 切换后按钮上显示的文字

    /**
     * 切换显示
     */
    public display<T extends Record<string, any>>(row: T, index: number, isDel?: boolean) {
        const operation = this.getOperation();
        const i = operation.findIndex(v => v.name === this.displayName);
        if (i > -1) {
            const op = operation[i];
            if (op.type[row.id] || isDel) {
                op.type[row.id] = undefined;
                this.remove(row);
            } else {
                op.type[row.id] = 'success';
                this.show(row);
            }
            op.desc[row.id] = op.desc[row.id] || isDel ? undefined : this.switchDesc;

            this.$set(operation, i, op);
        }

        return this;
    }

    protected getOperation() {
        return this.operation;
    }

    protected remove<T extends Record<string, any>>(row: T) {
        this.mgr && this.mgr.remove(row.id + ZONE_SEPARATOR + row.name);
    }

    protected show<T extends Record<string, any>>(row: T) {
        this.mgr && this.mgr.zoneOpen(<any>row);
    }
}
