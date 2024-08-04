'use client'
import { useState, useEffect } from 'react'
import { client, urlFor } from '../../client/client'
import './styles/projects.css'

const Project = () => {
  const [works, setWorks] = useState([])

  useEffect(() => {
    client
      .fetch('*[_type == "work"]')
      .then((data) => setWorks(data))
      .catch(console.error)
  }, [])
  return (
    <section className="projects section" id="work">
      <h2
        className="section_title"
        style={{ color: 'var(--title-color-dark)' }}
      >
        My Work
      </h2>
      <span className="section_subtitle">Some of my projects</span>
      <div className="projects_container container">
        <ul id="cards">
          {works.map((work: any) => (
            <li className="card" id={`card_${work.id}`} key={work._id}>
              <div className="card__content">
                <div>
                  <h2 className="work_title">{work.title}</h2>
                  <p className="work_description">{work.description}</p>
                  <p>
                    <a
                      href={work.source}
                      className="btn btn--accent"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SOURCE{' '}
                      <i className="fa-brands fa-square-github work_button-icon"></i>
                    </a>
                  </p>
                </div>
                <figure>
                  <img src={urlFor(work.image).url()} alt={work.title} />
                </figure>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* <p className="project_more">
                more projects on{' '}
                <a href="https://github.com/jacklvd" target={'_blank'}>
                    <span className="project_source">GitHub</span>
                </a>
            </p> */}
    </section>
  )
}

export default Project
