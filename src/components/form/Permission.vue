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
import { ALL_PERMISSION } from '@/constant';

const permissionItemKeys = ['put', 'delete', 'post', 'get'] as Array<
    'put' | 'delete' | 'post' | 'get'
>;
@Component
export default class Permission extends Vue {
    @Prop() public role?: string;

    private readonly oneLevels = Object.keys(
        ALL_PERMISSION
    ) as PermissionKeys[];

    public get defaultChecked() {
        if (!this.role) {
            return this.oneLevels;
        }

        const chcked: string[] = [];
        let role = <PermissionAll>{};
        try {
            role = JSON.parse(this.role);
        } catch (e) {
            console.error(e);
        }

        role.tag = role.tag || role.people;
        this.oneLevels.forEach(k => {
            const permissions: string[] = [];
            permissionItemKeys.forEach(r => {
                if (role[k] && role[k][r]) {
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
                { label: '区域管理', id: 'zone' },
                { label: '分组管理', id: 'group' },
                { label: '标签跟随/远离报警', id: 'bundle' },
                { label: '摄像机管理', id: 'camera' },
                { label: '通信协议', id: 'protocol' },
                { label: '电子围栏报警', id: 'tagZone' },
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
            { label: '增加', id: node.key + ':put', isLeaf: true },
            { label: '删除', id: node.key + ':delete', isLeaf: true },
            { label: '编辑', id: node.key + ':post', isLeaf: true },
            { label: '查询', id: node.key + ':get', isLeaf: true }
        ]);
    }

    public parse() {
        const tree = <ElTree<string, TreeData>>this.$refs.tree;
        const oneLevelKeys = tree.getCheckedKeys();
        const twoLevelKeys = tree.getCheckedKeys(true);

        const permission = {} as PermissionAll;
        this.oneLevels.forEach(k => {
            permission[k] = {
                put: true,
                delete: true,
                post: true,
                get: true
            };
            if (!oneLevelKeys.includes(k)) {
                permissionItemKeys.forEach(role => {
                    if (!twoLevelKeys.includes(`${k}:${role}`)) {
                        permission[k][role] = false;
                    }
                });
            }
        });

        permission.people = permission.tag;

        return permission;
    }
}
</script>
