import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '../router/router';
export const authorization = defineStore('authorization', () =>  {
    const user = ref(null)
    
    const getUser = computed(() => {
        return user
    })

    const login = async (key, auth = false) => {
        const formData = new FormData()
        formData.append(`key`, key)
        const data = await fetch(`${window.requst}/api/auth.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if(result.status) {
            user.value = result.user
            localStorage.setItem('user-key', key)
            
            if(auth) {
                router.push({name: `information`})
            }
        } else {
            localStorage.removeItem('user-key')
        }
    }

    const logout = () => {
        localStorage.removeItem('user-key')
        user.value = null
        router.push({name: `Auth`})
    }

    const changeWarehouse = (warehouse_id) => {
        if(user.value.rule === 'super') {
            user.value.warehouse_id = warehouse_id
        }
    }

    return {
        login, logout, getUser, changeWarehouse
    }
});