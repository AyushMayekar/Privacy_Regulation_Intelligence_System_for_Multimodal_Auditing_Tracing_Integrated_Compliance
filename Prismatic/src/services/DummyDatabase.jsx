// NOTE (Dev-only): Dummy in-memory database for auth and internal checks.
// Use these credentials to login during development/testing:
// - Email: admin@prismatic.io
// - Password: Secure@123
//
// Internal check user (use if you want separate test identity):
// - Email: tester@prismatic.io
// - Password: Test@123

const users = [
  {
    id: 'u_admin_001',
    role: 'admin',
    name: 'Prismatic Admin',
    email: 'admin@prismatic.io',
    password: 'Secure@123',
  },
  {
    id: 'u_tester_001',
    role: 'auditor',
    name: 'QA Tester',
    email: 'tester@prismatic.io',
    password: 'Test@123',
  },
]

let activeSession = null

export function loginWithEmailPassword(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password)
      if (!user) {
        reject(new Error('Invalid credentials'))
        return
      }
      activeSession = {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: 'dev-session-token',
        createdAt: Date.now(),
      }
      resolve(activeSession)
    }, 400)
  })
}

export function loginWithGoogle() {
  return new Promise(resolve => {
    setTimeout(() => {
      const user = users[0]
      activeSession = {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: 'dev-google-session',
        createdAt: Date.now(),
      }
      resolve(activeSession)
    }, 300)
  })
}

export function getActiveSession() {
  return activeSession
}

export function logout() {
  return new Promise(resolve => {
    setTimeout(() => {
      activeSession = null
      resolve(true)
    }, 200)
  })
}


