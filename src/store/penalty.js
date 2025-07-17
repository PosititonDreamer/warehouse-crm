import { defineStore } from 'pinia';
import {computed, ref} from 'vue';
export const penalties = defineStore('penalties', () => {

    const penalties = ref([])

    const getPenalties = computed(() => penalties)

    const findPenalties = async (params) => {
        const formData = new FormData()
        formData.append('min_date', `${params.min_date.getFullYear()}-${(params.min_date.getMonth() + 1).toString().padStart(2, 0)}-${params.min_date.getDate().toString().padStart(2, 0)}`)
        formData.append('user_id', params.user_id)
        if(params.max_date) {
            formData.append('max_date', `${params.max_date.getFullYear()}-${(params.max_date.getMonth() + 1).toString().padStart(2, 0)}-${params.max_date.getDate().toString().padStart(2, 0)}`)
        } else {
            formData.append('max_date', `${params.min_date.getFullYear()}-${(params.min_date.getMonth() + 1).toString().padStart(2, 0)}-${params.min_date.getDate().toString().padStart(2, 0)}`)
        }
        const data = await fetch(`${window.requst}/api/admin/penalty/list.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            penalties.value = {
                penalties: result.penalties,
                penalties_not_completed: result.penalties_not_completed,
                penalties_all_time_not_completed: result.penalties_all_time_not_completed,
            }
        }
    }

    const createPenalties = async (penalty, closeFunction) => {
        const formData = new FormData()
        formData.append('price', penalty.price)
        formData.append('user_id', penalty.user_id)
        formData.append('comment', penalty.comment)
        const data = await fetch(`${window.requst}/api/admin/penalty/create.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            closeFunction(true)
        }
    }

    const updatePenalties = async (penalties) => {
        const formData = new FormData()
        formData.append('penalties', JSON.stringify(penalties))
        await fetch(`${window.requst}/api/admin/penalty/completed.php`, {
            method: 'POST',
            body: formData
        })
    }

    return {
        getPenalties, findPenalties, createPenalties, updatePenalties
    }
});