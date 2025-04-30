<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';

    import { ref, computed } from 'vue';
    import { users } from '../../../../store/users';
    import { warehouses } from '../../../../store/warehouses';
    export default {
        components: {
            UButton, 
            UInput
        },
        beforeCreate() {
            const { findUsers } = users()
            const { findWarehouses } = warehouses()
            findUsers()
            findWarehouses()
        },
        setup() {
            const { getUsers, updateUser, newUser, deleteUser, generateNewCode } = users()
            const { getWarehouses } = warehouses()
            const openModal = ref(false)
            const pageModal = ref("add")
            const title = ref("")
            const description = ref("")
            const id = ref(0)
            const rule = ref("")
            const warehouse = ref([
                {
                    id: Date.now(),
                    value: null
                }
            ])

            const takedTitle = ref(false)
            const takedDescription = ref(false)
            const takedRule = ref(false)

            const editUser = (user) => {
                openModal.value = true
                pageModal.value = "edit"
                title.value = user.title
                description.value = user.description
                rule.value = user.rule
                id.value = user.id 
                warehouse.value = [...user.warehouses]
                takedRule.value = false
                takedTitle.value = false
                takedDescription.value = false
            }

            const closeModal = () => {
                openModal.value = false
                pageModal.value = "add"
                title.value = ""
                rule.value = ""
                description.value = ""
                id.value = 0
                warehouse.value = [{
                    id: Date.now(),
                    value: null
                }]
                takedTitle.value = false
                takedRule.value = false
                takedDescription.value = false
            }

            const saveUser = async () => {
                if(warehouse.value.find(item => !item.value)) {
                    alert("Не все склады выбраны");
                    return
                }
                takedTitle.value = true
                takedDescription.value = true
                takedRule.value = true
                const checkTitle = !errorTitle.length && title.value.trim().length
                const checkDescription = !errorDescription.length && description.value.trim().length
                if(checkTitle && checkDescription && takedRule.value) {
                    if(pageModal.value === "add") {
                        await newUser({title: title.value, description: description.value, rule: rule.value, warehouses: warehouse.value}, closeModal)
                        return
                    }
                    await updateUser({title: title.value, description: description.value, id: id.value, rule: rule.value, warehouses: warehouse.value}, closeModal)
                }
            }

            const removeUser = ({title, id}) => {
                if(confirm(`Удалить пользователя ${title}?`)) {
                    deleteUser(id)
                }
            }

            const generateCode = ({title, id}) => {
                if(confirm(`Создать новый код для пользователя ${title}?`)) {
                    generateNewCode(id)
                }
            }

            const getTitle = computed(() => title.value)
            const getDescription = computed(() => description.value)
            const getRule = computed(() => rule.value)

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

            const errorRule = computed(() => {
                if(!rule.value.trim() && takedRule.value) {
                    return "Обязательное поле для заполнения"
                }
                return ""
            })

            const copyText = (key) => {
                navigator.clipboard.writeText(key)
                alert('Код скопирован!')
            }

            const addWarehouse = () => {
                warehouse.value.push({
                    id: Date.now(),
                    value: null
                })
            }

            const removeWarehouse = (id) => {
                warehouse.value = warehouse.value.filter(item => item.id != id)
            }

            return {
                getUsers,
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
                editUser,
                saveUser,
                removeUser,
                generateCode,
                copyText, 
                getWarehouses,
                rule, getRule, errorRule, takedRule,
                addWarehouse, warehouse, removeWarehouse
            }
        },
    }
</script>

<template>
    <div class="users">
        <h2 class="users__title">Пользователи</h2>
        <U-Button class="users__button" @click="openModal = true">Добавить пользователя</U-Button>
        <form class="users__form" @submit.prevent="saveUser" @reset="closeModal" v-if="openModal">
            <div class="users__content">
                <U-Button class="users__close" type="reset" modifier="red"></U-Button>
                <h3 class="users__sub-title">{{ pageModal === 'add' ? 'Добавление пользователя' : 'Редактирование пользователя' }}</h3>
                <U-Input class="users__input" name="Введите название пользователя" v-model="title" @blur="takedTitle = true" :error="errorTitle" :start-value="getTitle"/>
                <U-Input class="users__input" name="Выберите роль" v-model="rule" @change="takedRule = true" :error="errorRule" :start-value="getRule" view="select">
                    <option value=""></option>
                    <option value="warehouse">Сборщик</option>
                    <option value="operator">Оператор</option>
                    <option value="courier">Курьер</option>
                </U-Input>
                <div class="users__select-warehouse" v-for="item in warehouse" :key="item.id">
                    <U-Input name="Выберите склад" v-model="item.value" :start-value="item.value" view="select">
                        <option value=""></option>
                        <option v-for="ware in getWarehouses.filter(ware => ware.id === item.value || !warehouse.find(wareChild => wareChild.value === ware.id) )" :value="ware.id">{{ware.title}}</option>
                    </U-Input>
                    <U-Button class="users__warehouse-delete" type="button" modifier="red" v-if="warehouse.length > 1" @click="removeWarehouse(item.id)">Удалить</U-Button>
                </div>
                <U-Button class="users__button" type="button" v-if="getWarehouses.length > warehouse.length" @click="addWarehouse">Добавить еще один склад</U-Button>
                <U-Input class="users__input" name="Введите описание пользователя" v-model="description" @blur="takedDescription = true" :error="errorDescription" :start-value="getDescription" view="textarea"/>
                <U-Button class="users__button" type="submit">{{ pageModal === 'add' ? 'Добавить пользователя' : 'Редактировать пользователя' }}</U-Button>
            </div>
        </form>
        <div class="users__table" v-if="getUsers.length">
            <div class="users__table-item users__table-item--head">
                Название
            </div>
            <div class="users__table-item users__table-item--head">
                Описание
            </div>
            <div class="users__table-item users__table-item--head">
                Ключ
            </div>
            <div class="users__table-item users__table-item--head">
                Действия
            </div>
            <template v-for="user in getUsers">
                <div class="users__table-item">
                    {{ user.title }}
                </div>
                <div class="users__table-item">
                    {{ user.description }}
                </div>
                <button class="users__table-item" @click="copyText(user.key)">
                    {{ user.key }}
                </button>
                <div class="users__table-item">
                    <U-Button @click="generateCode({title: user.title, id: user.id})">Заменить ключ</U-Button>
                    <U-Button modifier="yellow" @click="editUser(user)">Редактировать</U-Button>
                    <U-Button modifier="red" @click="removeUser(user)">Удалить</U-Button>
                </div>
            </template>
        </div>
        <h2 v-else class="users__title">Найми людей, а то некому работать</h2>
    </div>
</template>

<style src="./Users.scss" lang="scss" scoped />