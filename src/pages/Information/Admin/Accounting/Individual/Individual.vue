<script>
import { ref, watch } from 'vue';
import inputData from '../../../../../hooks/inputData';
import UInput from '../../../../../components/_UIComponents/UInput/UInput.vue';
import UButton from '../../../../../components/_UIComponents/UButton/UButton.vue';
import { individual } from '../../../../../store/individual';

    export default {
        components: {
            UInput, UButton
        },
        setup() {
            const {getIndividual, newIndividual, updateIndividual, updateAmountIndividual, deleteIndividual} = individual()

            const {value: title, error: errorTitle, takedValue: takedTitle} = inputData("")
            const {value: amount, error: errorAmount, takedValue: takedAmount} = inputData(0)
            const id = ref(0)
            const openModal = ref(false)
            const pageModal = ref('')
            const accounting = ref([])
            const typeIndividual = ref("box")

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
                    const account = {title: title.value, amount: amount.value, type: typeIndividual.value, id: id.value}
                    if(pageModal.value === "add") {
                        await newIndividual(account, closeModal)
                        return
                    }
                    if(pageModal.value === 'editAmount') {
                        updateAmountIndividual(account, closeModal)
                        return
                    } 
                    await updateIndividual(account, closeModal)
                }
            }

            const addIndividual = () => {
                openModal.value = true
                pageModal.value = 'add'
            }

            const editIndividual = (account, page) => {
                openModal.value = true
                pageModal.value = page
                id.value = account.id

                amount.value = account.amount
                title.value = account.title
                accounting.value = account.relationship
            }

            const removeIndividual = (account) => {
                if(confirm(`Удалить ${account.title}?`)) {
                    deleteIndividual(account.id)
                }
            }

            const findTpe = (needType) => {
                const types = [
                    {
                        type: 'magnet',
                        text: 'Магнит'
                    },
                    {
                        type: 'box',
                        text: 'Коробка'
                    },
                ]

                return types.find(type => type.type === needType)?.text
            }

            return {
                submitForm, openModal, closeModal, accounting, pageModal, addIndividual, getIndividual, editIndividual, removeIndividual, findTpe, typeIndividual,
                title, errorTitle, takedTitle,
                amount, errorAmount, takedAmount,
            }
        }
    }
</script>
<template>
    <div class="accounting-individual">
        <h2 class="accounting-individual__title">Мелочь и коробки</h2>
        <UButton class="accounting-individual__button" @click="addIndividual">Добавить мелочевку</UButton>
        <form 
            @submit.prevent="submitForm"
            class="accounting-individual__form"
            v-if="openModal"
        >
            <div class="accounting-individual__content">
                <button class="accounting-individual__close" type="button" @click="closeModal"></button>
                <UInput 
                    name="Название" 
                    v-model="title" 
                    :start-value="title"
                    :error="errorTitle"
                    @change="takedTitle = true" 
                    class="accounting-individual__input"
                    :disabled="pageModal === 'editAmount'"
                />
                <UInput 
                    name="Количество" 
                    v-model="amount" 
                    :start-value="amount"
                    :error="errorAmount"
                    @change="takedAmount = true" 
                    class="accounting-individual__input"
                    type="number"
                />
                <UInput 
                    name="Тип" 
                    v-model="typeIndividual" 
                    :start-value="typeIndividual"
                    class="accounting-individual__input"
                    :disabled="true"
                    view="select"
                >
                    <option value="box">Коробка</option>
                </UInput>
                <UButton type="submit">{{ pageModal === 'add' ? 'Добавить мелочевку' : 'Редактировать мелочевку' }}</UButton>
            </div>
        </form>
        <div class="accounting-individual__table" v-if="getIndividual.length">
                <div class="accounting-individual__table-item accounting-individual__table-item--head">
                    Название
                </div>
                <div class="accounting-individual__table-item accounting-individual__table-item--head">
                    Остаток
                </div>
                <div class="accounting-individual__table-item accounting-individual__table-item--head">
                    Вид
                </div>
                <div class="accounting-individual__table-item accounting-individual__table-item--head">
                    Действия
                </div>
                <template v-for="account in getIndividual">
                    <div class="accounting-individual__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['accounting-individual__table-item', 'accounting-individual__table-item--amount', {'accounting-individual__table-item--few': account.amount <= 100 && account.amount > 50, 'accounting-individual__table-item--tiny': account.amount <= 50  }]">
                        {{account.amount}}
                    </div>
                    <div :class="['accounting-individual__table-item', 'accounting-individual__table-item--amount']">
                        {{findTpe(account.type)}}
                    </div>
                    <div class="accounting-individual__table-item">
                        <U-Button @click="editIndividual(account, 'editAmount')">Поменять остаток</U-Button>
                        <U-Button modifier="yellow" @click="editIndividual(account, 'edit')">Редактировать</U-Button>
                        <U-Button v-if="account.type !== 'magnet'" modifier="red" @click="removeIndividual(account)">Удалить</U-Button>
                    </div>
                </template>
            </div>
            <h2 v-else class="accounting__title">Добавь мелочевку</h2>
    </div>
</template>
<style src="./Individual.scss" lang="scss" scoped />