import DeveloperCard from './components/DeveloperCard.jsx'

const sampleMetrics = {
  Specialty: 'Frontend engineering',
  'Game rank': 'Diamond',
  Experience: '5 years',
}

const sampleSkills = [
  { id: 'react', name: 'React', level: 'Advanced' },
  { id: 'javascript', name: 'JavaScript', level: 'Advanced' },
  { id: 'accessibility', name: 'Accessibility', level: 'Intermediate' },
  { id: 'strategy', name: 'Team strategy', level: 'Expert' },
]

function App() {
  return (
    <DeveloperCard
      fullName="Alex Morgan"
      role="Frontend Developer & Pro Gamer"
      avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=192&h=192&q=80"
      metrics={sampleMetrics}
      skills={sampleSkills}
    />
  )
}

export default App
