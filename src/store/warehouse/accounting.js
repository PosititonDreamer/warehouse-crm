import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from '../authorization';

export const accountingWarehouse = defineStore('accountingWarehouse', () => {
    const accounting = ref([])
    const accountingWeight = ref([])
    const accountingConsumble = ref([])
    const accountingIndividual = ref([])

    const warehouse = ref([])

    const getAccounting = computed(() => accounting)
    const getAccountingWeight = computed(() => accountingWeight)
    const getAccountingConsumble = computed(() => accountingConsumble)
    const getAccountingIndividual = computed(() => accountingIndividual)
    const getWarehouse = computed(() => warehouse)

    const findAccounting = async () => {
        const {getUser} = authorization()
        const data = await fetch(`${window.requst}/api/warehouse/accounting.php?id=${getUser.value.warehouse_id}`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            let resultAccounting = [];
            result.accounting.forEach((account, key) => {
                const findAccount = resultAccounting.find(item => item.title === account.title)
                if(findAccount) {
                    findAccount.products.push({
                        measure_unit: account.measure_unit,
                        count: account.count,
                        amount: account.amount,
                    })
                } else {
                    resultAccounting.push({
                        title: account.title,
                        key_start: key + 1,
                        products: [{
                            measure_unit: account.measure_unit,
                            count: account.count,
                            amount: account.amount,
                        }]
                    })
                }
            }) 
            resultAccounting.forEach(account => {
                account.products = account.products.sort((a, b) => a.count - b.count)
            })
            accountingWeight.value = result.accounting_weight         
            accounting.value = resultAccounting
            warehouse.value = result.warehouse
            accountingConsumble.value = result.accounting_consumble
            accountingIndividual.value = result.accounting_individual
        }
    }

   

    return {
        getAccounting, getAccountingConsumble, getAccountingIndividual, getAccountingWeight, getWarehouse, findAccounting
    }
});