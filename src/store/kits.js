import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const kits = defineStore('kits', () => {

    const kits = ref([])
    const products = ref([])
    const accounting = ref([])

    const getKits = computed(() => kits)
    const getProducts = computed(() => products)
    const getAccounting = computed(() => accounting)

    const findKits = async () => {
        const data = await fetch(`${window.requst}/api/admin/kits/list.php`, {
            method: 'GET'
        })
        const result = await data.json()

        if (result.status) {
            products.value = result.products
            accounting.value = result.accounting
            kits.value = result.kits.map(kit => {
                kit.accounting = kit.accounting.map(accountKit => {
                    accountKit.product_id = result.accounting.find(account => account.id === accountKit.accounting_id).product_id
                    accountKit.count = +accountKit.count
                    return accountKit
                })
                return kit
            })
        }
    }

    const createNewKit = async (kit) => {
        const formData = new FormData()
        formData.append('title', kit.title)
        formData.append('number', kit.number)
        formData.append('accounting', JSON.stringify(kit.accounting))
        const data = await fetch(`${window.requst}/api/admin/kits/create.php`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()
        if(result.status) {
            findKits()
            return true
        } else {
            alert(result.message)
            return false
        }
    }

    const changeKit = async (kit) => {
        const formData = new FormData()
        formData.append('title', kit.title)
        formData.append('id', kit.id)
        formData.append('number', kit.number)
        formData.append('accounting', JSON.stringify(kit.accounting))
        const data = await fetch(`${window.requst}/api/admin/kits/update.php`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()
        if(result.status) {
            findKits()
            return true
        } else {
            alert(result.message)
            return false
        }
    }

    const removeKit = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/admin/kits/delete.php`, {
            method: 'POST',
            body: formData,
        })
        const result = await data.json()
        if(result.status) {
            findKits()
            return true
        }
    }

    return {
        getKits,
        getProducts,
        getAccounting,
        findKits,
        createNewKit,
        changeKit,
        removeKit
    }
});