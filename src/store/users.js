import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
export const users = defineStore('users', () => {

    const users = ref([])

    const getUsers = computed(() => {
        return users
    })

    const findUsers = async () => {
        const data = await fetch(`${window.requst}/api/users.php`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            users.value = result.users
        }
    }

    const newUser = async ({title, description, warehouse_id, rule}, closeFunction) => {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('warehouse_id', warehouse_id)
        formData.append('rule', rule)
        formData.append('description', description)
        const data = await fetch(`${window.requst}/api/users.php?method=create`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            users.value.push(result.user)
            closeFunction()
        }
    }

    const updateUser = async ({title, id, description, warehouse_id, rule}, closeFunction) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('warehouse_id', warehouse_id)
        formData.append('rule', rule)
        formData.append('title', title)
        formData.append('description', description)
        const data = await fetch(`${window.requst}/api/users.php?method=update`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            findUsers()
            closeFunction()
        }

    }

    const deleteUser = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/users.php?method=delete`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            users.value = users.value.filter(user => user.id !== id);
        }
    }

    const generateNewCode = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        const data = await fetch(`${window.requst}/api/users.php?method=new_code`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
           findUsers()
        }
    }

    return {
        getUsers, findUsers, newUser, updateUser, deleteUser, generateNewCode
    }
});