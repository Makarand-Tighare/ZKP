import ZKPAuthentication from './components/ZKPAuthentication'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 md:py-12">
        <ZKPAuthentication />
      </main>
      <Footer />
    </div>
  )
}

export default App
