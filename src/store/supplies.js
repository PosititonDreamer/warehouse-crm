import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const Supplies = defineStore('Supplies', () => {

    const supplies = ref([])
    const suppliesProducts = ref([])
    const suppliesConnection = ref([])

    const getSupplies = computed(() => supplies)
    const getSuppliesProduct = computed(() => suppliesProducts)
    const getSupplyConnection = computed(() => suppliesConnection)

    const findSupplies = async () => {
        const data = await fetch(`${window.requst}/api/supplies.php`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            supplies.value = result.supplies
        }
    }

    const newSupplies = async (supply, closeFunction) => {
        const formData = new FormData()
        formData.append('target', supply.target)
        formData.append('where', supply.where)
        formData.append('type', supply.type)

        const data = await fetch(`${window.requst}/api/supplies.php?method=create_supplies`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()

        if (result.status) {
            await findSupplies()
            closeFunction()
        } else {
            alert(result.message)
        }
    }

    const updateDirectionSupply = async (supply, closeFunction) => {
        const formData = new FormData()
        formData.append('type', supply.type)
        formData.append('id', supply.id)

        const data = await fetch(`${window.requst}/api/supplies.php?method=update_direction_supplies`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()

        if (result.status) {
            await findSupplies()
            closeFunction()
        }
    }

    const deleteSupply = async (id) => {
        const formData = new FormData()
        formData.append('id', id)

        const data = await fetch(`${window.requst}/api/supplies.php?method=delete_supplies`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()

        if (result.status) {
            await findSupplies()
        }
    }

    const findSupplyProducts = async (id) => {
        const data = await fetch(`${window.requst}/api/supplies.php?method=find_supplies&id=${id}`, {
            method: 'GET'
        })
        const result = await data.json()

        if (result.status) {
            suppliesProducts.value = result.supplies_products
            suppliesConnection.value = result.supplies_connection
        }

    }

    const saveSupplyProducts = async (supply) => {
        const formData = new FormData()
        formData.append('id', supply.id)
        formData.append('supplies', JSON.stringify(supply.supplies))
        const data = await fetch(`${window.requst}/api/supplies.php?method=create_supplies_products`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()

        if (result.status) {
            findSupplyProducts(supply.id)
        }
    }

    return {
        getSupplies, findSupplies, newSupplies, updateDirectionSupply, deleteSupply, getSuppliesProduct, findSupplyProducts, saveSupplyProducts, getSupplyConnection
    }
});