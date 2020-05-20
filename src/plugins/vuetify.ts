import Vuetify, { VForm, VTextField, VSelect, VBtn, VBadge, VList } from 'vuetify/lib';
import Vue from 'vue';

Vue.use(Vuetify, {
    components: {
        VForm,
        VTextField,
        VSelect,
        VBtn,
        VBadge,
        VList
    }
});

const opts = {};

export default new Vuetify(opts);
