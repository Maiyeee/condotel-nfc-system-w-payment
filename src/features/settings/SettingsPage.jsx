import { useEffect, useState } from 'react'
import { Building2, Bell, CreditCard, Save, Shield, Users, RotateCcw } from 'lucide-react'
import SettingsSection from './SettingsSection'
import SettingField from './SettingField'
import ToggleSetting from './ToggleSetting'
import UserManagement from './UserManagement'
import { DEFAULT_SETTINGS, loadSettings, saveSettings, resetSettings } from './settingsStorage'

const TABS = [
  ['property','Property',Building2], ['users','Users & Access',Users],
  ['payments','Payments',CreditCard], ['notifications','Notifications',Bell],
  ['security','Security',Shield],
]

export default function SettingsPage() {
  const [settings,setSettings]=useState(loadSettings)
  const [tab,setTab]=useState('property')
  const [saved,setSaved]=useState(false)
  useEffect(()=>setSaved(false),[tab])
  const update=(section,field,value)=>setSettings(s=>({...s,[section]:{...s[section],[field]:value}}))
  const save=()=>{saveSettings(settings);setSaved(true);setTimeout(()=>setSaved(false),2000)}
  const reset=()=>setSettings(resetSettings())
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Configure property information, users, payments, notifications, and security.</p></div>
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-60"><div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map(([id,label,Icon])=><button key={id} type="button" onClick={()=>setTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${tab===id?'bg-navy-900 text-white':'text-slate-600 hover:bg-slate-50'}`}><Icon className="h-4 w-4"/>{label}</button>)}
      </div><button type="button" onClick={reset} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600"><RotateCcw className="h-4 w-4"/>Reset Demo Settings</button></aside>
      <main className="min-w-0 flex-1"><div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div><div className="text-xs uppercase tracking-wide text-slate-400">Phase 6</div><div className="font-semibold text-slate-900">Settings</div></div><button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white"><Save className="h-4 w-4"/>Save Changes</button></div>
      {saved&&<div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Settings saved successfully.</div>}
      {tab==='property'&&<SettingsSection title="Property Information" description="Basic information used by the condotel system."><div className="grid gap-5 md:grid-cols-2">
        <SettingField label="Property Name" value={settings.property.name} onChange={v=>update('property','name',v)}/><SettingField label="Property Code" value={settings.property.code} onChange={v=>update('property','code',v)}/><SettingField label="Email" type="email" value={settings.property.email} onChange={v=>update('property','email',v)}/><SettingField label="Phone" value={settings.property.phone} onChange={v=>update('property','phone',v)}/><SettingField label="Address" value={settings.property.address} onChange={v=>update('property','address',v)} className="md:col-span-2"/><SettingField label="Currency" value={settings.property.currency} onChange={v=>update('property','currency',v)}/><SettingField label="Timezone" value={settings.property.timezone} onChange={v=>update('property','timezone',v)}/></div></SettingsSection>}
      {tab==='users'&&<UserManagement/>}
      {tab==='payments'&&<SettingsSection title="Payment Provider Settings" description="Enable payment methods. Keep real secret keys on the backend."><div className="space-y-3"><SettingField label="Currency" value={settings.payments.currency} onChange={v=>update('payments','currency',v)}/><SettingField label="Environment" value={settings.payments.environment} onChange={v=>update('payments','environment',v)}/><ToggleSetting label="Card Payments" checked={settings.payments.cardEnabled} onChange={v=>update('payments','cardEnabled',v)}/><ToggleSetting label="GCash" checked={settings.payments.gcashEnabled} onChange={v=>update('payments','gcashEnabled',v)}/><ToggleSetting label="Maya" checked={settings.payments.mayaEnabled} onChange={v=>update('payments','mayaEnabled',v)}/><ToggleSetting label="Bank Transfer" checked={settings.payments.bankTransferEnabled} onChange={v=>update('payments','bankTransferEnabled',v)}/></div></SettingsSection>}
      {tab==='notifications'&&<SettingsSection title="Notification Preferences" description="Configure system notification preferences."><div className="space-y-3"><ToggleSetting label="Reservation Notifications" checked={settings.notifications.reservations} onChange={v=>update('notifications','reservations',v)}/><ToggleSetting label="Payment Notifications" checked={settings.notifications.payments} onChange={v=>update('notifications','payments',v)}/><ToggleSetting label="NFC Access Alerts" checked={settings.notifications.nfcAlerts} onChange={v=>update('notifications','nfcAlerts',v)}/><ToggleSetting label="Availability Alerts" checked={settings.notifications.availability} onChange={v=>update('notifications','availability',v)}/><ToggleSetting label="Email Notifications" checked={settings.notifications.email} onChange={v=>update('notifications','email',v)}/></div></SettingsSection>}
      {tab==='security'&&<SettingsSection title="Security Settings" description="Configure session and security options."><div className="space-y-3"><ToggleSetting label="Admin-only Settings" checked={settings.security.adminOnly} onChange={v=>update('security','adminOnly',v)}/><ToggleSetting label="Session Timeout" checked={settings.security.sessionTimeoutEnabled} onChange={v=>update('security','sessionTimeoutEnabled',v)}/><SettingField label="Session Timeout (minutes)" type="number" value={settings.security.sessionTimeoutMinutes} onChange={v=>update('security','sessionTimeoutMinutes',Number(v)||0)}/><ToggleSetting label="Audit Logging" checked={settings.security.auditLogging} onChange={v=>update('security','auditLogging',v)}/></div></SettingsSection>}</main>
    </div>
  </div>
}
export { DEFAULT_SETTINGS }
