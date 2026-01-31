'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface User {
  email: string
  name?: string
  role: 'user' | 'admin' | 'superadmin'
  verified?: boolean
  createdAt?: string
  blocked?: boolean
  blockedAt?: string
  blockedReason?: string
  isProtected?: boolean
}

interface Stats {
  total: number
  verified: number
  unverified: number
  blocked: number
  admins: number
}

type FilterType = 'all' | 'verified' | 'unverified' | 'blocked' | 'admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, unverified: 0, blocked: 0, admins: 0 })
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Модалка
  const [modal, setModal] = useState<{
    isOpen: boolean
    type: 'block' | 'delete' | null
    user: User | null
  }>({ isOpen: false, type: null, user: null })
  const [blockReason, setBlockReason] = useState('')
  const [deleteContent, setDeleteContent] = useState(false)

  // Загрузка пользователей
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        filter,
        ...(search && { search }),
      })

      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      
      // Проверяем формат ответа (новый или старый)
      if (data.users) {
        setUsers(data.users)
        setStats(data.stats || stats)
      } else if (Array.isArray(data)) {
        setUsers(data)
        // Считаем статистику вручную
        setStats({
          total: data.length,
          verified: data.filter((u: User) => u.verified).length,
          unverified: data.filter((u: User) => !u.verified).length,
          blocked: data.filter((u: User) => u.blocked).length,
          admins: data.filter((u: User) => u.role === 'admin' || u.role === 'superadmin').length,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Выполнить действие
  const handleAction = async (email: string, action: string, reason?: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action, reason }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Action failed')
        return
      }
      
      fetchUsers()
      closeModal()
    } catch (error) {
      alert('Failed to perform action')
    }
  }

  // Удалить пользователя
  const handleDelete = async () => {
    if (!modal.user) return
    
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: modal.user.email, 
          deleteContent 
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Delete failed')
        return
      }
      
      fetchUsers()
      closeModal()
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: null, user: null })
    setBlockReason('')
    setDeleteContent(false)
  }

  // Форматирование даты
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">👥 User Management</h1>
            <p className="text-gray-500">Manage users, verify accounts, handle blocks</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            {isLoading ? '⏳' : '🔄'} Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-600">Verified</p>
            <p className="text-2xl font-bold text-green-700">{stats.verified}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-600">Unverified</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.unverified}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-600">Blocked</p>
            <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-600">Admins</p>
            <p className="text-2xl font-bold text-purple-700">{stats.admins}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search by name or email..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'verified', 'unverified', 'blocked', 'admin'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors
                    ${filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {f === 'admin' ? '👑 Admins' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              ⏳ Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.email} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                        ${user.blocked ? 'bg-red-100' : 
                          user.role === 'superadmin' ? 'bg-yellow-100' :
                          user.role === 'admin' ? 'bg-purple-100' :
                          user.verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {user.blocked ? '🚫' : 
                         user.role === 'superadmin' ? '⭐' :
                         user.role === 'admin' ? '👑' : '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name || 'No name'}</p>
                          {user.isProtected && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              🔒 Protected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">Joined {formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-4">
                      {/* Status Badges */}
                      <div className="flex flex-col gap-1 items-end">
                        {user.blocked ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            🚫 Blocked
                          </span>
                        ) : user.verified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            ○ Unverified
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs
                          ${user.role === 'superadmin' ? 'bg-yellow-100 text-yellow-700' :
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                          {user.role === 'superadmin' ? '⭐ Superadmin' :
                           user.role === 'admin' ? '👑 Admin' : 'User'}
                        </span>
                        {user.blockedReason && (
                          <p className="text-xs text-red-500 max-w-[150px] truncate" title={user.blockedReason}>
                            {user.blockedReason}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!user.isProtected && (
                        <div className="flex items-center gap-1">
                          {/* Verify/Unverify */}
                          {!user.blocked && (
                            <button
                              onClick={() => handleAction(user.email, user.verified ? 'unverify' : 'verify')}
                              className={`p-2 rounded-lg transition-colors
                                ${user.verified ? 'hover:bg-yellow-100 text-yellow-600' : 'hover:bg-green-100 text-green-600'}`}
                              title={user.verified ? 'Remove verification' : 'Verify'}
                            >
                              {user.verified ? '✗' : '✓'}
                            </button>
                          )}

                          {/* Admin toggle */}
                          {!user.blocked && user.role !== 'superadmin' && (
                            <button
                              onClick={() => handleAction(user.email, user.role === 'admin' ? 'remove_admin' : 'make_admin')}
                              className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                              title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            >
                              👑
                            </button>
                          )}

                          {/* Block/Unblock */}
                          <button
                            onClick={() => {
                              if (user.blocked) {
                                handleAction(user.email, 'unblock')
                              } else {
                                setModal({ isOpen: true, type: 'block', user })
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors
                              ${user.blocked ? 'hover:bg-green-100 text-green-600' : 'hover:bg-red-100 text-red-600'}`}
                            title={user.blocked ? 'Unblock' : 'Block'}
                          >
                            {user.blocked ? '🔓' : '🔒'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setModal({ isOpen: true, type: 'delete', user })}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {modal.isOpen && modal.user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              {modal.type === 'block' ? (
                <>
                  <h3 className="text-lg font-bold mb-2">🔒 Block User</h3>
                  <p className="text-gray-600 mb-4">
                    Block <strong>{modal.user.name || modal.user.email}</strong>?
                    <br />
                    <span className="text-sm text-gray-500">They won't be able to submit content.</span>
                  </p>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Reason for blocking (optional)"
                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(modal.user!.email, 'block', blockReason)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Block User
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-2">⚠️ Delete User</h3>
                  <p className="text-gray-600 mb-4">
                    Delete <strong>{modal.user.name || modal.user.email}</strong>?
                    <br />
                    <span className="text-sm text-red-500">This cannot be undone.</span>
                  </p>
                  <label className="flex items-center gap-2 mb-4 cursor-pointer p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={deleteContent}
                      onChange={(e) => setDeleteContent(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Also delete all user's groups and businesses
                    </span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
