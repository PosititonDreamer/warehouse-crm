import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const ordersPayed = defineStore('ordersPayed', () => {

    const ordersPayed = ref(null)

    const getOrdersPayed = computed(() => ordersPayed)

    const findPayedOrders = async (info) => {
        const formData = new FormData()
        formData.append('min_date', `${info.min_date.getFullYear()}-${(info.min_date.getMonth() + 1).toString().padStart(2, 0)}-${info.min_date.getDate().toString().padStart(2, 0)}`)
        formData.append('user_id', info.user_id)       
        if(info.max_date) {
            formData.append('max_date', `${info.max_date.getFullYear()}-${(info.max_date.getMonth() + 1).toString().padStart(2, 0)}-${info.max_date.getDate().toString().padStart(2, 0)}`)
        } else {
            formData.append('max_date', `${info.min_date.getFullYear()}-${(info.min_date.getMonth() + 1).toString().padStart(2, 0)}-${info.min_date.getDate().toString().padStart(2, 0)}`)
        }
        const data = await fetch(`${window.requst}/api/payed.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        
        if (result.status) {
            ordersPayed.value = {
                orders: result.orders,
                orders_not_sended: result.orders_not_sended,
                orders_not_payment: result.orders_not_payment
            }
        }
    }

    const resetOrdersPayed = () => {
        ordersPayed.value = null
    }

    return {
        getOrdersPayed, findPayedOrders, resetOrdersPayed
    }
});