<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';

    import { ref, computed } from 'vue';
    import { warehouses } from '../../../../store/warehouses';

    export default {
        components: {
            UButton, 
            UInput
        },
        beforeCreate() {
            const { findWarehouses } = warehouses()
            findWarehouses()
        },
        setup() {
            const { getWarehouses, newWarehouse, deleteWarehouse, updateWarehouse } = warehouses()
            const openModal = ref(false)
            const pageModal = ref("add")
            const title = ref("")
            const description = ref("")
            const rule = ref("commodity")
            const id = ref(0)
            const takedTitle = ref(false)
            const takedDescription = ref(false)

            const closeModal = () => {
                openModal.value = false
                pageModal.value = "add"
                title.value = ""
                description.value = ""
                rule.value = "commodity"
                id.value = 0
                takedTitle.value = false
                takedDescription.value = false
            }

            const editWarehouse = (warehouse) => {
                openModal.value = true
                pageModal.value = "edit"
                title.value = warehouse.title
                description.value = warehouse.description
                rule.value = warehouse.rule
                id.value = warehouse.id
                takedTitle.value = false
                takedDescription.value = false
                
            }

            const saveWarehouse = async () => {
                takedTitle.value = true
                takedDescription.value = true
                const checkTitle = !errorTitle.length && title.value.trim().length
                const checkDescription = !errorDescription.length && description.value.trim().length
                if(checkTitle && checkDescription) {
                    if(pageModal.value === "add") {
                        await newWarehouse({title: title.value, description: description.value, rule: rule.value}, closeModal)
                        return
                    }
                    await updateWarehouse({title: title.value, description: description.value, id: id.value, rule: rule.value}, closeModal)
                }
            }

            const removeWarehouse = ({title, id}) => {
                if(confirm(`Удалить склад ${title}?`)) {
                    deleteWarehouse(id)
                }
            }

            const getTitle = computed(() => title.value)
            const getDescription = computed(() => description.value)

            const errorTitle = computed(() => {
                if(!title.value.trim() && takedTitle.value) {
                    return "Обязательное поле для заполнения"
                }
                return ""
            })

            const errorDescription = computed(() => {
                if(!description.value.trim() && takedDescription.value) {
                    return "Обязательное поле для заполнения"
                }
                return ""
            })

            return {
                openModal, 
                pageModal,
                takedTitle, 
                takedDescription, 
                errorTitle,
                errorDescription,
                title, 
                description,
                closeModal,
                getTitle, 
                getDescription,
                editWarehouse,
                saveWarehouse,
                removeWarehouse,
                rule, 
                getWarehouses,
            }
        },
    }
</script>

<template>
    <div class="users">
        <h2 class="users__title">Склады</h2>
        <U-Button class="users__button" @click="openModal = true">Добавить Склад</U-Button>
        <form class="users__form" @submit.prevent="saveWarehouse" @reset="closeModal" v-if="openModal">
            <div class="users__content">
                <U-Button class="users__close" type="reset" modifier="red"></U-Button>
                <h3 class="users__sub-title">{{ pageModal === 'add' ? 'Добавление склада' : 'Редактирование склада' }}</h3>
                <U-Input class="users__input" name="Введите название склада" v-model="title" @blur="takedTitle = true" :error="errorTitle" :start-value="getTitle"/>
                <U-Input class="users__input" name="Введите описание склада" v-model="description" @blur="takedDescription = true" :error="errorDescription" :start-value="getDescription" view="textarea"/>
                <U-Input class="users__input" name="Выберите тип склада" v-model="rule" @blur="takedDescription = true"  :start-value="rule" view="select">
                    <option value="commodity">Товарный</option>
                    <option value="feedstock">Сырьевой</option>
                </U-Input>
                <U-Button class="users__button" type="submit">{{ pageModal === 'add' ? 'Добавить склад' : 'Редактировать склад' }}</U-Button>
            </div>
        </form>
        <div class="users__table" v-if="getWarehouses.length">
            <div class="users__table-item users__table-item--head">
                Название
            </div>
            <div class="users__table-item users__table-item--head">
                Описание
            </div>
            <div class="users__table-item users__table-item--head">
                Тип
            </div>
            <div class="users__table-item users__table-item--head">
                Действия
            </div>
            <template v-for="warehouse in getWarehouses">
                <div class="users__table-item">
                    {{ warehouse.title }}
                </div>
                <div class="users__table-item">
                    {{ warehouse.description }}
                </div>
                <div class="users__table-item">
                    {{ warehouse.rule === "commodity" ? "Товарный" : "Сырьевой" }}
                </div>
                <div class="users__table-item">
                    <U-Button modifier="yellow" @click="editWarehouse(warehouse)">Редактировать</U-Button>
                    <U-Button modifier="red" @click="removeWarehouse(warehouse)">Удалить</U-Button>
                </div>
            </template>
        </div>
        <h2 v-else class="users__title">Арендуй склад, где хранить продукцию то?</h2>
    </div>
</template>

<style src="./Warehouses.scss" lang="scss" scoped />