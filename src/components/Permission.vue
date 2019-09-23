<template>
    <el-tree
        ref="tree"
        :load="loadNode"
        :props="{ isLeaf: 'isLeaf' }"
        :default-checked-keys="defaultChecked"
        show-checkbox
        lazy
        node-key="id"
    >
    </el-tree>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { TreeNode, TreeData, ElTree } from 'element-ui/types/tree';

@Component
export default class Permission extends Vue {
    @Prop() public role?: string;

    private readonly oneLevels: string[] = [
        'admin',
        'fence',
        'camera',
        'protocol',
        'base',
        'tag',
        'map',
        'alarm'
    ];

    public get defaultChecked() {
        if (!this.role) {
            return this.oneLevels;
        }

        const chcked: string[] = [];
        let role: IJson = {};
        try {
            role = JSON.parse(this.role);
        } catch (e) {
            console.error(e);
        }

        this.oneLevels.forEach(k => {
            const permissions: string[] = [];
            ['put', 'delete', 'post', 'get'].forEach(r => {
                if (
                    role[k] &&
                    (role[k][r] ||
                        (Array.isArray(role[k]) && role[k].includes(r)))
                ) {
                    permissions.push(`${k}:${r}`);
                }
            });

            if (permissions.length === 4) {
                chcked.push(k);
            } else {
                chcked.push(...permissions);
            }
        });

        return chcked;
    }

    public loadNode(
        node: TreeNode<string, TreeData>,
        resolve: (data: TreeData[]) => void
    ) {
        if (node.level === 0) {
            return resolve([
                { label: '管理员设置', id: 'admin' },
                { label: '区域管理', id: 'fence' },
                { label: '摄像机管理', id: 'camera' },
                { label: '通信协议', id: 'protocol' },
                { label: '设备管理', id: 'base' },
                { label: '标签管理', id: 'tag' },
                { label: '地图管理', id: 'map' },
                { label: '警报信息', id: 'alarm' }
            ]);
        }
        if (node.level > 1) {
            return resolve([]);
        }

        resolve([
            { label: '增', id: node.key + ':put', isLeaf: true },
            { label: '删', id: node.key + ':delete', isLeaf: true },
            { label: '改', id: node.key + ':post', isLeaf: true },
            { label: '查', id: node.key + ':get', isLeaf: true }
        ]);
    }

    public parse() {
        const tree = <ElTree<string, TreeData>>this.$refs.tree;
        const oneLevelKeys = tree.getCheckedKeys();
        const twoLevelKeys = tree.getCheckedKeys(true);

        const permission: IJson = {};
        this.oneLevels.forEach(k => {
            permission[k] = {
                put: true,
                delete: true,
                post: true,
                get: true
            };
            if (!oneLevelKeys.includes(k)) {
                Object.keys(permission[k]).forEach(role => {
                    if (!twoLevelKeys.includes(`${k}:${role}`)) {
                        permission[k][role] = false;
                    }
                });
            }
        });

        return permission;
    }
}
</script>

<style lang="postcss" module>
</style>

