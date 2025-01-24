import React from 'react';

function Home() {
  return (
    <div className="home">
      <h1>Yali Sommer</h1>
      
      <section className="home-section">
        <h2>About Me</h2>
        <p>
          Current Sophomore at Brown University studying mathematics & computer science. Interested in backend development, LLM integration, data science, computer vision, and designing/implementing the occasional pretty website (including this one).
        </p>
      </section>

      <section className="home-section">
        <h2>Projects</h2>
        <p>
          Shark Tracker - Display of tracking data for Great White Sharks of the coast of Guadalupe Island
        </p>
      </section>

      <section className="home-section">
        <h2>Contact Me</h2>
        <p>
          <u>Email:</u> yalisommer@gmail.com <br></br>
          <u>Linkedin</u>: <a href="https://www.linkedin.com/in/yalisommer/" target="_blank">www.linkedin.com/in/yalisommer</a>
        </p>
      </section>
    </div>
  );
}

export default Home;