import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import DrumMachine from './homeworks/DrumMachine/DrumMachine'
import Piano from './homeworks/Piano/Piano'
import PUBGArena from './homeworks/PUBGArena/PUBGArena'
import styles from './App.module.css'

function Home() {
  return (
    <main className={styles.home}>
      <p className={styles.eyebrow}>Web Application Development · Lab 3</p>
      <h1>Music Studio</h1>
      <p className={styles.intro}>Choose a homework project to open.</p>
      <nav className={styles.homeworkLinks} aria-label="Lab 3 homeworks">
        <Link to="/hw1"><span>Homework 1</span><strong>Production Studio Drum Kit</strong></Link>
        <Link to="/hw2"><span>Homework 2</span><strong>88-Key Polyphonic Piano</strong></Link>
        <Link to="/hw3"><span>Homework 3</span><strong>PUBG Vietnam Arena</strong></Link>
      </nav>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hw1" element={<DrumMachine />} />
        <Route path="/hw2" element={<Piano />} />
        <Route path="/hw3" element={<PUBGArena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
