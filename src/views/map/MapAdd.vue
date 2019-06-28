<template>
    <div style="padding-left: 5%; padding-top: 3%;">
        <h3 style="color: #009688;">
            地图添加
        </h3>
        <map-form @submit="onSubmit"></map-form>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import MapEdit from '@/components/MapEdit.vue';

@Component({
    components: {
        'map-form': MapEdit
    }
})
export default class MapAdd extends Vue {
    public onSubmit(data: any) {
        console.log(data);
    }
}
</script>
 