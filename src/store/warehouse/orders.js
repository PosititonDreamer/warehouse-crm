import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from '../authorization';

export const warehouseOrders = defineStore('warehouseOrders', () => {
    const orders = ref([])
    const boxes = ref([])

    const getOrders = computed(() => orders)
    const getBoxes = computed(() => boxes)
    const findOrders = async (typeOrders = 'created') => {
        const {getUser} = authorization()

        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findOrders(typeOrders)
            }, 500)
            return 
        }
        
        orders.value = []
        const formData = new FormData()
        formData.append('warehouse_id', getUser.value.warehouse_id)

        const data = await fetch(`${window.requst}/api/warehouse/orders.php?type_orders=${typeOrders}`, {
            method: 'POST',
            body: formData
        })

        const result = await data.json()
        
        if (result.status) {
           orders.value = result.orders
           boxes.value = result.boxes
        }
    }

    const finalOrder = async (id, boxes, closeFunction) => {
        const {getUser} = authorization()

        const formData = new FormData()
        formData.append('id', id)
        formData.append('user_id', getUser.value.id)
        formData.append('boxes', JSON.stringify(boxes))

        const data = await fetch(`${window.requst}/api/warehouse/submit_order.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        
        if (result.status) {
            findOrders()
            alert(`Заказ успешно собран`)
            closeFunction()
        } else {
            findOrders()
            alert(result.message)
        }
    }

    const updateStatus = async (orders, status) => {
        const formData = new FormData()
        formData.append('orders', JSON.stringify(orders))

        const data = await fetch(`${window.requst}/api/warehouse/send_order.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        
        if (result.status) {
            findOrders(status)
        }
    }

    const checkStatusOrder = async (order, openOrder, closeFunction) => {
        const formData = new FormData()
        formData.append('id', order.id)

        const data = await fetch(`${window.requst}/api/warehouse/check_status.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        
        if (result.status) {
            openOrder.value = order
        } else {
            alert(result.message)
            findOrders()
            closeFunction()
        }   
    }

    return {
        getOrders, findOrders, finalOrder, updateStatus, checkStatusOrder, getBoxes
    }
});