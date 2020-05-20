<template>
    <v-list flat>
        <template v-for="(k, i) of keys">
            <v-list-item :key="k">
                <v-list-item-content>
                    <v-list-item-title>{{ k }}</v-list-item-title>
                </v-list-item-content>

                <v-list-item-action
                    style="flex-direction: row; align-items: center"
                >
                    <i
                        class="el-icon-edit"
                        style="margin-right: 5px"
                        @click="$emit('edit', k)"
                    ></i>
                    <i class="el-icon-close" @click="remove(k)"></i>
                </v-list-item-action>
            </v-list-item>
            <v-divider :key="i"></v-divider>
        </template>
    </v-list>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch, Emit } from 'vue-property-decorator';
import { storeError } from './Install.vue';
import { Async } from '../../../assets/utils/util';

@Component
export default class Error extends Vue {
    @Prop() public count!: number;

    public keys: string[] = [];

    public created() {
        this.updateKeys();
    }

    @Emit('remove')
    public remove(k: string) {
        storeError.removeItem(k);
    }

    @Watch('count')
    private updateKeys() {
        storeError.keys((err, keys) => (this.keys = keys));
    }
}
</script>