import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { weight } from './weight';
import { authorization } from './authorization';
export const accounting = defineStore('accounting', () => {

    const accounting = ref([])

    const getAccounting = computed(() => accounting)
    
    const {findWeight} = weight()

    const findAccounting = async () => {
        accounting.value = []
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findAccounting()
            }, 250);
            return
        }
        const data = await fetch(`${window.requst}/api/accounting.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            const names = [];
            let resultAccounting = [];

            result.accounting.forEach(account => {
                if(!names.find(name => name === account.title)) {
                    names.push(account.title)
                }
            })

            names.forEach(name => {
                const products = result.accounting.filter(account => account.title === name)
                products.sort((a,b) => a.count - b.count)
                resultAccounting = [...resultAccounting, ...products];
            })
            
            accounting.value = resultAccounting
        }
    }

    const newAccounting = async (account, closeFunction) => {
        const {getUser} = authorization()
        const formData = new FormData()
        formData.append('product_id', account.product_id)
        formData.append('warehouse_id', getUser.value.warehouse_id)
        formData.append('measure_unit', account.measure_unit)
        formData.append('article', account.article)
        formData.append('count', account.count)
        formData.append('amount', account.amount)
        formData.append('weight_id', account.weight_id)
        const data = await fetch(`${window.requst}/api/accounting.php?method=create`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findAccounting()
            findWeight()
            closeFunction()
        }
    }

    const updateAccounting = async (account, closeFunction) => {
        const formData = new FormData()
        formData.append('id', account.id)
        formData.append('product_id', account.product_id)
        formData.append('warehouse_id', account.warehouse_id)
        formData.append('measure_unit', account.measure_unit)
        formData.append('article', account.article)
        formData.append('count', account.count)
        formData.append('amount', account.amount)
        formData.append('weight_id', account.weight_id)
        const data = await fetch(`${window.requst}/api/accounting.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findAccounting()
            findWeight(account.warehouse_id)
            closeFunction()
        }
    }

    const updateAmountAccounting = async ({id, amount}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('amount', amount)
        const data = await fetch(`${window.requst}/api/accounting.php?method=update_amount`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findAccounting()
            closeFunction()
        }
    }

    const deleteAccounting = async (id, warehouse_id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/accounting.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            accounting.value = accounting.value.filter(account => account.id !== id);
            findWeight(warehouse_id)
        }
    }

    return {
        getAccounting, findAccounting, newAccounting, updateAccounting, deleteAccounting, updateAmountAccounting
    }
});