import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from '../authorization';

export const Supplies = defineStore('Supplies', () => {
    const supplies = ref([])
    const suppliesActive = ref([])

    const getSupplies = computed(() => supplies)
    const getSuppliesActive = computed(() => suppliesActive)

    const findSupplies = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findSupplies()
            }, 500)
            return
        }

        const data = await fetch(`${window.requst}/api/warehouse/supply_products.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET',
        })

        supplies.value = []
        const result = await data.json()

        if (result.status) {
            supplies.value = result.products
        }
    }

    const findActiveSupplies = async () => {
        const {getUser} = authorization()
        if(!getUser.value.warehouse_id) {
            setTimeout(() => {
                findActiveSupplies()
            }, 500)
            return
        }
        suppliesActive.value = []
        const data = await fetch(`${window.requst}/api/warehouse/supply_active.php?warehouse_id=${getUser.value.warehouse_id}`, {
            method: 'GET',
        })

        const result = await data.json()

        if (result.status) {
            suppliesActive.value = result.active_supply
        }
    }

    const createSupply = async (supply) => {
        const {getUser} = authorization()
        const final = {
            ...supply,
            warehouse_id: getUser.value.warehouse_id,
        }

        const formData = new FormData()
        formData.append('warehouse_id', final.target_warehouse)
        formData.append('supply', JSON.stringify(final.supply))
        formData.append('target_warehouse', final.warehouse_id)

        const data = await fetch(`${window.requst}/api/warehouse/supply_create.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()

        if (result.status) {
            findActiveSupplies()
        }
    }

    const confirmSupply = async (id, closeFunction) => {
        const formData = new FormData()
        formData.append('supply_id', id)

        const data = await fetch(`${window.requst}/api/warehouse/supply_send.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()

        if (result.status) {
            findActiveSupplies()
            closeFunction()
        }
    }

    const finishSupply = async (id, closeFunction) => {
        const formData = new FormData()
        formData.append('supply_id', id)

        const data = await fetch(`${window.requst}/api/warehouse/supply_finish.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()

        if (result.status) {
            findActiveSupplies()
            closeFunction()
        }
    }

    return {
        getSupplies,
        findSupplies,
        createSupply,
        getSuppliesActive,
        findActiveSupplies,
        confirmSupply,
        finishSupply
    }
});