import { db } from '@/firebase'
import type { User } from '@/models'
import { collection, getDocs, query, where } from '@firebase/firestore'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

function throwError(error: { code: string }) {
  throw error.code
}

export const usePeopleStore = defineStore('people', {
  state: () => ({
    _people: [] as User[],
    _person: {} as User
  }),

  getters: {
    getPeople: (state) => state._people,
    getPerson: (state) => state._person,
    getRouteUsername() {
      const route = useRoute()
      return route.params.username as User['username']
    }
  },

  actions: {
    async fetchPeople() {
      await getDocs(collection(db, 'users'))
        .then((querySnapshot) => {
          this._people = querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })) as User[]
        })
        .catch(throwError)
    },

    async fetchPersonAndBooks() {
      const q = query(collection(db, 'users'), where('username', '==', this.getRouteUsername))

      await getDocs(q)
        .then((firebasePerson) => {
          this._person = { uid: firebasePerson.docs[0].id, ...firebasePerson.docs[0].data() } as User
        })
        .catch(throwError)

      this.fetchBooks(this._person.uid)
    },

    async fetchBooks(personUid: User['uid']) {
      await getDocs(collection(db, 'users', personUid, 'books'))
        .then((querySnapshot) => {
          this._person.books = querySnapshot.docs.map((doc) => doc.data()) as User['books']
        })
        .catch(throwError)
    }
  }
})
