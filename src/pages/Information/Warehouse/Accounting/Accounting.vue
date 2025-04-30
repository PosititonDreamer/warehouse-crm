<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';
    import { accountingWarehouse } from '../../../../store/warehouse/accounting';
    import { authorization } from '../../../../store/authorization';
    import { watch, ref } from 'vue';
    import Counter from '../../../../components/Counter/Counter.vue';

    export default {
        components: {
            UButton, 
            UInput,
            Counter
        },
        setup() {
            const { getAccounting, getWarehouse, getAccountingIndividual, getAccountingConsumble, getAccountingWeight, findAccounting } = accountingWarehouse()
            const { getUser } = authorization()

            const checkUser = () => {
                if(getUser?.value?.id) {
                    findAccounting()
                }
            }
            checkUser()

            watch(getUser, checkUser)

            return {
               getAccounting, getWarehouse, getAccountingWeight, getAccountingIndividual, getAccountingConsumble
            }
        },
    }
</script>

<template>
    <div class="warehouse">
        <h2 class="warehouse__title">{{getWarehouse.title}}</h2>
        <div class="warehouse__content">
            <h3 class="warehouse__sub-title">Фасованные товары</h3>
            <div class="warehouse__table" v-if="getAccounting.length">
                <div class="warehouse__table-item warehouse__table-item--head">
                    Название
                </div>
                <div class="warehouse__table-item warehouse__table-item--head">
                    Упаковка
                </div>
                <div class="warehouse__table-item warehouse__table-item--head">
                    Остаток
                </div>
                <template v-for="account in getAccounting">
                    <div class="warehouse__table-item warehouse__table-item--big" :style="[{'--row-start': account.key_start + 1, '--row-end': account.key_start + 1 + account.products.length}]">
                        {{ account.title }}
                    </div>
                    <template v-for="product in account.products">
                        <div class="warehouse__table-item warehouse__table-item--center">
                            {{ product.count }} {{ product.measure_unit }}
                        </div>
                        <div :class="['warehouse__table-item warehouse__table-item--center', {'warehouse__table-item--few': product.amount <= 50 && product.amount > 10, 'warehouse__table-item--tiny': product.amount <= 10}]">
                            {{ product.amount }}
                        </div>
                    </template>
                    
                </template>
            </div>
            <h3 class="warehouse__sub-title">Весовые товары</h3>
            <div class="warehouse__table warehouse__table--weight" v-if="getAccountingWeight.length">
                <div class="warehouse__table-item warehouse__table-item--head">
                    Название
                </div>
                <div class="warehouse__table-item warehouse__table-item--head">
                    Остаток
                </div>
                <template v-for="account in getAccountingWeight">
                    <div class="warehouse__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['warehouse__table-item warehouse__table-item--center', {'warehouse__table-item--few': account.amount <= 5000 && account.amount > 1000, 'warehouse__table-item--tiny': account.amount <= 1000}]">
                        {{ account.amount }} {{ account.measure_unit }}
                    </div>
                </template>
            </div>
            <h3 class="warehouse__sub-title">Расходники</h3>
            <div class="warehouse__table warehouse__table--weight" v-if="getAccountingConsumble.length">
                <div class="warehouse__table-item warehouse__table-item--head">
                    Название
                </div>
                <div class="warehouse__table-item warehouse__table-item--head">
                    Остаток
                </div>
                <template v-for="account in getAccountingConsumble">
                    <div class="warehouse__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['warehouse__table-item warehouse__table-item--center', {'warehouse__table-item--few': account.amount <= 100 && account.amount > 50, 'warehouse__table-item--tiny': account.amount <= 50}]">
                        {{ account.amount }} 
                    </div>
                </template>
            </div>

            <h3 class="warehouse__sub-title">Коробки и мелочь</h3>
            <div class="warehouse__table warehouse__table--weight" v-if="getAccountingIndividual.length">
                <div class="warehouse__table-item warehouse__table-item--head">
                    Название
                </div>
                <div class="warehouse__table-item warehouse__table-item--head">
                    Остаток
                </div>
                <template v-for="account in getAccountingIndividual">
                    <div class="warehouse__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['warehouse__table-item warehouse__table-item--center', {'warehouse__table-item--few': account.amount <= 100 && account.amount > 50, 'warehouse__table-item--tiny': account.amount <= 50}]">
                        {{ account.amount }} 
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
 
<style src="./Accounting.scss" lang="scss" scoped />