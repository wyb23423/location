import Vuetify, { VForm, VTextField, VSelect, VBtn } from 'vuetify/lib';
import Vue from 'vue';

Vue.use(Vuetify, {
    components: {
        VForm,
        VTextField,
        VSelect,
        VBtn
    }
});

const opts = {};

export default new Vuetify(opts);
