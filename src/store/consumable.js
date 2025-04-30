import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from './authorization';
export const consumable = defineStore('consumable', () => {

    const consumable = ref([])

    const getConsumbale = computed(() => consumable)

    const findConsumable = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findConsumable()
            }, 250);
            return
        }
        
        const data = await fetch(`${window.requst}/api/consumable_accounting.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        if (result.status) {
            consumable.value = result.consumables
        }
    }

    const newConsumble = async (account, closeFunction) => {
        const {getUser} = authorization()
        const formData = new FormData()
        formData.append('title', account.title)
        formData.append('amount', account.amount)
        formData.append('sources', JSON.stringify(account.sources))
        const data = await fetch(`${window.requst}/api/consumable_accounting.php?method=create&warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findConsumable()
            closeFunction()
        }
    }

    const updateConsumble = async (account, closeFunction) => {
        const formData = new FormData()
        formData.append('id', account.id)
        formData.append('title', account.title)
        formData.append('amount', account.amount)
        formData.append('sources', JSON.stringify(account.sources))
        const data = await fetch(`${window.requst}/api/consumable_accounting.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findConsumable()
            closeFunction()
        }
    }

    const updateAmountConsumble = async ({id, amount}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('amount', amount)
        const data = await fetch(`${window.requst}/api/consumable_accounting.php?method=update_amount`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findConsumable()
            closeFunction()
        }
    }

    const deleteConsumble = async (id, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/consumable_accounting.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findConsumable()
        }
    }

    return {
        getConsumbale, newConsumble, findConsumable, updateConsumble, updateAmountConsumble, deleteConsumble
    }
});