import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const products = defineStore('products', () => {

    const products = ref([])

    const getProducts = computed(() => {
        return products
    })

    const findProducts = async () => {
        const data = await fetch(`${window.requst}/api/products.php`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            products.value = result.products
        }
    }

    const newProduct = async (title, closeFunction) => {
        const formData = new FormData()
        formData.append('title', title)
        const data = await fetch(`${window.requst}/api/products.php?method=create`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            products.value.push(result.product)
            closeFunction()
        }
    }

    const updateProducts = async ({title, id}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('title', title)
        const data = await fetch(`${window.requst}/api/products.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findProducts()
            closeFunction()
        }

    }

    const deleteProduct = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/products.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            products.value = products.value.filter(product => product.id !== id);
        }
    }

    return {
        getProducts, findProducts, newProduct, updateProducts, deleteProduct
    }
});