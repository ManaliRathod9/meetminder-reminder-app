export function exportReminders(reminders, userName) {
  const data = {
    exportedAt: new Date().toISOString(),
    exportedBy: userName || 'user',
    count: reminders.length,
    reminders: reminders.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString?.() ?? r.createdAt ?? null,
      updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt ?? null,
    })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `meetminder-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const reminders = Array.isArray(data) ? data : data.reminders
        if (!Array.isArray(reminders)) {
          reject(new Error('Invalid backup format.'))
          return
        }
        resolve(reminders)
      } catch {
        reject(new Error('Could not read the file. Make sure it is a valid MeetMinder backup.'))
      }
    }
    reader.onerror = () => reject(new Error('File read error.'))
    reader.readAsText(file)
  })
}
