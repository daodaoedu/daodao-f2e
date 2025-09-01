import Navbar from './components/Navbar';
import Footer from './components/Footer';
import KeyVision from './components/Keyvision';
import './styles/All.css';
// import './styles/Reset.css';
import './styles/Index.css';
import './styles/Loader.css';
import './styles/Marquee.css';
import './styles/Carousel.css';


function Page() {

  return (
    <>
      <Navbar />
      <main>
      <KeyVision />
        
      <div style={{ height: 80 }} />
      {/* <h1>Vite + React</h1> */}

      </main>
      <Footer />
    </>
  )
}

export default Page