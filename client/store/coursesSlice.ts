import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Course {
  id: number
  titre: string
  niveau: string
  matiere: string
  description?: string
  enseignant_id?: number
  enseignant_nom?: string
  video_url?: string
  pdf_url?: string
  created_at: string
}

interface CoursesState {
  courses: Course[]
  currentCourse: Course | null
  loading: boolean
  filters: {
    niveau?: string
    matiere?: string
    search?: string
  }
}

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  loading: false,
  filters: {}
}

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<CoursesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    }
  }
})

export const { setCourses, setCurrentCourse, setLoading, setFilters, clearFilters } = coursesSlice.actions
export default coursesSlice.reducer
