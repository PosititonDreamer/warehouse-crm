import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from './authorization';
export const individual = defineStore('individual', () => {

    const individual = ref([])

    const getIndividual = computed(() => individual)

    const findIndividual = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findIndividual()
            }, 250);
            return
        }
        
        const data = await fetch(`${window.requst}/api/accounting_individual.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        if (result.status) {
            individual.value = result.individuals
        }
    }

    const newIndividual = async (account, closeFunction) => {
        const {getUser} = authorization()
        const formData = new FormData()
        formData.append('title', account.title)
        formData.append('amount', account.amount)
        formData.append('type', account.type)
        const data = await fetch(`${window.requst}/api/accounting_individual.php?method=create&warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findIndividual()
            closeFunction()
        }
    }

    const updateIndividual = async (account, closeFunction) => {
        const formData = new FormData()
        formData.append('id', account.id)
        formData.append('title', account.title)
        formData.append('amount', account.amount)
        formData.append('type', account.type)
        const data = await fetch(`${window.requst}/api/accounting_individual.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findIndividual()
            closeFunction()
        }
    }

    const updateAmountIndividual = async ({id, amount}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('amount', amount)
        const data = await fetch(`${window.requst}/api/accounting_individual.php?method=update_amount`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findIndividual()
            closeFunction()
        }
    }

    const deleteIndividual = async (id, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/accounting_individual.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findIndividual()
        }
    }

    return {
        getIndividual, findIndividual, newIndividual, updateIndividual, updateAmountIndividual, deleteIndividual
    }
});