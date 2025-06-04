import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from './authorization';
export const payed = defineStore('payed', () => {

    const salary = ref([])
    const minDate = ref('')

    const getSalary = computed(() => salary)
    const getMinDate = computed(() => minDate)

    const findSalary = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findSalary()
            }, 250);
            return
        }
        
        const data = await fetch(`${window.requst}/api/salary.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            salary.value = result.salary
        }
    }

    const updateSalary = async (salar, closeFunction) => {
        const formData = new FormData()
        formData.append('id', salar.id)
        formData.append('salary', salar.salary)
        const data = await fetch(`${window.requst}/api/salary.php?method=change_salary`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findSalary()
            closeFunction()
        }
    }

    const findMinDate = async () => {
        const data = await fetch(`${window.requst}/api/payed.php?method=find_min_date`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            minDate.value = result.min_date
        }
    }

    const paymentOrders = async (orders, findOrders) => {
        const formData = new FormData()
        formData.append('orders', JSON.stringify(orders)) 

        const data = await fetch(`${window.requst}/api/salary.php?method=payment_orders`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findOrders()
        }
    }
 

    return {
        getSalary, findSalary, updateSalary, findMinDate, getMinDate, paymentOrders
    }
});