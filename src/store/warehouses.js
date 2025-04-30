import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const warehouses = defineStore('warehouses', () => {

    const warehouses = ref([])

    const getWarehouses = computed(() => {
        return warehouses
    })

    const findWarehouses = async () => {
        const data = await fetch(`${window.requst}/api/warehouses.php`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            warehouses.value = result.warehouses
        }
    }

    const newWarehouse = async ({title, description, rule}, closeFunction) => {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('rule', rule)
        const data = await fetch(`${window.requst}/api/warehouses.php?method=create`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            warehouses.value.push(result.warehouse)
            closeFunction()
        }
    }

    const updateWarehouse = async ({title, id, description, rule}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('title', title)
        formData.append('description', description)
        formData.append('rule', rule)
        const data = await fetch(`${window.requst}/api/warehouses.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findWarehouses()
            closeFunction()
        }

    }

    const deleteWarehouse = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/warehouses.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            warehouses.value = warehouses.value.filter(warehouse => warehouse.id !== id);
        }
    }

    return {
        getWarehouses, findWarehouses, newWarehouse, updateWarehouse, deleteWarehouse
    }
});