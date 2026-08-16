// web/src/api/comic.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export default {
  async getComics() {
    const res = await api.get('/comics')
    return res.data
  },

  async getComic(id) {
    const res = await api.get(`/comics/${id}`)
    return res.data
  },

  async createComic(data) {
    const res = await api.post('/comics', data)
    return res.data
  },

  async updateComic(id, data) {
    const res = await api.put(`/comics/${id}`, data)
    return res.data
  },

  async generateCover(id, data = {}) {
    const res = await api.post(`/comics/${id}/generate-cover`, data)
    return res.data
  },

  async deleteComic(id) {
    const res = await api.delete(`/comics/${id}`)
    return res.data
  },
}
