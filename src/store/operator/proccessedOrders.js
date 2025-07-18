import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const processedOrders = defineStore('processedOrders', () => {

    const processedOrders = ref({})

    const getProcessedOrders = computed(() => processedOrders)

    const findProcessedOrders = async () => {
        const res = await fetch(`${window.requst}/api/others_order_proccessed.php`, {
            method: 'GET'
        })
        const data = await res.json()
        if(data.status) {
            processedOrders.value = data.orders
        }
    }

    const updateProcessedOrders = async (data) => {
        const formData = new FormData()
        formData.append('data', JSON.stringify(data))
        const res = await fetch(`${window.requst}/api/operator/update_orders.php`, {
            method: 'POST',
            body: formData
        })
        const result = await res.json()
        if(result.status) {
            alert('Заказы успешно обработаны')
            findProcessedOrders()
        }
    }

    return {
        getProcessedOrders, findProcessedOrders,updateProcessedOrders
    }
});