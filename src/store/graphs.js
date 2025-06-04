import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const graphs = defineStore('graphs', () => {
    const minDate = ref('')
    const graphs = ref(null)
    const getMinDate = computed(() => minDate)
    const getGraphs = computed(() => graphs)
    const findMinDate = async () => {
        const data = await fetch(`${window.requst}/api/graphs_min_date.php`, {
            method: 'GET'
        })
        const result = await data.json()

        if (result.status) {
            minDate.value = result.min_date
        }
    }

    const findGraphs = async (date) => {
        const formData = new FormData()
        formData.append('date_min', date.minDate)
        formData.append('date_max', date.maxDate)

        const data = await fetch(`${window.requst}/api/graphs.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()

        if (result.status) {
            let names = []
            Object.values(result.data.products).forEach(item => {
                if (!names.find(name => item.title === name)) {
                    names.push(item.title)
                }
            })

            names = names.sort((a, b) => a.localeCompare(b))
            const finalProducts = [];
            names.forEach((name) => {
                let products = Object.values(result.data.products).filter(product => product.title === name);
                products = products.sort((a, b) => a.count - b.count)
                products.forEach((product) => {
                    finalProducts.push(`${product.title}, ${product.count} ${product.measure_unit}`)
                })
            })



            result.data.finalProducts = finalProducts;
            graphs.value = result.data
        }
    }

    const resetGraphs = () => {
        graphs.value = null
    }

    return {
        findMinDate, getMinDate, findGraphs, getGraphs, resetGraphs
    }
});