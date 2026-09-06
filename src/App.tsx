import SettingsForm from './SettingsForm'
import './App.css'

function App() {
  return (
    <SettingsForm onSave={(data) => console.log('Saved:', data)} />
  )
}

export default App
