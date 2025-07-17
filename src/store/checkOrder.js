import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const checkOrder = defineStore('checkOrder', () => {

    const loading = ref({
        tilda: false,
        processed: false,
        other: false
    })

    const getLoading = computed(() => loading.value.tilda && loading.value.processed&& loading.value.other)

    const checkTildaOrder = async () => {
        await fetch(`${window.requst}/api/tilda_check_order.php`, {
            method: 'GET'
        })
            .then(() => {
                loading.value.tilda = true;
            })
            .catch(() => {
                loading.value.tilda = true;
            })
    }

    const checkOtherOrderProcessed = async () => {
        await fetch(`${window.requst}/api/others_order_proccessed.php`, {
            method: 'GET'
        })
            .then(() => {
                loading.value.other = true;

            })
            .catch(() => {
                loading.value.other = true;
            })
    }
    const checkOrderProcessed = async () => {
        await fetch(`${window.requst}/api/check_orders_proccessed.php`, {
            method: 'GET'
        })
            .then(() => {
                loading.value.processed = true;

            })
            .catch(() => {
                loading.value.processed = true;
            })
    }

    return {
        getLoading, checkTildaOrder, checkOrderProcessed, checkOtherOrderProcessed
    }
});