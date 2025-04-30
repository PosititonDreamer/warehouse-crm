<script>
import { ref, watch } from 'vue';
import inputData from '../../../../../hooks/inputData';
import UInput from '../../../../../components/_UIComponents/UInput/UInput.vue';
import UButton from '../../../../../components/_UIComponents/UButton/UButton.vue';
import { consumable } from '../../../../../store/consumable';

    export default {
        components: {
            UInput, UButton
        },
        props: {
            products: {
                type: Array,
                required: true
            }
        },
        setup() {
            const {newConsumble, updateConsumble, updateAmountConsumble, deleteConsumble, getConsumbale} = consumable()

            const {value: title, error: errorTitle, takedValue: takedTitle} = inputData("")
            const {value: amount, error: errorAmount, takedValue: takedAmount} = inputData(0)
            const id = ref(0)
            const openModal = ref(false)
            const pageModal = ref('')
            const accounting = ref([])

            const closeModal = () => {
                amount.value = 0
                title.value = ""
                id.value = 0
                accounting.value = []

                takedAmount.value = false
                takedTitle.value = false
                openModal.value = false
            }
        
            const submitForm = async () => {
                takedTitle.value = true
                takedAmount.value = true

                const checkTitle = !errorTitle.length && title.value.trim().length
                const checkAmount = !errorAmount.length && amount.value > -1
                

                if(checkTitle && checkAmount) {
                    const account = {title: title.value, amount: amount.value, sources: accounting.value, id: id.value}
                    if(pageModal.value === "add") {
                        await newConsumble(account, closeModal)
                        return
                    }
                    if(pageModal.value === 'editAmount') {
                        updateAmountConsumble(account, closeModal)
                        return
                    } 
                    await updateConsumble(account, closeModal)
                }
            }

            const addConsumable = () => {
                openModal.value = true
                pageModal.value = 'add'
            }

            const editConsumable = (account, page) => {
                openModal.value = true
                pageModal.value = page
                id.value = account.id

                amount.value = account.amount
                title.value = account.title
                accounting.value = account.relationship
            }

            const findItem = (id, products) => {
                return products.find(product => product.id === id)
            }

            const removeConsumable = (account) => {
                if(confirm(`Удалить ${account.title}?`)) {
                    deleteConsumble(account.id)
                }
            }

            const findProductConsumable = (product) => {
                return getConsumbale.value.filter(consumable => consumable.relationship.find(id => id === product.id)).map(item => item.title)
            }

            return {
                submitForm, openModal, closeModal, accounting, pageModal, addConsumable, getConsumbale, findItem,  editConsumable, removeConsumable,
                title, errorTitle, takedTitle,
                amount, errorAmount, takedAmount, findProductConsumable
            }
        }
    }
</script>
<template>
    <div class="accounting-consumable">
        <UButton class="accounting-consumable__button" @click="addConsumable">Добавить расходник</UButton>
        <form 
            @submit.prevent="submitForm"
            class="accounting-consumable__form"
            v-if="openModal"
        >
            <div class="accounting-consumable__content">
                <button class="accounting-consumable__close" type="button" @click="closeModal"></button>
                <UInput 
                    name="Название" 
                    v-model="title" 
                    :start-value="title"
                    :error="errorTitle"
                    @change="takedTitle = true" 
                    class="accounting-consumable__input"
                    :disabled="pageModal === 'editAmount'"
                />
                <UInput 
                    name="Количество" 
                    v-model="amount" 
                    :start-value="amount"
                    :error="errorAmount"
                    @change="takedAmount = true" 
                    class="accounting-consumable__input"
                    type="number"
                />
                <div class="accounting-consumable__list" v-if="pageModal != 'editAmount'">
                    <h2 class="accounting-consumable__sub-title">Выбрать связанный товар</h2>
                    <label class="accounting-consumable__taker" v-for="product in products">
                        <span class="accounting-consumable__checkbox">
                            <input type="checkbox" v-model="accounting" :value="product.id">
                            <span class="accounting-consumable__marker"></span>
                        </span>
                        <span>
                            {{ product.title }}, {{ product.count }} {{ product.measure_unit }} 
                            <span class="accounting-consumable__accent">
                                <span v-for="consumable in findProductConsumable(product)">{{ consumable }}</span>
                            </span>
                        </span>
                    </label>
                
                </div>
                <UButton type="submit">{{ pageModal === 'add' ? 'Добавить расходник' : 'Редактировать расходник' }}</UButton>
            </div>
        </form>
        
        <div class="accounting-consumable__table" v-if="getConsumbale.length">
                <div class="accounting-consumable__table-item accounting-consumable__table-item--head">
                    Название
                </div>
                <div class="accounting-consumable__table-item accounting-consumable__table-item--head">
                    Остаток
                </div>
                <div class="accounting-consumable__table-item accounting-consumable__table-item--head">
                    Привязанные товары
                </div>
                <div class="accounting-consumable__table-item accounting-consumable__table-item--head">
                    Действия
                </div>
                <template v-for="account in getConsumbale">
                    <div class="accounting-consumable__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['accounting-consumable__table-item', 'accounting-consumable__table-item--amount', {'accounting-consumable__table-item--few': account.amount <= 100 && account.amount > 50, 'accounting-consumable__table-item--tiny': account.amount <= 50  }]">
                        {{account.amount}}
                    </div>
                    <div :class="['accounting-consumable__table-item', 'accounting-consumable__table-item--list']">
                        <template v-if="account.relationship.length && products.length">
                            <p v-for="relationship in account.relationship">{{ findItem(relationship, products)?.title }}, {{ findItem(relationship, products)?.count}} {{ findItem(relationship, products)?.measure_unit  }}</p>
                        </template>
                        <p v-else>Нет привязанных товаров</p>
                    </div>
                    <div class="accounting-consumable__table-item">
                        <U-Button @click="editConsumable(account, 'editAmount')">Поменять остаток</U-Button>
                        <U-Button modifier="yellow" @click="editConsumable(account, 'edit')">Редактировать</U-Button>
                        <U-Button v-if="!account.relationship.length" modifier="red" @click="removeConsumable(account)">Удалить</U-Button>
                    </div>
                </template>
            </div>
            <h2 v-else class="accounting__title">Добавь расходники</h2>
    </div>
</template>
<style src="./Consumable.scss" lang="scss" scoped />