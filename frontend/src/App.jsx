import { useState, useEffect } from 'react'
import api from './api/axios'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ArrowUpRight,
  BriefcaseBusiness,
  Wallet,
  TrendingUp,
  Plus,
  Download,
  ChevronDown,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  ImagePlus
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Employees', icon: Users },
  { label: 'Departments', icon: BriefcaseBusiness },
  { label: 'Attendance', icon: CalendarDays },
  { label: 'Payroll', icon: Wallet }
]

const emptyEmployee = {
  name: '',
  email: '',
  phone: '',
  department: 'IT',
  position: '',
  salary: '',
  joiningDate: '',
  status: 'Active'
}

const emptyDepartment = {
  name: '',
  description: '',
  manager: ''
}

function App() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Employee form states
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [employeeForm, setEmployeeForm] = useState({ ...emptyEmployee })
  const [savingEmployee, setSavingEmployee] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Department states
  const [departmentList, setDepartmentList] = useState([])
  const [departmentLoading, setDepartmentLoading] = useState(false)
  const [departmentError, setDepartmentError] = useState('')
  const [showDepartmentForm, setShowDepartmentForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [departmentForm, setDepartmentForm] = useState({ ...emptyDepartment })
  const [savingDepartment, setSavingDepartment] = useState(false)

  // Attendance states
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [attendanceEmployee, setAttendanceEmployee] = useState('')
  const [attendanceStatus, setAttendanceStatus] = useState('Present')
  const [attendanceRemarks, setAttendanceRemarks] = useState('')
  const [attendanceSaving, setAttendanceSaving] = useState(false)

  // Fetch employees
  async function fetchEmployees() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/employees', {
        params: {
          page,
          limit: 10,
          search: search.trim()
        }
      })

      setEmployees(response.data.employees || [])
      setTotalEmployees(
        response.data.pagination?.totalEmployees ??
        response.data.employees?.length ??
        0
      )
      setTotalPages(response.data.pagination?.totalPages ?? 1)
    } catch (err) {
      setEmployees([])
      setError(
        err.response?.data?.message ||
        'Unable to load employees. Check your login and backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [page, search])

  // Fetch departments
  async function fetchDepartments() {
    setDepartmentLoading(true)
    setDepartmentError('')

    try {
      const response = await api.get('/departments')

      setDepartmentList(
        Array.isArray(response.data)
          ? response.data
          : response.data.departments || []
      )
    } catch (err) {
      setDepartmentError(
        err.response?.data?.message ||
        'Unable to load departments. Please login again if required.'
      )
    } finally {
      setDepartmentLoading(false)
    }
  }

  // Fetch attendance
  async function fetchAttendance() {
    setAttendanceLoading(true)
    setAttendanceError('')

    try {
      const response = await api.get('/attendance', {
        params: { date: attendanceDate }
      })

      setAttendanceRecords(response.data.attendance || [])
    } catch (err) {
      setAttendanceError(
        err.response?.data?.message || 'Unable to load attendance.'
      )
    } finally {
      setAttendanceLoading(false)
    }
  }

  useEffect(() => {
    if (active === 'Attendance') {
      fetchAttendance()
    }
  }, [active, attendanceDate])

  // Save attendance
  
  // Save attendance
  async function saveAttendance(event) {
    event.preventDefault()

    if (!attendanceEmployee) {
      window.alert('Please select an employee.')
      return
    }

    const allowedStatuses = [
      'Present',
      'Absent',
      'Late',
      'Half Day',
      'Leave'
    ]

    if (!allowedStatuses.includes(attendanceStatus)) {
      window.alert('Please select a valid attendance status.')
      return
    }

    setAttendanceSaving(true)
    setAttendanceError('')

    try {
      const response = await api.post('/attendance', {
        employee: attendanceEmployee,
        date: attendanceDate,
        status: attendanceStatus,
        remarks: attendanceRemarks.trim()
      })

      window.alert(
        response.data.message || 'Attendance saved successfully!'
      )

      setAttendanceRemarks('')
      await fetchAttendance()
    } catch (err) {
      console.error(
        'Attendance save error:',
        err.response?.data || err
      )

      setAttendanceError(
        err.response?.data?.message ||
        'Unable to save attendance. Check the backend console.'
      )

      window.alert(
        err.response?.data?.message ||
        'Unable to save attendance. Check the backend console.'
      )
    } finally {
      setAttendanceSaving(false)
    }
  }


  useEffect(() => {
    if (active === 'Departments') {
      fetchDepartments()
    }
  }, [active])

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  // Employee photo URL
  function getPhotoUrl(profilePhoto) {
    if (!profilePhoto) return ''

    if (
      profilePhoto.startsWith('http://') ||
      profilePhoto.startsWith('https://')
    ) {
      return profilePhoto
    }

    return `http://localhost:5000${
      profilePhoto.startsWith('/') ? '' : '/'
    }${profilePhoto}`
  }

  // Employee form
  function openAddEmployee() {
    setEditingEmployee(null)
    setEmployeeForm({ ...emptyEmployee })
    setSelectedPhoto(null)
    setPhotoPreview('')
    setShowEmployeeForm(true)
  }

  function openEditEmployee(employee) {
    setEditingEmployee(employee)

    setEmployeeForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || 'IT',
      position: employee.position || '',
      salary: employee.salary ?? '',
      joiningDate: employee.joiningDate
        ? String(employee.joiningDate).slice(0, 10)
        : '',
      status: employee.status || 'Active'
    })

    setSelectedPhoto(null)
    setPhotoPreview(
      employee.profilePhoto
        ? getPhotoUrl(employee.profilePhoto)
        : ''
    )
    setShowEmployeeForm(true)
  }

  function closeEmployeeForm() {
    setShowEmployeeForm(false)
    setEditingEmployee(null)
    setEmployeeForm({ ...emptyEmployee })
    setSelectedPhoto(null)
    setPhotoPreview('')
  }

  function handleEmployeeInput(event) {
    const { name, value } = event.target

    setEmployeeForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  // Save employee
  async function saveEmployee(event) {
    event.preventDefault()
    setSavingEmployee(true)
    setError('')

    try {
      const payload = {
        ...employeeForm,
        salary: Number(employeeForm.salary)
      }

      let response

      if (editingEmployee) {
        response = await api.put(
          `/employees/${editingEmployee._id}`,
          payload
        )
      } else {
        response = await api.post('/employees', payload)
      }

      const savedEmployee =
        response.data.employee || editingEmployee

      if (selectedPhoto && savedEmployee?._id) {
        const photoData = new FormData()
        photoData.append('profilePhoto', selectedPhoto)

        setUploadingPhoto(true)

        try {
          await api.post(
            `/employees/${savedEmployee._id}/photo`,
            photoData
          )
        } catch (photoError) {
          window.alert(
            photoError.response?.data?.message ||
            'Employee saved, but photo upload failed.'
          )
        } finally {
          setUploadingPhoto(false)
        }
      }

      window.alert(
        response.data.message || 'Employee saved successfully!'
      )

      closeEmployeeForm()

      if (!editingEmployee && page !== 1) {
        setPage(1)
      } else {
        await fetchEmployees()
      }
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Could not save employee.'
      )
    } finally {
      setSavingEmployee(false)
    }
  }

  // Delete employee
  async function deleteEmployee(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await api.delete(`/employees/${employee._id}`)
      window.alert('Employee deleted successfully!')

      if (employees.length === 1 && page > 1) {
        setPage(current => Math.max(1, current - 1))
      } else {
        await fetchEmployees()
      }
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Failed to delete employee.'
      )
    }
  }

  // Select employee photo
  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file.')
      event.target.value = ''
      return
    }

    setSelectedPhoto(file)

    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  // Export employees to CSV
  function exportEmployees() {
    if (!employees.length) {
      window.alert('There are no employees to export.')
      return
    }

    const headers = [
      'Name', 'Email', 'Phone', 'Department',
      'Position', 'Salary', 'Joining Date', 'Status'
    ]

    const rows = employees.map(employee => [
      employee.name,
      employee.email,
      employee.phone,
      employee.department,
      employee.position,
      employee.salary,
      employee.joiningDate
        ? new Date(employee.joiningDate).toLocaleDateString('en-IN')
        : '',
      employee.status
    ])

    const csvValue = value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`

    const csv = [headers, ...rows]
      .map(row => row.map(csvValue).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employease-employees.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Department form
  function openDepartmentForm(department = null) {
    setEditingDepartment(department)

    setDepartmentForm({
      name: department?.name || '',
      description: department?.description || '',
      manager: department?.manager || ''
    })

    setShowDepartmentForm(true)
  }

  function closeDepartmentForm() {
    setShowDepartmentForm(false)
    setEditingDepartment(null)
    setDepartmentForm({ ...emptyDepartment })
  }

  function handleDepartmentInput(event) {
    const { name, value } = event.target

    setDepartmentForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  // Save department
  async function saveDepartment(event) {
    event.preventDefault()
    setSavingDepartment(true)
    setDepartmentError('')

    try {
      const payload = {
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim(),
        manager: departmentForm.manager.trim()
      }

      let response

      if (editingDepartment) {
        response = await api.put(
          `/departments/${editingDepartment._id}`,
          payload
        )
      } else {
        response = await api.post('/departments', payload)
      }

      window.alert(
        response.data.message || 'Department saved successfully!'
      )

      closeDepartmentForm()
      await fetchDepartments()
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Unable to save department.'
      )
    } finally {
      setSavingDepartment(false)
    }
  }

  // Delete department
  async function deleteDepartment(department) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`
    )

    if (!confirmed) return

    try {
      await api.delete(`/departments/${department._id}`)
      window.alert('Department deleted successfully!')
      await fetchDepartments()
    } catch (err) {
      window.alert(
        err.response?.data?.message || 'Unable to delete department.'
      )
    }
  }

  // Dashboard statistics
  const activeEmployees = employees.filter(
    employee => employee.status === 'Active'
  ).length

  const departmentsCount = departmentList.length

  const monthlyPayroll = employees.reduce(
    (total, employee) => total + (Number(employee.salary) || 0),
    0
  )

  const stats = [
    {
      label: 'Total Employees',
      value: totalEmployees.toLocaleString('en-IN'),
      icon: Users,
      color: 'bg-violet-100 text-violet-700'
    },
    {
      label: 'Active Employees',
      value: activeEmployees.toLocaleString('en-IN'),
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      label: 'Departments',
      value: departmentsCount.toLocaleString('en-IN'),
      icon: BriefcaseBusiness,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      label: 'Monthly Payroll',
      value: `₹${monthlyPayroll.toLocaleString('en-IN')}`,
      icon: Wallet,
      color: 'bg-amber-100 text-amber-700'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                EmployEase
              </h1>
              <p className="text-xs text-slate-500">
                Employee Management
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon
              const isActive = active === item.label

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    setActive(item.label)
                    setMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto shrink-0 border-t border-slate-100 bg-white p-4">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-4 text-white">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Settings size={19} />
            </div>

            <h3 className="font-semibold">Need help?</h3>

            <p className="mt-1 text-xs leading-5 text-violet-100">
              Manage your team efficiently with EmployEase.
            </p>

            <button
              type="button"
              onClick={() =>
                window.alert('Please contact your system administrator.')
              }
              className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            >
              Get Support
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Admin User
              </p>
              <p className="truncate text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <Settings size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {active}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={event => handleSearch(event.target.value)}
                placeholder="Search employees..."
                className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                fetchEmployees()

                if (active === 'Departments') {
                  fetchDepartments()
                }

                if (active === 'Attendance') {
                  fetchAttendance()
                }
              }}
              title="Refresh data"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
            >
              <RefreshCw size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                window.alert('You are all caught up!')
              }
              title="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                A
              </div>

              <ChevronDown size={16} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard Statistics */}
          {active === 'Dashboard' && (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Dashboard Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Here's an overview of your organization's workforce.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddEmployee}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus size={18} />
                  Add Employee
                </button>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                        >
                          <Icon size={23} />
                        </div>

                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                          <ArrowUpRight size={14} />
                          Overview
                        </span>
                      </div>

                      <p className="mt-5 text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>

                      <h4 className="mt-1 text-2xl font-bold text-slate-900">
                        {stat.value}
                      </h4>

                      <p className="mt-2 text-xs text-slate-400">
                        {index === 0
                          ? 'Employees in the system'
                          : index === 1
                          ? 'Active employees on current page'
                          : index === 2
                          ? 'Available departments'
                          : 'Total salary on current page'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Employees Page */}
          {active === 'Employees' && (
            <section className="mb-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Employee Management
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    View, add, update and manage employees.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={exportEmployees}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download size={17} />
                    Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={openAddEmployee}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    <Plus size={18} />
                    Add Employee
                  </button>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative mb-5 md:hidden">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={event => handleSearch(event.target.value)}
                  placeholder="Search employees..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {error && (
                <div className="mb-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={fetchEmployees}
                    className="font-semibold underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      All Employees
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      {totalEmployees} employee(s) found
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchEmployees}
                    className="flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 sm:self-auto"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <RefreshCw
                      size={28}
                      className="animate-spin text-violet-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading employees...
                    </p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Users size={27} />
                    </div>

                    <h4 className="mt-4 font-semibold text-slate-800">
                      No employees found
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Add an employee or try a different search.
                    </p>

                    <button
                      type="button"
                      onClick={openAddEmployee}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <Plus size={17} />
                      Add Employee
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          {[
                            'Employee',
                            'Department',
                            'Position',
                            'Salary',
                            'Status',
                            'Actions'
                          ].map(heading => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {employees.map(employee => (
                          <tr
                            key={employee._id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {employee.profilePhoto ? (
                                  <img
                                    src={getPhotoUrl(employee.profilePhoto)}
                                    alt={employee.name}
                                    className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                                    {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                                  </div>
                                )}

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {employee.name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {employee.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {employee.department || '—'}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {employee.position || '—'}
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                              ₹{Number(employee.salary || 0).toLocaleString('en-IN')}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  employee.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {employee.status || 'Active'}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditEmployee(employee)}
                                  title="Edit employee"
                                  className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteEmployee(employee)}
                                  title="Delete employee"
                                  className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && employees.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Page {page} of {totalPages}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage(current => current - 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage(current => current + 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Department Management */}
          {active === 'Departments' && (
            <section className="mb-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Department Management
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create, update and manage your departments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openDepartmentForm()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Plus size={18} />
                  Add Department
                </button>
              </div>

              {departmentError && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {departmentError}
                </div>
              )}

              {departmentLoading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
                  <RefreshCw
                    size={28}
                    className="animate-spin text-violet-600"
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading departments...
                  </p>
                </div>
              ) : departmentList.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white px-5 py-16 text-center">
                  <BriefcaseBusiness
                    size={32}
                    className="mx-auto text-slate-400"
                  />

                  <h4 className="mt-4 font-semibold text-slate-800">
                    No departments found
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your first department to get started.
                  </p>

                  <button
                    type="button"
                    onClick={() => openDepartmentForm()}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Add Department
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {departmentList.map(department => (
                    <div
                      key={department._id}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                          <BriefcaseBusiness size={23} />
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            title="Edit department"
                            onClick={() => openDepartmentForm(department)}
                            className="rounded-lg p-2 text-violet-600 hover:bg-violet-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete department"
                            onClick={() => deleteDepartment(department)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <h4 className="mt-4 text-lg font-bold text-slate-900">
                        {department.name}
                      </h4>

                      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                        {department.description || 'No description provided.'}
                      </p>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Department Manager
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {department.manager || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Attendance Management */}
          {active === 'Attendance' && (
            <section className="mb-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Attendance Management
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Record and review employee attendance.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Attendance Form */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">
                  <h4 className="mb-5 font-bold text-slate-900">
                    Mark Attendance
                  </h4>

                  <form onSubmit={saveAttendance} className="space-y-4">
                    <div>
                      <label
                        htmlFor="attendanceEmployee"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Select Employee
                      </label>

                      <select
                        id="attendanceEmployee"
                        value={attendanceEmployee}
                        onChange={event =>
                          setAttendanceEmployee(event.target.value)
                        }
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="">Choose employee</option>

                        {employees.map(employee => (
                          <option
                            key={employee._id}
                            value={employee._id}
                          >
                            {employee.name}
                          </option>
                        ))}
                      </select>

                      <p className="mt-1 text-xs text-slate-400">
                        Employees loaded on the current page are shown.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="attendanceDate"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Date
                      </label>

                      <input
                        id="attendanceDate"
                        type="date"
                        value={attendanceDate}
                        onChange={event =>
                          setAttendanceDate(event.target.value)
                        }
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="attendanceStatus"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Attendance Status
                      </label>

                      <select
                        id="attendanceStatus"
                        value={attendanceStatus}
                        onChange={event =>
                          setAttendanceStatus(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="attendanceRemarks"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Remarks
                      </label>

                      <textarea
                        id="attendanceRemarks"
                        rows={3}
                        value={attendanceRemarks}
                        onChange={event =>
                          setAttendanceRemarks(event.target.value)
                        }
                        placeholder="Optional remarks..."
                        className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={attendanceSaving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={17} />
                      {attendanceSaving ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </form>
                </div>

                {/* Attendance Records */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Attendance Records
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Records for the selected date
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchAttendance}
                      className="flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <RefreshCw size={15} />
                      Refresh
                    </button>
                  </div>

                  {attendanceError && (
                    <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      {attendanceError}
                    </div>
                  )}

                  {attendanceLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <RefreshCw
                        size={27}
                        className="animate-spin text-violet-600"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading attendance...
                      </p>
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                      <CalendarDays
                        size={32}
                        className="mx-auto text-slate-400"
                      />

                      <h4 className="mt-4 font-semibold text-slate-800">
                        No attendance records
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        No records were found for this date.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            {['Employee', 'Date', 'Status', 'Remarks'].map(
                              heading => (
                                <th
                                  key={heading}
                                  className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                >
                                  {heading}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {attendanceRecords.map(record => {
                            const employeeName =
                              record.employee?.name ||
                              record.employeeName ||
                              employees.find(
                                employee =>
                                  employee._id ===
                                  (record.employee?._id || record.employee)
                              )?.name ||
                              'Unknown Employee'

                            return (
                              <tr
                                key={record._id}
                                className="hover:bg-slate-50"
                              >
                                <td className="px-4 py-4 text-sm font-medium text-slate-800">
                                  {employeeName}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                  {record.date
                                    ? String(record.date).slice(0, 10)
                                    : attendanceDate}
                                </td>

                                <td className="px-4 py-4">
                                                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      record.status === 'Present'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : record.status === 'Absent'
                                        ? 'bg-rose-50 text-rose-700'
                                        : record.status === 'Late'
                                        ? 'bg-amber-50 text-amber-700'
                                        : record.status === 'Half Day'
                                        ? 'bg-orange-50 text-orange-700'
                                        : record.status === 'Leave'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-500">
                                  {record.remarks || '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Employee Add/Edit Modal */}
          {showEmployeeForm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter the employee details below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeEmployeeForm}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={saveEmployee}
                  className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-6"
                >
                  {/* Profile Photo */}
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Employee preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus size={27} className="text-slate-400" />
                      )}
                    </div>

                    <div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <ImagePlus size={16} />
                        Choose Photo

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-2 text-xs text-slate-400">
                        Choose an image file for the employee profile.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="employeeName"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Full Name *
                      </label>

                      <input
                        id="employeeName"
                        name="name"
                        type="text"
                        value={employeeForm.name}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="Enter full name"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeeEmail"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Email *
                      </label>

                      <input
                        id="employeeEmail"
                        name="email"
                        type="email"
                        value={employeeForm.email}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeePhone"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Phone
                      </label>

                      <input
                        id="employeePhone"
                        name="phone"
                        type="tel"
                        value={employeeForm.phone}
                        onChange={handleEmployeeInput}
                        placeholder="Enter phone number"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeeDepartment"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Department *
                      </label>

                      <select
                        id="employeeDepartment"
                        name="department"
                        value={employeeForm.department}
                        onChange={handleEmployeeInput}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>

                        {departmentList.map(department => (
                          <option
                            key={department._id}
                            value={department.name}
                          >
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="employeePosition"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Position *
                      </label>

                      <input
                        id="employeePosition"
                        name="position"
                        type="text"
                        value={employeeForm.position}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="e.g. Software Developer"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeeSalary"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Monthly Salary (₹) *
                      </label>

                      <input
                        id="employeeSalary"
                        name="salary"
                        type="number"
                        min="0"
                        value={employeeForm.salary}
                        onChange={handleEmployeeInput}
                        required
                        placeholder="e.g. 25000"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeeJoiningDate"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Joining Date *
                      </label>

                      <input
                        id="employeeJoiningDate"
                        name="joiningDate"
                        type="date"
                        value={employeeForm.joiningDate}
                        onChange={handleEmployeeInput}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="employeeStatus"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Status
                      </label>

                      <select
                        id="employeeStatus"
                        name="status"
                        value={employeeForm.status}
                        onChange={handleEmployeeInput}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeEmployeeForm}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingEmployee || uploadingPhoto}
                      className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={17} />

                      {uploadingPhoto
                        ? 'Uploading Photo...'
                        : savingEmployee
                        ? 'Saving...'
                        : editingEmployee
                        ? 'Update Employee'
                        : 'Save Employee'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        
          {/* Department Add/Edit Modal */}
          {showDepartmentForm && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingDepartment
                        ? 'Edit Department'
                        : 'Add Department'}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter your department details.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeDepartmentForm}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={saveDepartment} className="space-y-5 p-5 sm:p-6">
                  <div>
                    <label
                      htmlFor="departmentName"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Department Name *
                    </label>

                    <input
                      id="departmentName"
                      name="name"
                      type="text"
                      value={departmentForm.name}
                      onChange={handleDepartmentInput}
                      required
                      placeholder="e.g. Information Technology"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="departmentDescription"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="departmentDescription"
                      name="description"
                      rows={3}
                      value={departmentForm.description}
                      onChange={handleDepartmentInput}
                      placeholder="Describe this department..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="departmentManager"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Department Manager
                    </label>

                    <input
                      id="departmentManager"
                      name="manager"
                      type="text"
                      value={departmentForm.manager}
                      onChange={handleDepartmentInput}
                      placeholder="Enter manager name"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  {departmentError && (
                    <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                      {departmentError}
                    </p>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeDepartmentForm}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingDepartment}
                      className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={17} />

                      {savingDepartment
                        ? 'Saving...'
                        : editingDepartment
                        ? 'Update Department'
                        : 'Save Department'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Payroll Page */}
          {active === 'Payroll' && (
            <section className="mb-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Payroll Overview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review employee salary information.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Wallet size={24} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Total Monthly Payroll
                  </p>

                  <h4 className="mt-1 text-3xl font-bold text-slate-900">
                    ₹{monthlyPayroll.toLocaleString('en-IN')}
                  </h4>

                  <p className="mt-2 text-xs text-slate-400">
                    Based on employees currently loaded.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Users size={24} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Employees Loaded
                  </p>

                  <h4 className="mt-1 text-3xl font-bold text-slate-900">
                    {employees.length}
                  </h4>

                  <p className="mt-2 text-xs text-slate-400">
                    Employees on the current page.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Employee Salary Details
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Salary information for loaded employees.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={exportEmployees}
                    className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
                  >
                    <Download size={17} />
                    Export CSV
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-violet-600"
                    />
                    Loading payroll data...
                  </div>
                ) : employees.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">
                    No employee salary records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          {[
                            'Employee',
                            'Department',
                            'Position',
                            'Monthly Salary'
                          ].map(heading => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {employees.map(employee => (
                          <tr
                            key={employee._id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {employee.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {employee.email}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {employee.department || '—'}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {employee.position || '—'}
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-900">
                              ₹{Number(employee.salary || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot className="border-t-2 border-slate-100 bg-slate-50">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-5 py-4 text-sm font-bold text-slate-800"
                          >
                            Total on Current Page
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-violet-700">
                            ₹{monthlyPayroll.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Dashboard Recent Employees */}
          {active === 'Dashboard' && (
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Employees
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    A quick look at your employee records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActive('Employees')}
                  className="flex items-center gap-2 self-start text-sm font-semibold text-violet-600 hover:text-violet-800 sm:self-auto"
                >
                  View All Employees
                  <ArrowUpRight size={16} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
                  <RefreshCw
                    size={20}
                    className="animate-spin text-violet-600"
                  />
                  Loading employees...
                </div>
              ) : employees.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    No employees available yet.
                  </p>

                  <button
                    type="button"
                    onClick={openAddEmployee}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Add Your First Employee
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          'Employee',
                          'Department',
                          'Position',
                          'Status'
                        ].map(heading => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {employees.slice(0, 5).map(employee => (
                        <tr
                          key={employee._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {employee.profilePhoto ? (
                                <img
                                  src={getPhotoUrl(employee.profilePhoto)}
                                  alt={employee.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                                  {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {employee.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {employee.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {employee.department || '—'}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {employee.position || '—'}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                employee.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {employee.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Footer */}
          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} EmployEase. All rights reserved.
            </p>

            <p>
              Employee Management Dashboard
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App

