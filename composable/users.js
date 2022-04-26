import { ref, useContext, computed, readonly } from "@nuxtjs/composition-api";


export default function useUsers() {
    const { $api, $auth } = useContext()
    const userObj = ref({})
    const avatar = ref({})

    const setUser = (user) => {
        userObj.value = {
            email: user.email,
            name: user.fullName,
            avatarurl: $auth.user.picture,
            role: user.role,
            id: user.team_id,
            auth_id: user.auth_id
        }
    }
    
    const fetchUser = () => {
        if ($auth.loggedIn) {
            const options = {
                params: {
                    id: $auth.user.sub
                }
            }
            $api.$get(`/api/employees/${$auth.user.email}`, options).then((res) => {
                setUser(res)
            })
        }
    }
    return {
        userObj: readonly(userObj),
        fetchUser,
        userObj
    }
}