/**
 * 区域设置
 */

import Component, { mixins } from 'vue-class-component';
import { State } from 'vuex-class/lib/bindings';
import { ZoneMode } from '@/store';
import { FengMapMgr } from '@/assets/map/fengmap';
import { PIXIMgr } from '@/assets/map/pixi';
import ZoneMixin from './index';
import { Async } from '@/assets/utils/util';

@Component
export class Setting extends mixins(ZoneMixin) {
    public zone: ZoneData = Object.create({}); // 设置中的区域
    public isSetting: boolean = false;

    // ==================================
    public mgr?: FengMapMgr | PIXIMgr;
    public points: Vector3[] = [];
    // ======================================
    @State protected readonly zoneMode!: ZoneMode;

    // 用于存储打开设置模式时地图上的状态
    private enterPointsStatus?: Vector3[];

    // 更新区域数据\
    @Async()
    public async update() {
        if (this.isVaild(this.zone.name, this.zone.mode) !== true) {
            return;
        }
        await this.$confirm('确定修改区域??');

        const data = this.assignZone(this.zone);
        if (!data) {
            return;
        }

        await this.$http
            .post('/api/zone/updateZone', data, { 'Content-Type': 'application/json' });

        this.refresh(false).$message.success('修改区域信息成功');
    }

    // 确定坐标设置
    public surePositionSetting() {
        this.ok(true);
        if (this.enterPointsStatus) {
            this.isSetting = true;
        }
    }

    // 取消坐标设置
    public async cancelPositionSetting() {
        const confirm = await this.cancel();
        if (confirm && this.enterPointsStatus) {
            this.isSetting = true;
        }
    }

    // 打开设置界面
    public openSetting(zone: ZoneData, index: number) {
        this.enterPointsStatus = [...this.points];
        this.switchZone(<Vector2[]>zone.position, false);

        this.zone = zone;
        this.isSetting = true;

        this.display(zone, index, true);
    }

    // 从设置的界面进入设置坐标的模式
    public enterSettingMode() {
        this.isSetting = false;
        this.enterDrawingMode();
    }

    // 取消设置
    public cancelSetting() {
        this.isSetting = false;
        this.switchZone(this.enterPointsStatus || [], true);
        this.enterPointsStatus = undefined;
    }

    // ===================================
    public display(row: IZone, index: number, isDel?: boolean) {
        return this;
    }
    protected refresh(isRemove: boolean = true, page?: number) {
        return this;
    }
    // ========================================

    protected isVaild(name: string, mode: number) {
        if (!name) {
            return this.$message.error('区域名称不能为空');
        }

        const pointsCount = this.points.length;
        if (pointsCount < 3) {
            return this.$message.warning('区域坐标最少设置3个');
        }

        if (mode === this.zoneMode.switch && pointsCount !== 4) {
            return this.$message.warning('切换区域坐标必须为4个');
        }

        return true;
    }

    // 组织用于提交数据
    protected assignZone(zone: ZoneData): IZone | false {
        if (!this.mgr) {
            this.$message.error('地图不存在, 提交失败!');
            return false;
        }

        return Object.assign({}, zone, {
            position: JSON.stringify(this.points.map(v => this.mgr!.getCoordinate(v))),
            enable: zone.open ? 1 : 0,
            mapId: this.mapId
        });
    }

    // 切换地图上的地图显示
    private switchZone(position: Vector23[], isMapCoor: boolean) {
        if (this.mgr) {
            this.remove(); // 移除现有区域
            position.forEach(v => this.drawIcon(v, isMapCoor)); // 添加点
            this.ok(false); // 添加线
        }
    }
}

export type ZoneData = IZone & { open: boolean; status: '开启' | '关闭' };
