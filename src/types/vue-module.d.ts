declare module 'vue-cropper' {
    const VueCropper: any;
    export = VueCropper;
}

declare module 'vue-worker' {
    const VueWorker: any;
    export = VueWorker;
}

declare module '@/components/Notice.vue' {
    import Vue from 'vue';
    export const errorStore: LocalForage;
    export default Vue;
}
