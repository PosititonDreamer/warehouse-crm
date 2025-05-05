import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { accounting } from './accounting';
import { authorization } from './authorization';

export const weight = defineStore('weight', () => {
    const weights = ref([])
    const composites = ref([])

    const getWeight = computed(() => weights)
    const getComposites = computed(() => composites)


    const findWeight = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findWeight()
            }, 250);
            return
        }
        const data = await fetch(`${window.requst}/api/weights.php?id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            weights.value = result.weights
            composites.value = result.composite
        }
    }

    const newWeight = async (weight, closeFunction) => {
        const { findAccounting } = accounting()
        const {getUser} = authorization()
        const formData = new FormData()
        formData.append('product_id', weight.product_id)
        formData.append('amount', weight.amount)
        formData.append('warehouse_id', getUser.value.warehouse_id)
        formData.append('composite', weight.composite)
        formData.append('compositeProducts', JSON.stringify(weight.compositeProducts))
        const data = await fetch(`${window.requst}/api/weights.php?method=create`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findWeight(weight.warehouse_id)
            findAccounting()
            closeFunction()
        }
    }

    const updateWeights = async (weight, closeFunction) => {
        const { findAccounting } = accounting()
        const formData = new FormData()
        const {getUser} = authorization()
        formData.append('warehouse_id', getUser.value.warehouse_id)
        formData.append('product_id', weight.product_id)
        formData.append('amount', weight.amount)
        formData.append('id', weight.id)
        formData.append('composite', weight.composite)
        formData.append('compositeProducts', JSON.stringify(weight.compositeProducts))
        const data = await fetch(`${window.requst}/api/weights.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findWeight(weight.warehouse_id)
            findAccounting()
            closeFunction()
        }
    }

    const updateAmountWeight = async ({id, amount, warehouse_id}, closeFunction) => {
        const { findAccounting } = accounting()
        const formData = new FormData()
        formData.append('id', id)
        formData.append('amount', amount)
        const data = await fetch(`${window.requst}/api/weights.php?method=update_amount`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findWeight(warehouse_id)
            findAccounting()
            closeFunction()
        }
    }

    const deleteWeight = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/weights.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            weights.value = weights.value.filter(product => product.id !== id);
        }
    }

    return {
        getWeight, getComposites, findWeight, newWeight, updateWeights, deleteWeight, updateAmountWeight
    }
});